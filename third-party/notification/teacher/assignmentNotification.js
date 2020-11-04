const SendNotification = require('../../../third-party/notification/teacher/sendNotificatoin')


// const selectAssignmentNotification


const AssignmentNotification = (studentId, studentNotificationId, groupId, transactionId, notificationTitle, notificationMessage, notificationType) => {

      return new Promise((resolve, reject) => {



            let options = {
                  priority: "high",
                  timeToLive: 60 * 60 * 24
            };

            let notificationSection = 1; // Join Request

            let payload = {
                  notification: {
                        title: notificationTitle,
                        body: notificationMessage
                  }
            };

            SendNotification.send(studentId, studentNotificationId, groupId, transactionId, notificationSection, notificationType, 1, notificationTitle, notificationMessage, payload, options)//1- Message Type Single 
                  .then((results) => {
                        resolve(1);
                  })
                  .catch((e) => {
                        console.log(e);
                        reject(new Error('Something went wrong. Please try later..!!'))
                  });

      });
}


module.exports = AssignmentNotification;