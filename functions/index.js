// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// --- FUNÇÃO 1: Adicionar o papel de admin a um usuário ---
exports.addAdminRole = functions.https.onCall(async (data, context) => {
  // Verifica se o usuário que está fazendo a chamada já é admin.
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas administradores podem adicionar outros administradores.",
    );
  }

  // Define o custom claim 'admin: true' para o UID informado.
  const userEmail = data.email;
  try {
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, {admin: true});
    return {
      message: `Sucesso! O usuário ${userEmail} agora é um administrador.`,
    };
  } catch (err) {
    console.error("Erro ao definir custom claim:", err);
    throw new functions.https.HttpsError("internal", err.message);
  }
});


// --- FUNÇÃO 2: Marcar comentários feitos por admins em ocorrências ---
exports.tagAdminCommentsOnIssueUpdate = functions.firestore
    .document("issues/{issueId}")
    .onUpdate(async (change, context) => {
      const beforeData = change.before.data();
      const afterData = change.after.data();

      // Se não há comentários ou a lista não mudou, não faz nada.
      if (!afterData.comments || beforeData.comments.length === afterData.comments.length) {
        return null;
      }

      // Encontra o novo comentário (o último adicionado)
      const newComment = afterData.comments[afterData.comments.length - 1];

      // Se o comentário já foi processado ou não tem autor, sai.
      if (newComment.authorRole || !newComment.authorId) {
        return null;
      }
      
      try {
        const userRecord = await admin.auth().getUser(newComment.authorId);
        
        // Verifica o custom claim e atualiza o comentário se o autor for admin
        if (userRecord.customClaims && userRecord.customClaims.admin === true) {
           console.log(`Usuário ${newComment.authorId} é admin. Marcando comentário na ocorrência ${context.params.issueId}.`);
           
           // Marca o comentário como sendo de um admin
           newComment.authorRole = 'admin';

           // Reescreve o array de comentários com a nova informação
           return change.after.ref.update({ comments: afterData.comments });
        }
        return null;

      } catch (error) {
        console.error("Erro ao verificar status de admin para o comentário:", error);
        return null;
      }
    });