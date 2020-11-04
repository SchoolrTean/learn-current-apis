const TeacherModel = require('../../../models/authentication/teacherModel');

const SendTeacherNotification = require('../../../third-party/notification/sendNotificationToTeacher')


const GroupTransferNotification = (mobileNo, groupId, transactionId, teacherName, groupName) => {

      return new Promise((resolve, reject) => {

            TeacherModel.findOne({
                        mobileNo,
                        isActive: true
                  }, {
                        name: 1,
                        notificationId: 1
                  })
                  .exec()
                  .then(TransferTeacher => {

                        let options = {
                              priority: "high",
                              timeToLive: 60 * 60 * 24
                        };

                        let notificationTitle = "Tansfer Request"
                        let notificationMessage = `Hey ${TransferTeacher.name}, ${teacherName} has transferred you ${groupName}`;

                        let NotificationType = "3"; //Transfer Request
                        let notificationSection = 7; // Join Request

                        let payload = {
                              notification: {
                                    title: notificationTitle,
                                    body: notificationMessage
                              }
                        };


                        SendTeacherNotification.send(TransferTeacher._id, TransferTeacher.notificationId, groupId, transactionId, notificationTitle, notificationMessage, NotificationType, notificationSection, payload, options)
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

module.exports = GroupTransferNotification;