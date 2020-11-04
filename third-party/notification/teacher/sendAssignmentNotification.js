const SendNotification = require('./sendNotificatoin')
const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');


/** Connected Students of particular group */
const getConnectedStudents = (classId) => {

      return new Promise((resolve, reject) => {

            ClassStudentConnectionModel.find({
                        classId,
                        connectionStatus: 1,
                        isActive: true
                  }, {
                        studentId: 1,
                  })
                  .populate('studentId', 'notificationId firstName surName')
                  .exec()
                  .then(connections => {
                        resolve(connections);
                  })
                  .catch(err => {
                        console.log(err)
                        reject(0);
                  })

      });
}

/**
 *  Send Notification to all students for assignments
 *   ************************* Parameters ************************
 *   assignmentId : assignment id of data sent
 *   assignmentType : Type of assignment i.e HomeWork, Taught In Class, Project etc
 *   actionType : 1-New Homework 2-Modified 3-Deleted 4-Cancelled
 *   notificationSection : 1- Homework 2-Announcemnt 3-Project Work 4-Test 5-Taught In Class // Used in Notification saving and redirecting to specific section in app
 */

const send = (teacherName, groupId, groupName, assignmentId, assignmentType, actionType) => {

      return new Promise((resolve, reject) => {

            if (teacherName && groupId && groupName && assignmentId && assignmentType && actionType) {

                  getConnectedStudents(groupId)
                        .then(connections => {

                              console.log(connections);

                              let promiseAllArray = [];

                              if (connections.length > 0) {

                                    for (let index = 0; index < connections.length; index++) {

                                          const connection = connections[index];

                                          let messageTitle = "";
                                          let message = "";
                                          let notificationType = "1"; //Normal Notification

                                          switch (actionType) {

                                                case 1:
                                                      messageTitle = "New " + assignmentType + " from " + groupName;
                                                      message = 'Hey ' + connection.studentId.firstName + ', ' + teacherName + ' - ' + groupName + ' sent you ' + assignmentType;
                                                      break;

                                                case 2:
                                                      messageTitle = "Modified" //"Homework Modified from " + groupName;
                                                      message = 'Hey ' + connection.studentId.firstName + ', ' + teacherName + ' - ' + groupName + ' modified the ' + assignmentType;
                                                      break;

                                                case 3:
                                                      messageTitle = "Deleted" //"Homework Deleted from " + groupName;
                                                      message = 'Hey ' + connection.studentId.firstName + ', ' + teacherName + ' - ' + groupName + ' deleted the ' + assignmentType;
                                                      break;

                                                case 4:
                                                      notificationType = "2";
                                                      messageTitle = "Cancelled" //"Homework Cancelled from " + groupName;
                                                      message = 'Hey ' + connection.studentId.firstName + ', ' + teacherName + ' - ' + groupName + ' cancelled the ' + assignmentType;
                                                      break;

                                                default:
                                                      break;
                                          }

                                          let payload = {
                                                notification: {
                                                      title: messageTitle,
                                                      body: message,
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

                                          let notificationSection = 1; //Assignments
                                          let messageType = 1 // Single User Message

                                          promiseAllArray.push(SendNotification(connection.studentId._id, connection.studentId.notificationId, groupId, assignmentId, notificationSection, notificationType, messageType, messageTitle, message, payload, options))

                                    }

                                    Promise.all(promiseAllArray)
                                          .then((results) => {
                                                resolve(1);
                                          })
                                          .catch((e) => {
                                                console.log(e);
                                                reject(0)
                                          });
                              } else {

                                    reject(0)
                              }
                        })
                        .catch(err => {
                              console.log(err)
                              reject(0);
                        })

            } else {
                  reject(0);
            }

      });
}

module.exports = send;