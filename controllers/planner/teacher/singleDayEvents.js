const DateDiff = require('date-diff');
const AssignmentModel = require('../../../models/assignment/assignmentModel');

const VerifyTeacher = require('../../../middleware/verifyTeacher');

// const GroupList = require('../../group/teacher/activeGroupsList');

const PersonalEventModel = require('../../../models/planner/personalEventsModel');

const formatDate = require('../../assignment/formatDate');

const TeacherConnectedSubjectWiseClassList = require('../../group/teacher/teacherConnectedSubjectWiseClassList')


module.exports = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            // let lastEventId = req.params.lastEventId;
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


                                          let Query = {
                                                $or: TeacherClassWiseSubjects,
                                                eventDate: {
                                                      $gte: new Date(formattedCurrentMonth),
                                                      $lt: new Date(formattedNextMonth)
                                                },
                                                teacherDeleteStatus: false,
                                                teacherDeleteAllStatus: false,
                                                sentStatus: true,
                                                isActive: true,
                                          }


                                          let AssingmentEvents = AssignmentModel.find(Query, {
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
                                                "date": 1,
                                          }).populate({
                                                path: 'groupId',
                                                select: 'grade section groupPic groupName',
                                          })
                                                .sort({
                                                      eventDate: 1
                                                })
                                                // .limit(10)
                                                .exec();



                                          let personalEvents = PersonalEventModel.find({
                                                userId: teacherId,
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
                                                eventStartTimestamp: 1
                                          }).exec();


                                          Promise.all([AssingmentEvents, personalEvents]) //tests,
                                                .then(async allEvents => {

                                                      console.log(allEvents)

                                                      let nowTimeStamp = new Date();
                                                      let exactTimeStampNow = new Date(nowTimeStamp.setMinutes(nowTimeStamp.getMinutes() + 330));


                                                      let calendarData = new Array();

                                                      if (allEvents[0].length > 0) {

                                                            for (let index = 0; index < allEvents[0].length; index++) {
                                                                  const assignmentRecord = allEvents[0][index];
                                                                  

                                                                  /** Reminder Id Generation  */
                                                                  let remDate = assignmentRecord.date

                                                                  let splitedDate = remDate.toString().split(' ');
                                                                  let splitTimestamp = splitedDate[4].split(':');

                                                                  let endDate = ""
                                                                  let completedStatus = false;

                                                                  //Test and Class will have duration


                                                                  if (assignmentRecord.duration) {
                                                                        endDate = new Date(assignmentRecord.eventDate)
                                                                        endDate.setMinutes(endDate.getMinutes() + parseInt(assignmentRecord.duration));
                                                                        let dateDiff = new DateDiff(nowTimeStamp, endDate);
                                                                        completedStatus = dateDiff.seconds() > 0 && true
                                                                  } else {
                                                                        endDate = new Date(assignmentRecord.eventDate)
                                                                        endDate.setMinutes(endDate.getMinutes() + 600);
                                                                        let dateDiff = new DateDiff(await formatDate(exactTimeStampNow), await formatDate(endDate));
                                                                        completedStatus = dateDiff.days() > 0 && true
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
                                                                        completedStatus: completedStatus,
                                                                        cancelStatus: assignmentRecord.cancelStatus,
                                                                        type: "MSG"
                                                                  })


                                                            }

                                                      }

                                                      if (allEvents[1].length > 0) {

                                                            allEvents[1].forEach(personalEvent => {

                                                                  //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                                                  let remDate = personalEvent.date

                                                                  let splitedDate = remDate.toString().split(' ');
                                                                  let splitTimestamp = splitedDate[4].split(':');

                                                                  //** Check Completed Status based on event end date has been completed */
                                                                  // let nowTimeStamp = new Date();
                                                                  // let exactTimeStampNow = new Date(nowTimeStamp.setMinutes(nowTimeStamp.getMinutes() + 330));
                                                                  let dateDiff = new DateDiff(exactTimeStampNow, personalEvent.eventEndTimestamp);


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
                                                                        completedStatus: dateDiff.seconds() < 0 ? false : true,
                                                                        cancelStatus: false,
                                                                        type: "MSG"
                                                                  })

                                                            });

                                                      }

                                                      calendarData.sort(function (a, b) {
                                                            return new Date(a.eventStartTimestamp) - new Date(b.eventStartTimestamp);
                                                      });

                                                      console.log(calendarData)

                                                      return res.status(200).json({
                                                            statusCode: "1",
                                                            calendarData,
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







// // let groupList = await GroupList(teacherId);

// // let selectedDate = "";

// // if (date) {
// //       selectedDate = new Date(date);
// // } else {
// //       selectedDate = new Date();
// // }

// // let nextDay = new Date();//new Date(selectedDate);

// // nextDay.setDate(selectedDate.getDate() + 7);

// // let formattedNextDay = await formatDate(nextDay);

// let formattedSelectedDay = await formatDate(new Date()); //selectedDate


// // let tests = AssignmentModel.find({
// //             groupId: {
// //                   $in: connectionsArray
// //             },
// //             isActive: true,
// //             sentStatus: true,
// //             previousRecord: false,
// //             teacherDeleteAllStatus: false,
// //             "test.testSchedule.eventDate": {
// //                   $gte: new Date(formattedNextDay),
// //                   $lt: new Date(formattedSelectedDay)

// //             }
// //       }, {
// //             "sectionType": 1,
// //             "remindedUsers": 1,
// //             "test.testSchedule": 1
// //       })
// //       .populate({
// //             path: 'groupId',
// //             select: 'grade section groupPic teacherId',
// //             populate: {
// //                   path: 'teacherId',
// //                   select: 'firstName surname _id',
// //             }
// //       })

// let Query = {
//       // groupId: {
//       //       $in: groupList
//       // },
//       // previousRecord: false,
//       teacherId,
//       isActive: true,
//       sentStatus: true,
//       teacherDeleteStatus: false,
//       teacherDeleteAllStatus: false,
//       eventDate: {
//             $gte: new Date(formattedSelectedDay)
//             // ,
//             // $lt: new Date(formattedNextDay)

//       }
// }

// if (lastEventId) {
//       Query._id = {
//             $lt: lastEventId
//       }
// }

// let AssingmentEvents = AssignmentModel.find(Query, {
//       "groupId": 1,
//       "sectionType": 1,
//       "subject": 1,
//       "title": 1,
//       "eventDate": 1,
//       "duration": 1,
//       "cancelStatus": 1,
//       "date": 1,
// })
//       .sort({
//             // date: 1
//             eventDate: 1
//       })
//       .populate({
//             path: 'groupId',
//             select: 'grade section groupPic groupName',
//       })
//       .exec();

// let personalEvents = PersonalEventModel.find({
//       userId: teacherId,
//       $or: [{
//             eventStartTimestamp: {
//                   $gte: new Date(formattedSelectedDay),
//                   $lt: new Date(formattedNextDay)

//             }
//       }, {
//             eventEndTimestamp: {
//                   $gte: new Date(formattedSelectedDay),
//                   $lt: new Date(formattedNextDay)

//             }
//       }],
//       isActive: true
// }, {
//       title: 1,
//       eventStartTimestamp: 1,
//       eventEndTimestamp: 1,
//       reminder: 1,
//       reminderNote: 1,
//       date: 1
// }).sort({
//       eventStartTimestamp: 1
// }).exec();

// Promise.all([AssingmentEvents, personalEvents]) //tests,
//       .then(allEvents => {

//             console.log(allEvents);

//             let calendarData = new Array();
//             let personalEventArray = new Array();


//             // if (allEvents[0].length > 0) {
//             //       allEvents[0].forEach(testRecord => {
//             //             testRecord.test.testSchedule.forEach(test => {
//             //                   allEventsArray.push({
//             //                         eventType: "test",
//             //                         eventDate: test.eventDate
//             //                   })
//             //             });
//             //       });
//             // }

//             if (allEvents[0].length > 0) {

//                   allEvents[0].map(assignmentRecord => {

//                         let endDate = ""

//                         if (assignmentRecord.duration) {
//                               endDate = new Date(assignmentRecord.eventDate)
//                               endDate.setMinutes(endDate.getMinutes() + parseInt(assignmentRecord.duration));
//                         }

//                         calendarData.push({
//                               eventId: assignmentRecord._id,
//                               // teacherName: assignmentRecord.groupId.teacherId.firstName,
//                               groupId: assignmentRecord.groupId._id,
//                               groupName: assignmentRecord.groupId.section ? assignmentRecord.groupId.grade + " " + assignmentRecord.groupId.section : assignmentRecord.groupId.grade,
//                               subject: assignmentRecord.subject,
//                               eventType: assignmentRecord.sectionType,
//                               eventTitle: assignmentRecord.title, //assignmentRecord.sectionType == "Announcement" ? assignmentRecord.announcement.announcementTitle : assignmentRecord.sectionType == "ProjectWork" ? assignmentRecord.projectWork.projectTitle : assignmentRecord.sectionType == "HomeWork" ? assignmentRecord.homeWork[0].homeWorkTitle : assignmentRecord.test.testTitle,
//                               eventStartTimestamp: assignmentRecord.eventDate,
//                               eventEndTimestamp: endDate,
//                               reminderDate: "",
//                               reminderNote: "",
//                               reminderId: "",
//                               cancelStatus: assignmentRecord.cancelStatus,
//                               type: "MSG"
//                         })

//                   });

//             }

//             if (allEvents[1].length > 0) {

//                   allEvents[1].forEach(personalEvent => {

//                         let remDate = personalEvent.date

//                         let splitedDate = remDate.toString().split(' ');
//                         let splitTimestamp = splitedDate[4].split(':');

//                         //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it


//                         calendarData.push({
//                               eventId: personalEvent._id,
//                               // teacherName: "",
//                               groupId: "",
//                               groupName: "",
//                               subject: "",
//                               eventType: "PE",
//                               eventTitle: personalEvent.title,
//                               eventStartTimestamp: personalEvent.eventStartTimestamp,
//                               eventEndTimestamp: personalEvent.eventEndTimestamp,
//                               reminderDate: personalEvent.reminder ? personalEvent.reminder : "",
//                               reminderNote: personalEvent.reminderNote ? personalEvent.reminderNote : "",
//                               reminderId: String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2])),
//                               cancelStatus: false,
//                               type: "MSG"
//                         })

//                   });

//             }

//             return res.status(200).json({
//                   statusCode: "1",
//                   calendarData,
//                   personalEventList: personalEventArray,
//                   message: "Data Found..!!"
//             })

//       })
//       .catch(err => {
//             console.log(err);

//             return res.status(200).json({
//                   statusCode: "0",
//                   message: "Something went wrong. Please try again..!!"
//             })

//       })

