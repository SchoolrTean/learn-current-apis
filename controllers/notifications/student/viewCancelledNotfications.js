const VerifyStudent = require('../../../middleware/verifyStudent');
const NotificationModel = require('../../../models/notification/student/notificationModel');

// const connectionRequestDetails = require('../../group/student/connectionRequestDetails');
const mongoose = require('mongoose');

mongoose.set('debug', true);

const all = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            VerifyStudent(studentId, "")
                  .then(response => {

                        console.log(response);

                        if (response && response.statusCode == 1) {

                              let query = {
                                    userId: studentId,
                                    notificationType: 2, //Cancelled Notification
                                    isActive: true,
                              }

                              if (req.params.lastNotificationId) {

                                    query._id = {
                                          $lt: req.params.lastNotificationId
                                    }

                              }

                              console.log(query);

                              NotificationModel.find(query).exec()
                                    .then(async notifications => {

                                          console.log(notifications);

                                          if (notifications.length > 0) {

                                                let notificationArray = new Array();

                                                for (let index = 0; index < notifications.length; index++) {
                                                      const notification = notifications[index];

                                                      // let getConnectionDetails = {};
                                                      // 
                                                      // if (notification.notificationType == 3) {
                                                      //       getConnectionDetails = await connectionRequestDetails(notification.transactionId)
                                                      // }

                                                      notificationArray.push({
                                                            groupId: notification.groupId,
                                                            transactionId: notification.transactionId,
                                                            notificationType: notification.notificationType,
                                                            notificationSection: notification.notificationSection,
                                                            messageTitle: notification.messageTitle,
                                                            // connectionDetails: [getConnectionDetails],
                                                            message: notification.message,

                                                      })

                                                }

                                                return res.status(200).json({
                                                      "statusCode": "1",
                                                      "notifications": notificationArray,
                                                      "message": "Data Found...!!"
                                                })


                                          } else {

                                                return res.status(200).json({
                                                      "statusCode": "1",
                                                      "notifications": [],
                                                      "message": "No Notifications...!!"
                                                })

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                "statusCode": "0",
                                                "message": "Soomething Went Wrong. Please Try Later...!!"
                                          })
                                    })

                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: response.message
                              });

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: 'Soomething Went Wrong. Please Try Later...!!'
                        });

                  })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = all;