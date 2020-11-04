const mongoose = require('mongoose');

const NoticationModel = require('../../models/notification/student/notificationModel');

var OtherAdmin = require("firebase-admin");

var serviceAccountTeacher = require("../../schoolrTeacher-serviceAccountKey.json");

// if (!OtherAdmin.apps.length) {
var OtherApp = OtherAdmin.initializeApp({
      credential: OtherAdmin.credential.cert(serviceAccountTeacher),
      databaseURL: "https://schoolrteacher.firebaseio.com"
}, 'other');

// }

const sendNotificaiton = (userId, notificationId, groupId, schoolId, messageTitle, message, notificationType, assignmentSection, payload, options) => {

      return new Promise((resolve, reject) => {

            const NotificationData = new NoticationModel({
                  _id: new mongoose.Types.ObjectId(),
                  userId,
                  groupId,
                  schoolId,
                  assignmentSection,
                  notificationType,
                  messageTitle,
                  message
            })

            NotificationData.save()
                  .then(done => {

                        OtherAdmin.messaging(OtherApp).sendToDevice(notificationId, payload, options)
                              .then((response) => {

                                    console.log(NotificationData);
                                    console.log(response.results[0].error);
                                    resolve(response);
                              })
                              .catch((error) => {
                                    reject(new Error('Something went wrong. Please try later..!!'));
                              });

                  })
                  .catch(err => {
                        console.log(err)
                        reject(new Error('Something went wrong. Please try later..!!'));
                  })


      });
}

module.exports = sendNotificaiton;

// const getTeacherNotificationId = (userId) => {

//       return new Promise((resolve, reject) => {

//             UserModel.findOne({
//                         _id: userId,
//                         isActive: true
//                   }, {
//                         name: 1,
//                         loginId: 1
//                   })
//                   .populate('loginId', "notificationId")
//                   .exec()
//                   .then(user => {

//                         console.log(user);

//                         resolve({
//                               "name": user.name,
//                               "notificationId": user.loginId.notificationId
//                         });
//                   })
//                   .catch(err => {
//                         console.log(err)
//                         reject(new Error('Something went wrong. Please try later..!!'));
//                   })

//       });
// }