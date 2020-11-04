const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');

const AssignmentModel = require('../../../models/assignment/assignmentModel');

const StudentModel = require('../../../models/authentication/userModel');

const PersonalEventModel = require('../../../models/planner/personalEventsModel');

const DateDiff = require('date-diff');


module.exports = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            let date = req.params.date;

            StudentModel.findOne({
                  _id: studentId,
                  type: 1, //Student
                  isActive: true
            })
                  .exec()
                  .then(async studentDetails => {

                        console.log(studentDetails);

                        if (studentDetails) {

                              ClassStudentConnectionModel.find({
                                    studentId,
                                    connectionStatus: 1,
                                    isActive: 1
                              }, {
                                    _id: 0,
                                    classId: 1,
                                    subjects: 1,
                                    secondLanguage: 1,
                                    thirdLanguage: 1,
                              })
                                    .then(async classesConnected => {

                                          console.log(classesConnected);

                                          if (classesConnected.length > 0) {

                                                // connectionsArray = new Array();

                                                let classWiseSubject = [];

                                                for (let index = 0; index < classesConnected.length; index++) {
                                                      const connection = classesConnected[index];

                                                      let subjectArray = []
                                                      subjectArray = connection.subjects.length > 0 && connection.subjects;
                                                      connection.secondLanguage && subjectArray.push(connection.secondLanguage)
                                                      connection.thirdLanguage && subjectArray.push(connection.thirdLanguage)

                                                      if (subjectArray.length > 0) {

                                                            classWiseSubject.push({
                                                                  groupId: connection.classId,
                                                                  subject: {
                                                                        $in: subjectArray
                                                                  }
                                                            })

                                                      }

                                                }

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


                                                let AssingmentEvents = AssignmentModel.find({
                                                      $or: classWiseSubject,
                                                      isActive: true,
                                                      sentStatus: true,
                                                      teacherDeleteAllStatus: false,
                                                      eventDate: {
                                                            $gte: new Date(formattedCurrentMonth),
                                                            $lt: new Date(formattedNextMonth)
                                                      }
                                                }, {
                                                      "groupId": 1,
                                                      "sectionType": 1,
                                                      "subject": 1,
                                                      "title": 1,
                                                      "eventDate": 1,
                                                      "duration": 1,
                                                      "cancelStatus": 1,
                                                      "completedStudentList": 1,
                                                      "notCompletedStudents": 1,
                                                      "coming": 1,
                                                      "notComing": 1,
                                                      "activeStudentIds": 1,
                                                      "remindedUsers": 1,
                                                      "date": 1,
                                                })
                                                .sort({
                                                      date: 1
                                                })
                                                .populate({
                                                      path: 'groupId',
                                                      select: 'grade section groupPic teacherId'
                                                })
                                                .exec();

                                                let personalEvents = PersonalEventModel.find({
                                                      userId: studentId,
                                                      $or: [{
                                                            eventStartTimestamp: {
                                                                  $gte: new Date(formattedCurrentMonth),
                                                                  $lt: new Date(formattedNextMonth)

                                                            }
                                                      }, {
                                                            eventEndTimestamp: {
                                                                  $gte: new Date(formattedCurrentMonth),
                                                                  $lt: new Date(formattedNextMonth)

                                                            }
                                                      }],
                                                      isActive: true
                                                }, {
                                                      title: 1,
                                                      eventStartTimestamp: 1,
                                                      eventEndTimestamp: 1,
                                                      reminder: 1,
                                                      reminderNote: 1,
                                                      date: 1
                                                }).sort({
                                                      date: 1
                                                }).exec();

                                                Promise.all([AssingmentEvents, personalEvents]) //tests,
                                                      .then(allEvents => {

                                                            console.log(allEvents);
                                                            let assignmentArray = new Array();
                                                            let personalEventArray = new Array();


                                                            // if (allEvents[0].length > 0) {
                                                            //       allEvents[0].forEach(testRecord => {
                                                            //             testRecord.test.testSchedule.forEach(test => {
                                                            //                   allEventsArray.push({
                                                            //                         eventType: "test",
                                                            //                         eventDate: test.eventDate
                                                            //                   })
                                                            //             });
                                                            //       });
                                                            // }

                                                            if (allEvents[0].length > 0) {

                                                                  allEvents[0].forEach(assignmentRecord => {

                                                                        // let endDate = "";
                                                                        let completedStatus = false;

                                                                        // if (assignmentRecord.duration) {
                                                                        //       endDate = new Date(assignmentRecord.eventDate)
                                                                        //       endDate.setMinutes(endDate.getMinutes() + parseInt(assignmentRecord.duration));
                                                                        //       let diff = new DateDiff(new Date(), endDate);
                                                                        // }

                                                                        /**Check End Date Has been completed by comparing with Date and time Now */

                                                                        // let eventStartDateDiff = new DateDiff(today, formattedEventStart);
                                                                        // let eventStartDateDiff = new DateDiff(today, formattedEventStart);
                                                                        let endDate = ""

                                                                        if (assignmentRecord.duration) {
                                                                              endDate = new Date(assignmentRecord.eventDate)
                                                                              endDate.setMinutes(endDate.getMinutes() + parseInt(assignmentRecord.duration));
                                                                        } else {
                                                                              endDate = new Date(assignmentRecord.eventDate)
                                                                              endDate.setMinutes(endDate.getMinutes() + 600);
                                                                        }



                                                                        let assignmentObj = {
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
                                                                              reminderId: "",
                                                                              completedStatus,
                                                                              cancelStatus: assignmentRecord.cancelStatus,
                                                                              type: "MSG"
                                                                        }

                                                                        if (assignmentRecord.remindedUsers.length > 0) {

                                                                              assignmentRecord.remindedUsers.forEach(reminder => {

                                                                                    if (reminder.userId == studentId) {
                                                                                          assignmentObj.reminderDate = reminder.reminderDate;
                                                                                          assignmentObj.reminderNote = reminder.reminderNote;
                                                                                    }

                                                                              });

                                                                        }

                                                                        assignmentArray.push(assignmentObj)

                                                                  });

                                                            }

                                                            if (allEvents[1].length > 0) {

                                                                  allEvents[1].forEach(personalEvent => {

                                                                        let remDate = personalEvent.date

                                                                        let splitedDate = remDate.toString().split(' ');
                                                                        let splitTimestamp = splitedDate[4].split(':');

                                                                        personalEventArray.push({
                                                                              eventId: personalEvent._id,
                                                                              teacherName: "",
                                                                              groupId: "",
                                                                              groupName: "",
                                                                              eventType: "PE",
                                                                              eventTitle: personalEvent.title,
                                                                              eventStartTimestamp: personalEvent.eventStartTimestamp,
                                                                              eventEndTimestamp: personalEvent.eventEndTimestamp,
                                                                              reminderId: String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2])),
                                                                              reminderDate: personalEvent.reminder ? personalEvent.reminder : "",
                                                                              reminderNote: personalEvent.reminderNote ? personalEvent.reminderNote : "",
                                                                              cancelStatus: false
                                                                        })

                                                                  });

                                                            }

                                                            return res.status(200).json({
                                                                  statusCode: "1",
                                                                  assignmentList: assignmentArray,
                                                                  personalEventList: personalEventArray,
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

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Records Found..!!"
                                                });

                                          }
                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          })
                                    });

                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: "Access Denied..!!"
                              });

                        }
                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try again..!!"
                        })
                  });

      } else {

            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });

      }
}