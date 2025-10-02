// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// === RATE LIMITING HELPER ===
/**
 * Implementa rate limiting usando Firestore como storage
 * @param {string} functionName Nome da função para identificação
 * @param {string} uid UID do usuário
 * @param {number} maxCalls Número máximo de chamadas
 * @param {number} windowSeconds Janela de tempo em segundos
 * @returns {Promise<boolean>} true se permitido, false se excedeu o limite
 */
async function checkRateLimit(functionName, uid, maxCalls = 5, windowSeconds = 60) {
  try {
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    
    const rateLimitRef = admin.firestore().doc(`rateLimits/${uid}_${functionName}`);
    
    return await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      const data = doc.exists ? doc.data() : { calls: [], createdAt: now };
      
      // Remove chamadas antigas (fora da janela de tempo)
      const recentCalls = data.calls.filter(timestamp => timestamp > windowStart);
      
      // Verifica se excedeu o limite
      if (recentCalls.length >= maxCalls) {
        return false; // Rate limit exceeded
      }
      
      // Adiciona a nova chamada
      recentCalls.push(now);
      
      // Atualiza o documento
      transaction.set(rateLimitRef, {
        calls: recentCalls,
        lastCall: now,
        updatedAt: now,
        createdAt: data.createdAt || now
      });
      
      return true; // Chamada permitida
    });
  } catch (error) {
    console.error(`Erro no rate limiting para ${functionName}:`, error.code || error.message);
    // Em caso de erro, permita a chamada (fail-open)
    return true;
  }
}

/**
 * Limpa registros antigos de rate limit (função de limpeza)
 * Deve ser chamada periodicamente
 */
async function cleanupRateLimits() {
  try {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const snapshot = await admin.firestore()
      .collection('rateLimits')
      .where('updatedAt', '<', oneDayAgo)
      .limit(100)
      .get();
    
    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (!snapshot.empty) {
      await batch.commit();
      console.log(`Limpeza: ${snapshot.size} registros de rate limit removidos`);
    }
  } catch (error) {
    console.error('Erro na limpeza de rate limits:', error.code || error.message);
  }
}

// --- FUNÇÃO 1: Adicionar o papel de admin a um usuário ---
exports.addAdminRole = functions
  .runWith({
    // Limita memória e tempo de execução para economizar recursos
    memory: '128MB',
    timeoutSeconds: 30,
  })
  .https.onCall(async (data, context) => {
    // === VALIDAÇÕES DE SEGURANÇA ===
    
    // 1. Verifica se o usuário está autenticado
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Usuário não autenticado."
      );
    }

    // 2. Verifica rate limiting (máx 3 chamadas por minuto para esta função crítica)
    const isAllowed = await checkRateLimit('addAdminRole', context.auth.uid, 3, 60);
    if (!isAllowed) {
      console.warn(`Rate limit excedido para usuário ${context.auth.uid} em addAdminRole`);
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Muitas tentativas. Tente novamente em 1 minuto."
      );
    }

    // 3. Validação de entrada - email
    const userEmail = data?.email;
    if (!userEmail || typeof userEmail !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email é obrigatório e deve ser uma string."
      );
    }

    // 4. Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Formato de email inválido."
      );
    }

    // 5. Verificação dupla de admin (custom claim + documento Firestore)
    const isAdminByClaim = context.auth.token.admin === true;
    
    let isAdminByDoc = false;
    try {
      const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
      isAdminByDoc = userDoc.exists && userDoc.data()?.role === 'admin';
    } catch (docError) {
      console.error(`Erro ao verificar documento do usuário ${context.auth.uid}:`, docError.code || docError.message);
      // Continue com a verificação apenas por claim se houver erro no Firestore
    }

    // Usuário deve ser admin por pelo menos um dos métodos
    if (!isAdminByClaim && !isAdminByDoc) {
      console.warn(`Tentativa de acesso negado para usuário ${context.auth.uid} em addAdminRole`);
      throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas administradores podem adicionar outros administradores."
      );
    }

    // === LÓGICA PRINCIPAL ===
    try {
      // 6. Busca o usuário pelo email
      const user = await admin.auth().getUserByEmail(userEmail);
      
      // 7. Impede auto-promoção (usuário não pode se tornar admin)
      if (user.uid === context.auth.uid) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Não é possível alterar suas próprias permissões."
        );
      }

      // 8. Verifica se o usuário já é admin
      const existingClaims = user.customClaims || {};
      if (existingClaims.admin === true) {
        return {
          message: `O usuário ${userEmail} já é um administrador.`,
          alreadyAdmin: true,
        };
      }

      // 9. Define o custom claim 'admin: true'
      await admin.auth().setCustomUserClaims(user.uid, {
        ...existingClaims,
        admin: true
      });

      // 10. Atualiza também o documento no Firestore para consistência
      try {
        await admin.firestore().doc(`users/${user.uid}`).update({
          role: 'admin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          promotedBy: context.auth.uid,
        });
      } catch (firestoreError) {
        console.error(`Erro ao atualizar documento do usuário ${user.uid}:`, firestoreError.code || firestoreError.message);
        // Custom claim já foi definido, então não falhe completamente
      }

      // 11. Log de auditoria (sem informações sensíveis)
      console.log(`Admin ${context.auth.uid} promoveu usuário ${user.uid} para administrador`);
      
      return {
        message: `Sucesso! O usuário ${userEmail} agora é um administrador.`,
        promoted: true,
      };
      
    } catch (err) {
      // === TRATAMENTO DE ERROS SEGURO ===
      console.error(`Erro em addAdminRole para ${userEmail}:`, err.code || 'unknown', err.message ? err.message.substring(0, 100) : 'no message');
      
      // Mapeia erros específicos para mensagens seguras
      if (err.code === 'auth/user-not-found') {
        throw new functions.https.HttpsError(
          "not-found",
          "Usuário não encontrado com o email fornecido."
        );
      } else if (err.code === 'auth/invalid-email') {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Email fornecido é inválido."
        );
      } else if (err instanceof functions.https.HttpsError) {
        // Re-throw erros já tratados
        throw err;
      }
      
      // Para outros erros, retorna mensagem genérica
      throw new functions.https.HttpsError(
        "internal",
        "Erro interno do servidor. Tente novamente mais tarde."
      );
    }
  });


// --- FUNÇÃO 2: Marcar comentários feitos por admins em ocorrências ---
exports.tagAdminCommentsOnIssueUpdate = functions.firestore
    .document("issues/{issueId}")
    .onUpdate(async (change, context) => {
      const beforeData = change.before.data();
      const afterData = change.after.data();

      // === VALIDAÇÕES INICIAIS ===
      
      // 1. Verifica se há comentários válidos
      if (!afterData.comments || !Array.isArray(afterData.comments) || 
          !beforeData.comments || !Array.isArray(beforeData.comments)) {
        return null;
      }

      // 2. Se a lista não mudou ou diminuiu, não faz nada
      if (beforeData.comments.length >= afterData.comments.length) {
        return null;
      }

      // 3. Encontra o novo comentário (o último adicionado)
      const newComment = afterData.comments[afterData.comments.length - 1];

      // 4. Validações do novo comentário
      if (!newComment || typeof newComment !== 'object' || 
          newComment.authorRole || !newComment.authorId || 
          typeof newComment.authorId !== 'string') {
        return null;
      }

      // === LÓGICA PRINCIPAL ===
      try {
        // 5. Busca o registro do usuário
        const userRecord = await admin.auth().getUser(newComment.authorId);
        
        // 6. Verificação dupla de admin (custom claim + documento Firestore)
        const isAdminByClaim = userRecord.customClaims && userRecord.customClaims.admin === true;
        
        let isAdminByDoc = false;
        try {
          const userDoc = await admin.firestore().doc(`users/${newComment.authorId}`).get();
          isAdminByDoc = userDoc.exists && userDoc.data()?.role === 'admin';
        } catch (docError) {
          console.error(`Erro ao verificar documento do usuário ${newComment.authorId}:`, docError.code || docError.message);
          // Continue apenas com verificação por claim se houver erro no Firestore
        }
        
        // 7. Se o usuário é admin por qualquer método, marca o comentário
        if (isAdminByClaim || isAdminByDoc) {
           console.log(`Admin ${newComment.authorId} comentou na ocorrência ${context.params.issueId}`);
           
           // Cria uma cópia do comentário com a role marcada
           const updatedComment = {
             ...newComment,
             authorRole: 'admin',
             markedAt: admin.firestore.FieldValue.serverTimestamp(),
           };
           
           // Cria uma nova array de comentários com o comentário atualizado
           const updatedComments = [...afterData.comments];
           updatedComments[updatedComments.length - 1] = updatedComment;

           // 8. Atualiza o documento com o array modificado
           return change.after.ref.update({ 
             comments: updatedComments,
             lastAdminComment: admin.firestore.FieldValue.serverTimestamp(),
           });
        }
        
        return null;

      } catch (error) {
        // === TRATAMENTO DE ERROS SEGURO ===
        console.error(`Erro ao processar comentário na ocorrência ${context.params.issueId}:`, 
                     error.code || 'unknown', 
                     error.message ? error.message.substring(0, 100) : 'no message');
        
        // Não propaga erros para não quebrar o fluxo da aplicação
        // Em caso de erro, o comentário simplesmente não será marcado como admin
        return null;
      }
    });


// === FUNÇÃO 3: Limpeza periódica de registros de rate limiting ===
exports.cleanupRateLimitsScheduled = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    console.log('Iniciando limpeza de registros de rate limiting...');
    await cleanupRateLimits();
    console.log('Limpeza de rate limiting concluída.');
    return null;
  });
