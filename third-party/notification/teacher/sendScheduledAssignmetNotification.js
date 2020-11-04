const SendNotification = require('./sendNotificatoin')


/**
 *  Send Notification to teacher befire one hour of sending scheduled Assignment
 *   ************************* Parameters ************************
 *   assignmentId : assignment id of data sent
 *   assignmentType : Type of assignment i.e HomeWork, Taught In Class, Project etc
 */

const send = (teacherId, teacherNotificationId, teacherName, groupId, groupName, assignmentId, assignmentType) => {

      return new Promise((resolve, reject) => {

            if (teacherName && groupId && groupName && assignmentId && assignmentType) {


                  let notificationType = "1"; //Normal Notification

                  if (assignmentType == "HomeWork") {
                        assignmentType = "Home Work"
                  } else if (assignmentType == "ProjectWork") {
                        assignmentType = "Project Work"
                  }

                  let messageTitle = "Scheduled " + assignmentType + " of " + groupName + "Reminder";
                  let message = 'Hey ' + teacherName + ', Your Scheduled ' + assignmentType + ' will be pushed after 1 hr.';

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


                  SendNotification(teacherId, teacherNotificationId, groupId, assignmentId, notificationSection, notificationType, messageType, messageTitle, message, payload, options)
                        .then((results) => {
                              resolve(1);
                        })
                        .catch((e) => {
                              console.log(e);
                              reject(0)
                        });

            } else {
                  reject(0);
            }

      });
}

module.exports = send;