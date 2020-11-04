var cron = require('node-cron');
const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const ScheduledAssignmentNotification = require('../../../../third-party/notification/teacher/sendScheduledAssignmetNotification');


cron.schedule('0 0 * * * *', () => {
      console.log('running a task every hour');

      let CurrentTimeStamp = new Date(new Date().setMinutes(new Date().getMinutes() + 390));
      console.log(CurrentTimeStamp);

      AssignmentModel.find({
            sentStatus: false,
            teacherDeleteAllStatus: false,
            teacherDeleteStatus: false,
            isActive: true,
            scheduledDateAndTime: {
                  $lte: new Date(CurrentTimeStamp)
            }
      }, {
            sectionType: 1,
            groupId: 1
      })
            .populate({
                  path: 'groupId',
                  select: 'grade section groupPic teacherId',
                  // populate: {
                  //       path: 'teacherId',
                  //       select: 'firstName surname _id notificationId',
                  // }
            })
            .populate({
                  path: 'teacherId',
                  select: 'firstName surName profilePic notificationId',
            })
            .exec()
            .then(ScheduledAssignments => {

                  console.log(ScheduledAssignments);

                  let sendAssignmentsArray = new Array();

                  for (let index = 0; index < ScheduledAssignments.length; index++) {
                        const assignment = ScheduledAssignments[index];

                        // let TeacherData = assignment.groupId.teacherId;
                        let TeacherData = assignment.teacherId;

                        let GroupName = assignment.groupId.section ? assignment.groupId.grade + " " + assignment.groupId.section : assignment.groupId.grade;

                        sendAssignmentsArray.push(ScheduledAssignmentNotification(TeacherData._id, TeacherData.notficationId, TeacherData.firstName, assignment.groupId._id, GroupName, assignment._id, assignment.sectionType))

                  }
                  Promise.all(sendAssignmentsArray).then(success => {
                        console.log(1);
                  }).catch(err => {
                        console.log(err);
                  })
            })
            .catch(err => {
                  console.log(err);

            })
});