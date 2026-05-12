const admin = require("firebase-admin");

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://skripsi-healthdashboard-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

module.exports = db;