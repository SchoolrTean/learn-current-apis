const AssignmentModel = require('../../../models/assignment/assignmentModel');

const VerifyTeacher = require('../../../middleware/verifyTeacher');

const GroupList = require('../../group/teacher/activeGroupsList');

const PersonalEventModel = require('../../../models/planner/personalEventsModel');

const TeacherConnectedSubjectWiseClassList = require('../../group/teacher/teacherConnectedSubjectWiseClassList')


module.exports = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            let date = req.params.date;

            VerifyTeacher(teacherId, "", async (error, response) => {

                  if (response && response.statusCode != "0") {

                        TeacherConnectedSubjectWiseClassList(teacherId, [ "Test", "Class"]) //"ProjectWork","HomeWork", 
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
                                                // teacherId,
                                                $or: TeacherClassWiseSubjects,
                                                teacherDeleteAllStatus: false,
                                                teacherDeleteStatus: false,
                                                eventDate: {
                                                      $gte: new Date(formattedCurrentMonth),
                                                      $lt: new Date(formattedNextMonth)
                                                },
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
                                                .sort({
                                                      eventDate: 1
                                                })
                                                .populate({
                                                      path: 'groupId',
                                                      select: 'grade section groupPic groupName',
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
                                                .sort({
                                                      eventStartTimestamp: 1
                                                })


                                          Promise.all([Assignments, personalEvents])
                                                .then(allEvents => {

                                                      console.log(allEvents);

                                                      console.log(allEvents);

                                                      let calendarData = new Array();

                                                      if (allEvents[0].length > 0) {

                                                            allEvents[0].map(assignmentRecord => {

                                                                  let remDate = assignmentRecord.date

                                                                  let splitedDate = remDate.toString().split(' ');
                                                                  let splitTimestamp = splitedDate[4].split(':');

                                                                  let endDate = "";
                                                                  let completedStatus = false;
                                                                  let startDate = "";

                                                                  if (assignmentRecord.duration) {
                                                                        startDate = assignmentRecord.eventDate;
                                                                        endDate = new Date(assignmentRecord.eventDate)
                                                                        endDate.setMinutes(endDate.getMinutes() + parseInt(assignmentRecord.duration));
                                                                  } else {
                                                                        startDate = assignmentRecord.eventDate;
                                                                        startDate.setMinutes(startDate.getMinutes() + 600)
                                                                        endDate = new Date(assignmentRecord.eventDate)
                                                                        endDate.setMinutes(endDate.getMinutes() + 60);
                                                                  }

                                                                  calendarData.push({
                                                                        eventId: assignmentRecord._id,
                                                                        groupId: assignmentRecord.groupId._id,
                                                                        groupName: assignmentRecord.groupId.section ? assignmentRecord.groupId.grade + " " + assignmentRecord.groupId.section : assignmentRecord.groupId.grade,
                                                                        subject: assignmentRecord.subject,
                                                                        eventType: assignmentRecord.sectionType,
                                                                        eventTitle: assignmentRecord.title, //assignmentRecord.sectionType == "Announcement" ? assignmentRecord.announcement.announcementTitle : assignmentRecord.sectionType == "ProjectWork" ? assignmentRecord.projectWork.projectTitle : assignmentRecord.sectionType == "HomeWork" ? assignmentRecord.homeWork[0].homeWorkTitle : assignmentRecord.test.testTitle,
                                                                        eventStartTimestamp: assignmentRecord.eventDate,
                                                                        eventEndTimestamp: endDate,
                                                                        reminderDate: "",
                                                                        reminderNote: "",
                                                                        reminderId: String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2])),
                                                                        completedStatus,
                                                                        cancelStatus: assignmentRecord.cancelStatus,
                                                                        type: "MSG"
                                                                  })

                                                            });

                                                      }

                                                      if (allEvents[1].length > 0) {

                                                            allEvents[1].forEach(personalEvent => {

                                                                  let remDate = personalEvent.date

                                                                  let splitedDate = remDate.toString().split(' ');
                                                                  let splitTimestamp = splitedDate[4].split(':');

                                                                  //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it


                                                                  calendarData.push({
                                                                        eventId: personalEvent._id,
                                                                        // teacherName: "",
                                                                        groupId: "",
                                                                        groupName: "",
                                                                        subject: "",
                                                                        eventType: "PE",
                                                                        eventTitle: personalEvent.title,
                                                                        eventStartTimestamp: personalEvent.eventStartTimestamp,
                                                                        eventEndTimestamp: personalEvent.eventEndTimestamp,
                                                                        reminderDate: personalEvent.reminder ? personalEvent.reminder : "",
                                                                        reminderNote: personalEvent.reminderNote ? personalEvent.reminderNote : "",
                                                                        reminderId: String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2])),
                                                                        completedStatus: false,
                                                                        cancelStatus: false,
                                                                        type: "MSG"
                                                                  })

                                                            });

                                                      }

                                                      if (calendarData.length > 0) {
                                                            return res.status(200).json({
                                                                  statusCode: "1",
                                                                  weekCalendarData: calendarData,
                                                                  message: "Data Found..!!"
                                                            })
                                                      } else {
                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  weekCalendarData : [],
                                                                  message: "No Records Found..!!"
                                                            })
                                                      }
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

