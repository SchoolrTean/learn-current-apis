var cron = require('node-cron');
const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const AssignmentNotification = require('../../../../third-party/notification/teacher/sendAssignmentNotification');
const ActiveStudents = require('../../../group/teacher/connectedStudentsList');


const updateAndSendNotification = (teacherName, groupId, groupName, assignmentId, assignmentType) => {

      return new Promise(async (resolve, reject) => {

            let activeStudentIds = await ActiveStudents(groupId, 1)
            let CurrentTimeStamp =  new Date(new Date().setMinutes(new Date().getMinutes() + 330));

            AssignmentModel.updateOne({
                        _id: assignmentId
                  }, {
                        $set: {
                              lastActionTimeStamp : CurrentTimeStamp,
                              date : CurrentTimeStamp,
                              activeStudentIds,
                              sentStatus: true
                        }
                  })
                  .exec()
                  .then(updated => {

                        if (assignmentType == "HomeWork") {
                              assignmentType = "Home Work"
                        } else if (assignmentType == "ProjectWork") {
                              assignmentType = "Project Work"
                        }


                        AssignmentNotification(teacherName, groupId, groupName, assignmentId, assignmentType, 1) //actionType
                              .then(success => {
                                    resolve(1);
                              })
                              .catch(err => {
                                    console.log(err);
                                    reject(0);
                              })

                  })
                  .catch(err => {
                        console.log(err);
                        reject(0);
                  })


      })

}


cron.schedule('0 0 * * * *', () => {
      console.log('running a task every hour');

      let CurrentTimeStamp = new Date(new Date().setMinutes(new Date().getMinutes() + 330));
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
                  //       select: 'firstName surname _id',
                  // }
            })
            .exec()
            .then(ScheduledAssignments => {

                  console.log(ScheduledAssignments);

                  let sendAssignmentsArray = new Array();

                  for (let index = 0; index < ScheduledAssignments.length; index++) {
                        const assignment = ScheduledAssignments[index];

                        // let TeacherName = assignment.groupId.teacherId.firstName;
                        let TeacherName = "Teacher name";

                        let GroupName = assignment.groupId.section ? assignment.groupId.grade + " " + assignment.groupId.section : assignment.groupId.grade;

                        sendAssignmentsArray.push(updateAndSendNotification(TeacherName, assignment.groupId._id, GroupName, assignment._id, assignment.sectionType))

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