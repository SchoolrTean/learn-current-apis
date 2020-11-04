const ConnectionModel = require('../../../models/group/connectionModel');

const groupActivityNewDot = (teacherId, teacherName, groupId, groupName, schoolId, updateType, assignmentType) => {

      return new Promise((resolve, reject) => {

            let updateData = "";

            /**Home Work cannot be cancelled so here cancelled intimation Dot will be activated and new Acticvity Intimation Dot will also be activated */
            if (updateType == 1 && assignmentType != "HomeWork") {

                  updateData = {
                        $set: {
                              newDot: true,
                              cancelledDot: true
                        }
                  }

            } else {

                  /**Here only used for intimation of New Dot */
                  updateData = {

                        $set: {
                              newDot: true
                        }
                  }

            }

            ConnectionModel.updateMany({
                        groupId: groupId,
                        connectionStatus: 2
                  }, updateData)
                  .then(updated => {


                        let messageType = (updateType == 1) ? '2' : '1'; //2- modified Message 1- new message
                        let notificationSection = 1; //Homework

                        // Notification.sendAndSaveAssignmentNotification(teacherId, teacherName, groupId , groupName, schoolId, "Homework", messageType, notificationSection)
                        //        .then(done => {

                        resolve("done");

                        // })
                        // .catch(err => {

                        //        console.log(err);
                        //        reject(new Error('something bad happened'));

                        // })

                  })
                  .catch(err => {
                        console.log(err);
                        reject(new Error('something bad happened'));
                  })
      })

}

module.exports = groupActivityNewDot;