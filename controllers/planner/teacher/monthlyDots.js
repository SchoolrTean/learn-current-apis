const AssignmentModel = require('../../../models/assignment/assignmentModel');

const VerifyTeacher = require('../../../middleware/verifyTeacher');

// const GroupList = require('../../group/teacher/activeGroupsList');

const PersonalEventModel = require('../../../models/planner/personalEventsModel');

const TeacherConnectedSubjectWiseClassList = require('../../group/teacher/teacherConnectedSubjectWiseClassList')


const monthlyDots = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            let date = req.params.date;

            VerifyTeacher(teacherId, "", async (error, response) => {

                  if (response && response.statusCode != "0") {

                        TeacherConnectedSubjectWiseClassList(teacherId, ["ProjectWork", "Test", "HomeWork", "Class"], 1)
                              .then(async TeacherClassWiseSubjects => {

                                    if (TeacherClassWiseSubjects != 0 && Array.isArray(TeacherClassWiseSubjects) && TeacherClassWiseSubjects.length > 0) {

                                          let selectedDate = "";

                                          if (date) {
                                                selectedDate = new Date(date);
                                          } else {
                                                selectedDate = new Date();
                                          }

                                          let nextMonth = (selectedDate.getUTCMonth() + 2) < 10 ? "0" + String(selectedDate.getUTCMonth() + 2) : (selectedDate.getUTCMonth() + 2) > 12 ? "01" : selectedDate.getUTCMonth() + 2;

                                          let nextYear = (selectedDate.getUTCMonth() + 1) == 12 ? selectedDate.getFullYear() + 1 : selectedDate.getFullYear();

                                          let formattedNextMonth = new Date(nextYear + '-' + nextMonth + '-01T00:00:00.000Z');

                                          let currentMonth = (selectedDate.getUTCMonth() + 1) < 10 ? "0" + String(selectedDate.getUTCMonth() + 1) : selectedDate.getUTCMonth() + 1;

                                          let formattedCurrentMonth = new Date(selectedDate.getFullYear() + '-' + currentMonth + '-01T00:00:00.000Z');


                                          let Assignments = AssignmentModel.find({
                                                $or: TeacherClassWiseSubjects,
                                                // teacherId,
                                                eventDate: {
                                                      $gte: new Date(formattedCurrentMonth),
                                                      $lt: new Date(formattedNextMonth)
                                                },
                                                teacherDeleteAllStatus: false,
                                                teacherDeleteStatus: false,
                                                sentStatus: true,
                                                isActive: true,
                                          }, {
                                                "groupId": 1,
                                                "sectionType": 1,
                                                "subject": 1,
                                                "title": 1,
                                                "eventDate": 1,
                                                "duration": 1,
                                                "cancelStatus": 1,
                                                "date": 1,
                                          })


                                          let personalEvents = PersonalEventModel.find({
                                                userId: teacherId,
                                                eventStartTimestamp: {
                                                      $gte: new Date(formattedCurrentMonth),
                                                      $lt: new Date(formattedNextMonth)

                                                },
                                                isActive: true
                                          }, {
                                                title: 1,
                                                eventStartTimestamp: 1,
                                                eventEndTimestamp: 1,
                                                reminder: 1,
                                                reminderNote: 1,
                                                date: 1
                                          })

                                          Promise.all([Assignments, personalEvents])
                                                .then(allEvents => {

                                                      console.log(allEvents);

                                                      let allEventsArray = new Array();


                                                      if (allEvents[0].length > 0) {

                                                            allEvents[0].map(assignmentRecord => {

                                                                  allEventsArray.push({
                                                                        eventType: assignmentRecord.sectionType,
                                                                        eventDate: assignmentRecord.eventDate,
                                                                        cancelStatus: assignmentRecord.cancelStatus
                                                                  })

                                                            });

                                                      }


                                                      if (allEvents[1].length > 0) {
                                                            allEvents[1].forEach(personalEvent => {
                                                                  allEventsArray.push({
                                                                        eventType: "Personal Event",
                                                                        eventDate: personalEvent.eventStartTimestamp,
                                                                        cancelStaus: false
                                                                  })
                                                            });
                                                      }


                                                      return res.status(200).json({
                                                            statusCode: "1",
                                                            monthlyDotsList: allEventsArray,
                                                            message: "Data Found..!!"
                                                      })

                                                })
                                                .catch(err => {
                                                      console.log(err);

                                                      return res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Something went wrong. Please try again..!!"
                                                      })

                                                })


                                    } else {

                                          res.status(200).json({
                                                statusCode: "0",
                                                TestCount: 0,
                                                AssignmentCount: 0,
                                                ClassCount: 0,
                                                EventCount: 0,
                                                feedData: [],
                                                addOption: "false",
                                                message: "No Classes...!!"
                                          })

                                    }
                              })
                              .catch(err => {
                                    console.log(err);

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. Please try again..!!"
                                    })
                              })

                  } else {

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied..!!"
                        });

                  }
            })

      } else {

            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });

      }
}

module.exports = monthlyDots;




// $or: [{

// }, {
//       eventStartTimestamp: {
//             $gte: new Date(formattedCurrentMonth),
//             $lt: new Date(formattedNextMonth)

//       }
// }],


// groupId: {
//       $in: groupList
// },

// if (allEvents[1].length > 0) {
//       allEvents[1].forEach(assignmentRecord => {

//             allEventsArray.push({
//                   eventType: assignmentRecord.sectionType,
//                   eventDate: assignmentRecord.sectionType == "Announcement" ? assignmentRecord.announcement.eventDate : assignmentRecord.projectWork.eventDate,
//                   cancelStaus: assignmentRecord.cancelStatus
//             })
//       });
// }