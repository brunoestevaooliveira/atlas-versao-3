const admin = require("firebase-admin");

// Garanta que o caminho para sua chave está correto
const serviceAccount = require("./santa-maria-ativa-firebase-adminsdk-fbsvc-65c8c38fa7.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// --- IMPORTANTE ---
// Pegue o UID do usuário no Firebase Console (na aba Authentication)
// E cole ele aqui:
const uid = "MJIR13WVHPccKgViVsJpFywXiWZ2";
// ------------------

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Sucesso! O usuário com UID ${uid} agora é um administrador.`);
    console.log("!!! Lembre-se de apagar este script e o arquivo da chave de serviço (service-account-key.json) por segurança !!!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro ao definir o custom claim:", error);
    process.exit(1);
  });
