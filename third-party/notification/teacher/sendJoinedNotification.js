const StudentModel = require('../../../models/authentication/userModel');

const SendNotification = require('./sendNotificatoin')


const SendjoinedNotification = (StudentId, groupId, transactionId, teacherName, groupName, newChild) => {

      return new Promise((resolve, reject) => {

            StudentModel.findOne({
                        _id: StudentId,
                        type: true, //Student
                        isActive: true
                  }, {
                        firstName: 1,
                        surName : 1,
                        notificationId: 1
                  })
                  .exec()
                  .then(student => {

                        let notificationSection = 7; // Join Request
                        let notificationType = 1;
                        let messageType = 1; //Normal Message

                        let notificationTitle = "New Connection"
                        let notificationMessage = newChild ? `New Child ${student.firstName} ${student.surName}, Has Added You to ${groupName} by ${teacherName} ` : `Hey ${student.firstName} ${student.lastName}, ${teacherName} has Added You to ${groupName}`;

                        let payload = {
                              notification: {
                                    title: notificationTitle,
                                    body: notificationMessage
                              }
                        };

                        let options = {
                              priority: "high",
                              timeToLive: 60 * 60 * 24
                        };

                        SendNotification(student._id, student.notificationId, groupId, transactionId, notificationSection, notificationType, messageType, notificationTitle, notificationMessage, payload, options)
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

      });
}

module.exports = SendjoinedNotification;