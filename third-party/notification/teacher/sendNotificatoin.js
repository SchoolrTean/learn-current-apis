const mongoose = require('mongoose');
const admin = require("firebase-admin");

const NoticationModel = require('../../../models/notification/student/notificationModel');
var serviceAccountStudent = require("../../../schoolrStudent-serviceAccountKey.json");

if (!admin.apps.length) {

      admin.initializeApp({
            credential: admin.credential.cert(serviceAccountStudent),
            databaseURL: "https://schoolrstudent.firebaseio.com"
      });

}

const send = (userId, notificationId, groupId, transactionId, notificationSection, notificationType, messageType, messageTitle, message, payload, options) => {

      return new Promise((resolve, reject) => {

            const NotificationData = new NoticationModel({
                  _id: new mongoose.Types.ObjectId(),
                  userId,
                  groupId,
                  transactionId,
                  notificationSection,
                  notificationType,
                  messageType,
                  messageTitle,
                  message,
            })

            NotificationData.save()
                  .then(done => {

                        console.log(done);
                        resolve(done);

                        // admin.messaging().sendToDevice(notificationId, payload, options)
                        //       .then((response) => {

                        //             console.log(NotificationData);
                        //             resolve(response);
                        //       })
                        //       .catch((error) => {
                        //             reject(new Error('Something went wrong. Please try later..!!'));
                        //       });

                  })
                  .catch(err => {
                        console.log(err)
                        reject(new Error('Something went wrong. Please try later..!!'));
                  })


      });
}

module.exports = send