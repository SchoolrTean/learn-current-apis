const mongoose = require('mongoose');

const NoticationModel = require('../models/common/notificationModel');
const ConnectionModel = require('../models/common/connection');
const UserModel = require('../models/common/user');

var admin = require("firebase-admin");

var serviceAccountStudent = require("../schoolrStudent-serviceAccountKey.json");

if (!admin.apps.length) {
     admin.initializeApp({
          credential: admin.credential.cert(serviceAccountStudent),
          databaseURL: "https://schoolrstudent.firebaseio.com"
     });
}

const getConnectedStudents = (groupId) => { //, teacherId = null

     return new Promise((resolve, reject) => {

          ConnectionModel.find({
                    groupId,
                    connectionStatus: 2,
                    isActive: true
               }, {
                    studentId: 1,
               })
               .populate({
                    path: 'studentId',
                    populate: {
                         path: 'loginId'
                    }
               })
               .exec()
               .then(connections => {
                    resolve(connections);
               })
               .catch(err => {
                    console.log(err)
                    reject(new Error('Something went wrong. Please try later..!!'));
               })

     });
}




const getStudentNotificationId = (userId) => {

     return new Promise((resolve, reject) => {

          UserModel.findOne({
                    _id: userId,
                    isActive: true
               }, {
                    name: 1,
                    loginId: 1
               })
               .populate('loginId', "notificationId")
               .exec()
               .then(user => {
                    resolve({
                         "name": user.name,
                         "notificationId": user.loginId.notificationId
                    });
               })
               .catch(err => {
                    console.log(err)
                    reject(new Error('Something went wrong. Please try later..!!'));
               })

     });
}


const sendjoinLinkNotificatoin = (mobileNo) => {

     return new Promise((resolve, reject) => {

          UserModel.findOne({
                    _id: userId,
                    isActive: true
               }, {
                    name: 1,
                    loginId: 1
               })
               .populate('loginId', "notificationId")
               .exec()
               .then(user => {
                    resolve({
                         "name": user.name,
                         "notificationId": user.loginId.notificationId
                    });
               })
               .catch(err => {
                    console.log(err)
                    reject(new Error('Something went wrong. Please try later..!!'));
               })

     });
}



const sendNotificaiton = (notificationId, payload, options, groupId, schoolId, messageTitle, message, notificationType, userId, assignmentSection) => {

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

                    admin.messaging().sendToDevice(notificationId, payload, options)
                         .then((response) => {

                              console.log(NotificationData);
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




/**
 *  Send Notification to all students for assignments
 *   ************************* Parameters ************************
 *   assignmentId : assignment id of data sent
 *   assignmentType : Type of assignment i.e HomeWork, Taught In Class, Project etc
 *   messageType : 1-New Homework 2-Modified 3-Deleted 4-Cancelled
 *   notificationSection : 1- Homework 2-Announcemnt 3-Project Work 4-Test 5-Taught In Class // Used in Notification saving and redirecting to specific section in app
 */
exports.sendAndSaveAssignmentNotification = (teacherId, teacherName, groupId, groupName, assignmentId, assignmentType, messageType, notificationSection) => {

     return new Promise((resolve, reject) => {

          // console.log(teacherId + ',' + teacherName + ',' + groupId + ',' + groupName + ',' + assignmentType + ',' + assignmentId + ',' + messageType);

          if (teacherId && groupId && teacherName && groupName && assignmentId && assignmentType && messageType && notificationSection) {

               getConnectedStudents(groupId)
                    .then(connections => {

                         let promiseAll = [];
                         // let studentList = [];

                         for (let index = 0; index < connections.length; index++) {

                              const connection = connections[index];

                              let notificationMessage = "";
                              let notificationTitle = "";
                              let NotificationType = "1";

                              switch (messageType) {
                                   case '1':
                                        notificationTitle = "New " + assignmentType + " from " + groupName;
                                        notificationMessage = 'Hey ' + connection.studentId.name + ', ' + teacherName + ' - ' + groupName + ' sent you ' + assignmentType;
                                        break;

                                   case '2':
                                        notificationTitle = "Modified" //"Homework Modified from " + groupName;
                                        notificationMessage = 'Hey ' + connection.studentId.name + ', ' + teacherName + ' - ' + groupName + ' modified the ' + assignmentType;
                                        break;

                                   case '3':
                                        notificationTitle = "Deleted" //"Homework Deleted from " + groupName;
                                        notificationMessage = 'Hey ' + connection.studentId.name + ', ' + teacherName + ' - ' + groupName + ' deleted the ' + assignmentType;
                                        break;

                                   case '4':
                                        NotificationType = "2";
                                        notificationTitle = "Cancelled" //"Homework Cancelled from " + groupName;
                                        notificationMessage = 'Hey ' + connection.studentId.name + ', ' + teacherName + ' - ' + groupName + ' cancelled the ' + assignmentType;
                                        break;

                                   default:
                                        break;
                              }

                              let payload = {
                                   notification: {
                                        title: notificationTitle,
                                        body: notificationMessage,
                                        //id: String(connection.studentId._id),
                                   }
                                   // ,
                                   // data: {
                                   //      id: String(connection.studentId._id),
                                   // }
                              };

                              let options = {
                                   priority: "high",
                                   timeToLive: 60 * 60 * 24
                              };

                              promiseAll.push(sendNotificaiton(connection.studentId.loginId.notificationId, payload, options, groupId, assignmentId, notificationTitle, notificationMessage, NotificationType, connection.studentId._id, notificationSection))

                         }

                         Promise.all(promiseAll)
                              .then((results) => {
                                   resolve(1);
                              })
                              .catch((e) => {
                                   console.log(e);
                                   reject(new Error('Something went wrong. Please try later..!!'))
                              });

                    })
                    .catch(err => {
                         console.log(err)
                         reject(new Error('Something went wrong. Please try later..!!'));
                    })

          } else {
               reject(new Error('All fields mandatory...!!'));
          }

     });
}




/**
 *  Send Notification to all students for assignments
 *   ************************* Parameters ************************
 *   questionId : id of question that was saved
 *   messageType : 1 - Question Sent 2 - Answered some other user posted Question 3-Deleted Question
 *   userId is dependent on messageType messagetype :- 1,2 userId is question raised userId  3 - answeredUserId
 */
exports.sendAndSaveMindBoxNotification = (userId, groupId, questionId, messageType) => {

     return new Promise((resolve, reject) => {


          if (userId && groupId && questionId && messageType) {

               console.log(messageType)

               if (messageType == 1) {

                    getConnectedStudents(groupId)
                         .then(connections => {

                              let promiseAll = [];

                              for (let index = 0; index < connections.length; index++) {

                                   const connection = connections[index];

                                   let NotificationType = "1";
                                   let notificationSection = 6; // Mind Box

                                   let notificationTitle = "New Question";
                                   let notificationMessage = 'Hey ' + connection.studentId.name + ', You have a New Question in your Mind Box';


                                   let payload = {
                                        notification: {
                                             title: notificationTitle,
                                             body: notificationMessage,
                                        }
                                   };

                                   let options = {
                                        priority: "high",
                                        timeToLive: 60 * 60 * 24
                                   };

                                   if (String(connection.studentId._id) != String(userId)) {
                                        promiseAll.push(sendNotificaiton(connection.studentId.loginId.notificationId, payload, options, groupId, questionId, notificationTitle, notificationMessage, NotificationType, connection.studentId._id, notificationSection))
                                   }


                              }

                              Promise.all(promiseAll)
                                   .then((results) => {
                                        resolve(1);
                                   })
                                   .catch((e) => {
                                        console.log(e);
                                        reject(new Error('Something went wrong. Please try later..!!'))
                                   });
                         })
                         .catch(err => {
                              console.log(err)
                              reject(new Error('Something went wrong. Please try later..!!'));
                         })

               } else if (messageType == 2 || messageType == 3 || messageType == 4 || messageType == 5 || messageType == 6) {

                    getStudentNotificationId(userId)
                         .then(userDetails => {
                              console.log(userDetails);

                              let NotificationType = "1";
                              let notificationSection = 6; // Mind Box

                              let notificationMessage = "";
                              let notificationTitle = "";

                              switch (messageType) {
                                   case 2:
                                        notificationTitle = "Mind Box"
                                        notificationMessage = "Hey " + userDetails.name + ", New Answer for your Posted Question"
                                        break;

                                   case 3:
                                        notificationTitle = "Deleted Question"
                                        notificationMessage = "Hey " + userDetails.name + ", Your Question was Deleted by Teacher"
                                        break;

                                   case 4:
                                        notificationTitle = "Deleted Answer"
                                        notificationMessage = "Hey " + userDetails.name + ", Your Answer was Deleted by Teacher"
                                        break;

                                   case 5:
                                        notificationTitle = "Coined"
                                        notificationMessage = "Hey " + userDetails.name + ", Your Answer was Coined by Teacher"
                                        break;

                                   default:
                                        break;
                              }


                              let payload = {
                                   notification: {
                                        title: notificationTitle,
                                        body: notificationMessage
                                   }
                              };

                              console.log(payload);

                              let options = {
                                   priority: "high",
                                   timeToLive: 60 * 60 * 24
                              };

                              sendNotificaiton(userDetails.notificationId, payload, options, groupId, questionId, notificationTitle, notificationMessage, NotificationType, userId, notificationSection)
                                   .then((results) => {
                                        resolve(1);
                                   })
                                   .catch((e) => {
                                        console.log(e);
                                        reject(new Error('Something went wrong. Please try later..!!'))
                                   });

                         })

               } else {
                    reject(new Error('Something went wrong. Please try later..!!'))
               }

          } else {
               reject(new Error('All fields mandatory...!!'));
          }
     });
}