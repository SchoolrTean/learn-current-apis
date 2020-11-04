var admin = require("firebase-admin");

var serviceAccountStudent = require("../schoolrStudent-serviceAccountKey.json");

if (!admin.apps.length) {

      admin.initializeApp({
            credential: admin.credential.cert(serviceAccountStudent),
            databaseURL: "https://schoolrstudent.firebaseio.com"
      });

}