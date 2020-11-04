const StudentModel = require('../../../models/authentication/userModel');

const SendNotification = require('../../../third-party/notification/teacher/sendNotificatoin')


const SendjoinLinkNotification = (mobileNo, groupId, transactionId, teacherName, groupName) => {

      return new Promise((resolve, reject) => {

            StudentModel.findOne({
                        mobileNo,
                        isActive: true
                  }, {
                        name: 1,
                        notificationId: 1
                  })
                  .exec()
                  .then(student => {

                        let options = {
                              priority: "high",
                              timeToLive: 60 * 60 * 24
                        };

                        let notificationTitle = "Connection Request"
                        let notificationMessage = `Hey ${student.name} ${teacherName} is Adding You to ${groupName}`;

                        let NotificationType = "3";
                        let notificationSection = 7; // Join Request

                        let payload = {
                              notification: {
                                    title: notificationTitle,
                                    body: notificationMessage
                              }
                        };


                        SendNotification.send(student._id, student.notificationId, groupId, transactionId, notificationTitle, notificationMessage, NotificationType, notificationSection, payload, options)
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

module.exports = SendjoinLinkNotification;