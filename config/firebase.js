const admin = require("firebase-admin");
const serviceAccount = require("../events-map-f3384-firebase-adminsdk-fbsvc-7bc3cab05d.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db, admin };
