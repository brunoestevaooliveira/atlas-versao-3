/**
 * @fileoverview Cloud Functions for Firebase.
 * Este arquivo contém as funções de backend que rodam no ambiente do Firebase.
 * - addAdminRole: Uma função "callable" que permite que um admin existente
 *   promova outro usuário para o papel de admin, definindo um Custom Claim.
 * - tagAdminCommentsOnIssueUpdate: Um trigger do Firestore que é disparado
 *   sempre que um documento na coleção 'issues' é atualizado. Ele verifica se
 *   um novo comentário foi adicionado por um admin e, em caso afirmativo,
 *   adiciona uma tag 'authorRole: "admin"' a esse comentário.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o SDK Admin do Firebase para permitir que as funções interajam
// com outros serviços do Firebase com privilégios de administrador.
admin.initializeApp();

/**
 * Adiciona o papel (role) de 'admin' a um usuário através de Custom Claims.
 * Esta é uma "Callable Function", o que significa que pode ser chamada diretamente
 * pelo código do cliente (frontend) como se fosse uma função local.
 *
 * @param {object} data - O objeto de dados enviado pelo cliente. Deve conter `data.email`.
 * @param {object} context - O contexto da chamada, incluindo informações de autenticação.
 * @returns {Promise<{message: string}>} Uma mensagem de sucesso.
 * @throws {functions.https.HttpsError} - Lança um erro se a permissão for negada
 * ou se ocorrer um erro interno.
 */
exports.addAdminRole = functions.https.onCall(async (data, context) => {
  // --- Verificação de Segurança ---
  // Garante que o usuário que está fazendo a chamada já é um administrador.
  // A propriedade 'admin' vem dos Custom Claims do token de autenticação.
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas administradores podem adicionar outros administradores.",
    );
  }

  // Obtém o email do usuário a ser promovido a partir dos dados da chamada.
  const userEmail = data.email;
  try {
    // Busca o registro do usuário pelo email.
    const user = await admin.auth().getUserByEmail(userEmail);
    // Define o Custom Claim 'admin: true' para o UID do usuário encontrado.
    // Isso adicionará a claim ao token de ID do usuário na próxima vez que ele for atualizado.
    await admin.auth().setCustomUserClaims(user.uid, {admin: true});
    
    // Retorna uma mensagem de sucesso para o cliente.
    return {
      message: `Sucesso! O usuário ${userEmail} agora é um administrador.`,
    };
  } catch (err) {
    console.error("Erro ao definir custom claim:", err);
    throw new functions.https.HttpsError("internal", err.message);
  }
});


/**
 * Marca automaticamente comentários feitos por administradores.
 * Este é um "Firestore Trigger" que é executado sempre que um documento
 * na coleção 'issues' é atualizado.
 *
 * @param {functions.Change} change - Um objeto que contém os dados do documento
 * antes (`change.before`) e depois (`change.after`) da atualização.
 * @param {functions.EventContext} context - O contexto do evento, incluindo
 * parâmetros de wildcard da rota (como o `issueId`).
 * @returns {Promise<null|void>} - Retorna `null` se nenhuma ação for necessária,
 * ou uma promessa que se resolve quando a atualização do documento é concluída.
 */
exports.tagAdminCommentsOnIssueUpdate = functions.firestore
    .document("issues/{issueId}")
    .onUpdate(async (change, context) => {
      // Obtém os dados do documento antes e depois da atualização.
      const beforeData = change.before.data();
      const afterData = change.after.data();

      // --- Verificações de Saída Rápida ---
      // Se não há comentários ou o número de comentários não mudou, não faz nada.
      if (!afterData.comments || beforeData.comments.length === afterData.comments.length) {
        return null;
      }

      // Encontra o novo comentário (supõe-se que seja o último adicionado).
      const newComment = afterData.comments[afterData.comments.length - 1];

      // Se o comentário já tem um 'authorRole' definido ou não tem um 'authorId',
      // significa que já foi processado ou é inválido, então sai.
      if (newComment.authorRole || !newComment.authorId) {
        return null;
      }
      
      try {
        // Usa o SDK Admin para buscar o registro de usuário do autor do comentário.
        const userRecord = await admin.auth().getUser(newComment.authorId);
        
        // Verifica se o usuário tem o Custom Claim 'admin' definido como true.
        if (userRecord.customClaims && userRecord.customClaims.admin === true) {
           console.log(`Usuário ${newComment.authorId} é admin. Marcando comentário na ocorrência ${context.params.issueId}.`);
           
           // Adiciona a propriedade 'authorRole' ao objeto do novo comentário.
           newComment.authorRole = 'admin';

           // Atualiza o documento no Firestore com o array de comentários modificado.
           // `change.after.ref` é uma referência ao documento que foi atualizado.
           return change.after.ref.update({ comments: afterData.comments });
        }
        // Se o usuário não for admin, não faz nada.
        return null;

      } catch (error) {
        console.error("Erro ao verificar status de admin para o comentário:", error);
        return null;
      }
    });
