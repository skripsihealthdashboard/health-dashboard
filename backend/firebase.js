const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Railway / cloud
  serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );
} else {
  // Local Linux
  serviceAccount = require("./serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://skripsi-healthdashboard-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

module.exports = db;