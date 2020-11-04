const DateDiff = require('date-diff');

const mongoose = require('mongoose');

const ConnectionModel = require('../../../models/group/connectionModel');

const AssignmentModel = require('../../../models/assignment/assignmentModel');

const StudentModel = require('../../../models/authentication/userModel');

const PersonalEventModel = require('../../../models/planner/personalEventsModel');

const Calendar = require('../common/calendar/calendarEventsController');

const ParseAssignments = require('../../assignment/student/parseSchoolAssignmentsController')

const CustomAssignments = require('./shared/calendarCustomEvents');


exports.getCalendar = (req, res, next) => {

      if (req.params.studentId) {

            let _studentId = req.params.studentId;

            let _date = req.params.date;

            StudentModel.findOne({
                        _id: _studentId,
                        isActive: true
                  })
                  .exec()
                  .then(studentDetails => {

                        console.log(studentDetails);

                        if (studentDetails) {

                              StudentModel.find({
                                          loginId: studentDetails.loginId,
                                          isActive: true
                                    }).exec()
                                    .then(async studentsList => {

                                          let dataArray = new Array();
                                          let error = 0;
                                          let index = 0;
                                          let studentArray = new Array();
                                          let latestOnlyDate = "";
                                          let formattedNextDay = "";


                                          while (error == 0 && index < studentsList.length) {

                                                const studentId = studentsList[index]._id;

                                                studentArray.push(studentId) // this has been used to get calendar events of all students

                                                await ConnectionModel.find({
                                                            studentId,
                                                            connectionStatus: 2,
                                                            isActive: 1
                                                      }, {
                                                            _id: 0,
                                                            groupId: 1
                                                      })
                                                      .then(async connections => {

                                                            console.log(connections);

                                                            if (connections.length > 0) {

                                                                  connectionsArray = new Array();

                                                                  for (let index = 0; index < connections.length; index++) {
                                                                        let connection = connections[index];
                                                                        connectionsArray.push(connection.groupId)
                                                                  }

                                                                  console.log(connectionsArray);

                                                                  let today = "";

                                                                  if (_date) {
                                                                        today = new Date(_date);
                                                                  } else {
                                                                        today = new Date();
                                                                  }

                                                                  let nextDay = new Date(today);

                                                                  let nextDayMonth = (nextDay.getUTCMonth() + 2) < 10 ? "0" + String(nextDay.getUTCMonth() + 2) : (nextDay.getUTCMonth() + 2) > 12 ? "01" : nextDay.getUTCMonth() + 2;

                                                                  let nextYear = (nextDay.getUTCMonth() + 1) == 12 ? nextDay.getFullYear() + 1 : nextDay.getFullYear();

                                                                  formattedNextDay = new Date(nextYear + '-' + nextDayMonth + '-01T00:00:00.000Z');

                                                                  let todayMonth = (today.getUTCMonth() + 1) < 10 ? "0" + String(today.getUTCMonth() + 1) : today.getUTCMonth() + 1;

                                                                  latestOnlyDate = new Date(today.getFullYear() + '-' + todayMonth + '-01T00:00:00.000Z');

                                                                  await AssignmentModel.find({
                                                                              groupId: {
                                                                                    $in: connectionsArray
                                                                              },
                                                                              isActive: true,
                                                                              teacherDeleteAllStatus: false,
                                                                              eventDate: {
                                                                                    $gte: new Date(latestOnlyDate),
                                                                                    $lt: new Date(formattedNextDay)

                                                                              },
                                                                              $or: [{
                                                                                    "deleted": {
                                                                                          $ne: studentId
                                                                                    }
                                                                              }, {
                                                                                    "deleted": {
                                                                                          $exists: false
                                                                                    }
                                                                              }]
                                                                        }, {
                                                                              "cancelStatus": 1,
                                                                              "date": 1,
                                                                              "sectionType": 1,
                                                                              "eventDate": 1
                                                                        })
                                                                        .sort({
                                                                              'date': -1,
                                                                              'cancelStatus': -1
                                                                        })
                                                                        .exec()
                                                                        .then(records => {

                                                                              if (records.length > 0) {

                                                                                    console.log(records);

                                                                                    let eventDate = new Date(records[0].eventDate);
                                                                                    let eventMonth = eventDate.getUTCMonth() + 1;
                                                                                    let eventYear = eventDate.getFullYear();

                                                                                    for (let index = 0; index < records.length; index++) {

                                                                                          const record = records[index];

                                                                                          let savedDate = new Date(record.eventDate)

                                                                                          let recordObj = {
                                                                                                _id: record._id,
                                                                                                custom: "",
                                                                                                day: savedDate.getDate(),
                                                                                                month: eventMonth,
                                                                                                year: eventYear,
                                                                                                studentId: studentId,
                                                                                                calendarDate: savedDate
                                                                                          }

                                                                                          if (record.cancelStatus == true) {
                                                                                                recordObj.cancelled = "true"
                                                                                          } else {
                                                                                                recordObj.cancelled = ""
                                                                                          }

                                                                                          dataArray.push(recordObj)
                                                                                    }

                                                                              }

                                                                        })
                                                                        .catch(err => {

                                                                              console.log(err)

                                                                              error = 1;

                                                                              res.status(200).json({
                                                                                    statusCode: 0,
                                                                                    message: "Something went wrong. Please try later..!!"
                                                                              })

                                                                        });

                                                            }

                                                      })
                                                      .catch(err => {

                                                            console.log(err);

                                                            error = 1;

                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Access Denied..!!"
                                                            })

                                                      });

                                                index++;
                                          }


                                          if (error == 0) {

                                                if (latestOnlyDate == "") {

                                                      let today = "";

                                                      if (_date) {
                                                            today = new Date(_date);
                                                      } else {
                                                            today = new Date();
                                                      }

                                                      let nextDay = new Date(today);

                                                      let nextDayMonth = (nextDay.getUTCMonth() + 2) < 10 ? "0" + String(nextDay.getUTCMonth() + 2) : (nextDay.getUTCMonth() + 2) > 12 ? "01" : nextDay.getUTCMonth() + 2;

                                                      let nextYear = (nextDay.getUTCMonth() + 1) == 12 ? nextDay.getFullYear() + 1 : nextDay.getFullYear();

                                                      formattedNextDay = new Date(nextYear + '-' + nextDayMonth + '-01T00:00:00.000Z');

                                                      let todayMonth = (today.getUTCMonth() + 1) < 10 ? "0" + String(today.getUTCMonth() + 1) : today.getUTCMonth() + 1;

                                                      latestOnlyDate = new Date(today.getFullYear() + '-' + todayMonth + '-01T00:00:00.000Z');

                                                }

                                                await PersonalEventModel.find({
                                                            userId: {
                                                                  $in: studentArray
                                                            },
                                                            isActive: true,
                                                            eventDate: {
                                                                  $gte: new Date(latestOnlyDate),
                                                                  $lt: new Date(formattedNextDay)
                                                            }
                                                      })
                                                      .exec()
                                                      .then(calendarEvents => {

                                                            if (calendarEvents.length > 0) {

                                                                  console.log(calendarEvents);

                                                                  // let dataArray = new Array();

                                                                  let eventDate = new Date(calendarEvents[0].eventDate);
                                                                  let eventMonth = eventDate.getUTCMonth() + 1;
                                                                  let eventYear = eventDate.getFullYear();

                                                                  for (let index = 0; index < calendarEvents.length; index++) {

                                                                        const event = calendarEvents[index];

                                                                        let savedDate = new Date(event.eventDate)

                                                                        let recordObj = {
                                                                              _id: event._id,
                                                                              custom: "true",
                                                                              cancelled: "",
                                                                              day: savedDate.getDate(),
                                                                              month: eventMonth,
                                                                              year: eventYear,
                                                                              studentId: event.userId,
                                                                              calendarDate: savedDate
                                                                        }

                                                                        dataArray.push(recordObj)
                                                                  }

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        calendarData: dataArray,
                                                                        message: "Data Found...!!"
                                                                  });

                                                            } else {

                                                                  if (dataArray.length > 0) {

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              calendarData: dataArray,
                                                                              message: "Data Found...!!"
                                                                        });

                                                                  } else {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              calendarData: [],
                                                                              message: "No Record Found...!!"
                                                                        });

                                                                  }



                                                            }
                                                      })
                                                      .catch(err => {

                                                            console.log(err);

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!"
                                                            })

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



exports.getCalendarEvents = (req, res, next) => {

      if (req.params.studentId && req.params.date) {

            let studentId = req.params.studentId;

            let _date = req.params.date;

            StudentModel.findOne({
                        _id: studentId,
                        isActive: true
                  })
                  .exec()
                  .then(studentDetails => {

                        // console.log(studentDetails);

                        if (studentDetails) {

                              StudentModel.find({
                                          loginId: studentDetails.loginId,
                                          isActive: true
                                    }).exec()
                                    .then(async studentsList => {

                                          let calendarEventsDataConcat = new Array();
                                          let error = 0;
                                          let index = 0;
                                          let studentArray = new Array();
                                          let latestOnlyDate = "";
                                          let formattedNextDay = "";

                                          while (error == 0 && index < studentsList.length) {

                                                const studentId = studentsList[index]._id;

                                                studentArray.push(studentId) // this has been used to get calendar events of all students

                                                await ConnectionModel.find({
                                                            studentId,
                                                            connectionStatus: 2,
                                                            isActive: 1
                                                      }, {
                                                            _id: 0,
                                                            groupId: 1
                                                      })
                                                      .then(async connections => {

                                                            //console.log(connections);

                                                            if (connections.length > 0) {

                                                                  connectionsArray = new Array();

                                                                  for (let index = 0; index < connections.length; index++) {
                                                                        let connection = connections[index];
                                                                        connectionsArray.push(connection.groupId)
                                                                  }

                                                                  let today = "";

                                                                  today = new Date(_date);

                                                                  let nextDay = new Date(today);

                                                                  nextDay.setDate(today.getDate() + 1);

                                                                  let nextDayMonth = (nextDay.getUTCMonth() + 1) < 10 ? "0" + String(nextDay.getUTCMonth() + 1) : nextDay.getUTCMonth() + 1;

                                                                  let nexDayDate = nextDay.getDate() < 10 ? "0" + String(nextDay.getDate()) : nextDay.getDate();

                                                                  formattedNextDay = new Date(nextDay.getFullYear() + '-' + nextDayMonth + '-' + nexDayDate + 'T00:00:00.000Z');

                                                                  let todayMonth = (today.getUTCMonth() + 1) < 10 ? "0" + String(today.getUTCMonth() + 1) : today.getUTCMonth() + 1;

                                                                  let todayDate = today.getDate() < 10 ? "0" + String(today.getDate()) : today.getDate();

                                                                  latestOnlyDate = new Date(today.getFullYear() + '-' + todayMonth + '-' + todayDate + 'T00:00:00.000Z');


                                                                  await AssignmentModel.find({
                                                                              groupId: {
                                                                                    $in: connectionsArray
                                                                              },
                                                                              isActive: true,
                                                                              teacherDeleteAllStatus: false,
                                                                              eventDate: {
                                                                                    $gte: new Date(latestOnlyDate),
                                                                                    $lt: new Date(formattedNextDay)

                                                                              },
                                                                              $or: [{
                                                                                    "deleted": {
                                                                                          $ne: studentId
                                                                                    }
                                                                              }, {
                                                                                    "deleted": {
                                                                                          $exists: false
                                                                                    }
                                                                              }]

                                                                        })
                                                                        .sort({
                                                                              'date': -1
                                                                        })
                                                                        .populate('groupData.students', 'name profilePic')
                                                                        .populate('groupId', 'grade section groupName groupPic')
                                                                        .populate('teacherId', 'name')
                                                                        .exec()
                                                                        .then(async records => {

                                                                              console.log(records);

                                                                              if (records.length > 0) {

                                                                                    const calendarEventsData = await Calendar.parseAssignmentEvents(records, studentId, 2) //2->userType = student

                                                                                    calendarEventsDataConcat = calendarEventsDataConcat.concat(calendarEventsData);
                                                                              }

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err)

                                                                              error = 1;

                                                                              res.status(200).json({
                                                                                    statusCode: 0,
                                                                                    message: "Something went wrong. Please try later..!!"
                                                                              })
                                                                        });

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            error = 1;

                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Access Denied..!!"
                                                            })
                                                      });

                                                index++;
                                          }

                                          if (error == 0) {

                                                if (latestOnlyDate == "") {

                                                      let today = "";

                                                      today = new Date(_date);

                                                      let nextDay = new Date(today);

                                                      nextDay.setDate(today.getDate() + 1);

                                                      let nextDayMonth = (nextDay.getUTCMonth() + 1) < 10 ? "0" + String(nextDay.getUTCMonth() + 1) : nextDay.getUTCMonth() + 1;

                                                      let nexDayDate = nextDay.getDate() < 10 ? "0" + String(nextDay.getDate()) : nextDay.getDate();

                                                      formattedNextDay = new Date(nextDay.getFullYear() + '-' + nextDayMonth + '-' + nexDayDate + 'T00:00:00.000Z');

                                                      let todayMonth = (today.getUTCMonth() + 1) < 10 ? "0" + String(today.getUTCMonth() + 1) : today.getUTCMonth() + 1;

                                                      let todayDate = today.getDate() < 10 ? "0" + String(today.getDate()) : today.getDate();

                                                      latestOnlyDate = new Date(today.getFullYear() + '-' + todayMonth + '-' + todayDate + 'T00:00:00.000Z');

                                                }

                                                PersonalEventModel.find({
                                                            userId: {
                                                                  $in: studentArray
                                                            },
                                                            isActive: true,
                                                            eventDate: {
                                                                  $gte: new Date(latestOnlyDate),
                                                                  $lt: new Date(formattedNextDay)
                                                            }
                                                      })
                                                      .populate('userId', '_id name')
                                                      .exec()
                                                      .then(calendarEvents => {

                                                            console.log(calendarEvents);
                                                            let customEvents = [];

                                                            if (calendarEvents.length > 0) {

                                                                  for (let index = 0; index < calendarEvents.length; index++) {

                                                                        const event = calendarEvents[index];

                                                                        let reminderDate = "";
                                                                        let reminderNote = "";

                                                                        let splitedDate = event.date.toString().split(' ');
                                                                        let splitTimestamp = splitedDate[4].split(':')

                                                                        //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                                                        let remId = String(parseInt(event.date.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))

                                                                        if (event.reminder) {

                                                                              let diff = new DateDiff(new Date(), event.reminder);
                                                                              let minutesDiff = Math.floor(diff.minutes());

                                                                              if (minutesDiff <= 0) {

                                                                                    event.reminder.setMinutes(event.reminder.getMinutes() + 330);

                                                                                    reminderDate = event.reminder;
                                                                                    reminderNote = event.reminderNote;
                                                                                    reminderId = remId;
                                                                              }

                                                                        }

                                                                        let eventObj = {
                                                                              _id: event._id,
                                                                              groupId: "",
                                                                              groupName: "",
                                                                              groupPic: "",
                                                                              sectionType: event.title,
                                                                              title: event.body,
                                                                              userId: event.userId._id,
                                                                              userName: event.userId.name,
                                                                              eventDate: event.eventDate,
                                                                              reminderDate: reminderDate,
                                                                              reminderNote: reminderNote,
                                                                              reminderId: remId,
                                                                              date: event.date,
                                                                              customEvent: "true",
                                                                              staredId: "",
                                                                              stared: "false",
                                                                              cancelStatus: ""
                                                                        };

                                                                        customEvents.push(eventObj)
                                                                  }
                                                            }

                                                            if (calendarEventsDataConcat.length > 0 || customEvents.length > 0) {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        calendarEvents: calendarEventsDataConcat,
                                                                        customEvents: customEvents,
                                                                        message: "Data Found...!!"
                                                                  });

                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        calendarEvents: [],
                                                                        customEvents: [],
                                                                        message: "No Records Found..!!"
                                                                  });
                                                            }
                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!"
                                                            })
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
                  .catch(err => {
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




/**Get only one assignment when need to show
 * 
 * Used in Calendar for student to show assignment for which he wanted when click on calendar assignmentList
 */
exports.calendarAssignment = (req, res, next) => {

      console.log(req.params);

      if (req.params.studentId && req.params.groupId && req.params.schoolAssignmentId) {

            let studentId = req.params.studentId;
            let groupId = req.params.groupId;
            let schoolAssignmentId = req.params.schoolAssignmentId;

            StudentModel.findOne({
                        _id: studentId,
                        isActive: true
                  })
                  .exec()
                  .then(studentDetails => {

                        console.log(studentDetails);

                        if (studentDetails) {

                              ConnectionModel.findOne({
                                          studentId,
                                          groupId,
                                          connectionStatus: 2,
                                          isActive: true
                                    }, {
                                          _id: 1,
                                    })
                                    .then(connection => {

                                          console.log(connection);
                                          console.log("schoolAssignmentId");
                                          console.log(schoolAssignmentId);

                                          if (connection) {

                                                AssignmentModel.findOne({
                                                            _id: schoolAssignmentId,
                                                            groupId,
                                                            teacherDeleteAllStatus: false,
                                                            $or: [{
                                                                  "deleted": {
                                                                        $ne: studentId
                                                                  }
                                                            }, {
                                                                  "deleted": {
                                                                        $exists: false
                                                                  }
                                                            }],
                                                            isActive: true
                                                      }).exec()
                                                      .then(assignment => {

                                                            console.log("assignment");
                                                            console.log(assignment);

                                                            if (assignment) {

                                                                  let query = {
                                                                        sectionType: assignment.sectionType,
                                                                        groupId,
                                                                        teacherDeleteAllStatus: false,
                                                                        $or: [{
                                                                              "deletedStudents": {
                                                                                    $ne: studentId
                                                                              }
                                                                        }, {
                                                                              "deletedStudents": {
                                                                                    $exists: false
                                                                              }
                                                                        }],
                                                                        isActive: true
                                                                  }

                                                                  if (assignment.sectionType == "Announcement") {
                                                                        query.announcementIds = schoolAssignmentId
                                                                  } else if (assignment.sectionType == "Test") {
                                                                        query.testIds = schoolAssignmentId
                                                                  } else {
                                                                        query.projectWorkIds = schoolAssignmentId
                                                                  }

                                                                  SchoolModel.findOne(query, {
                                                                              projectWorkIds: 1,
                                                                              announcementIds: 1,
                                                                              testIds: 1,

                                                                              //common things
                                                                              sectionType: 1,
                                                                              sectionUrls: 1,
                                                                              cancelStatus: 1,
                                                                              teacherDeleteAllStatus: 1,
                                                                              date: 1,
                                                                              upcomingDate: 1,
                                                                              remindedUsers: 1
                                                                        })
                                                                        .sort({
                                                                              'date': -1
                                                                        })
                                                                        .populate({
                                                                              path: 'projectWorkIds',
                                                                              select: 'projectTitle eventDate groupData note stared',
                                                                              populate: {
                                                                                    path: 'groupData.students',
                                                                                    select: 'name',
                                                                              }
                                                                        })
                                                                        .populate('testIds', 'testTitle subject chapter eventDate stared note')
                                                                        .populate('announcementIds', 'announcementTitle eventDate announcement studentConfirmation stared completedStudents notCompletedStudents')
                                                                        .exec()
                                                                        .then(async record => {

                                                                              console.log("record");
                                                                              console.log(record);

                                                                              if (record) {

                                                                                    const activityData = await ParseAssignments.parseAssignmentData([record], studentId, 2)

                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          assignmentRecords: activityData,
                                                                                          message: "Data Found...!!"
                                                                                    });
                                                                              } else {
                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          assignmentRecords: [],
                                                                                          message: "No Record Found...!!"
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
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Access Denied..!!"
                                                                  })
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
                                                console.log(err);
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Please check connection with teacher..!!!"
                                                })
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied..!!"
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



/**Know any notifications exists today  - Top of calendar today Event Notification Dot*/
exports.todayEventsNotification = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            StudentModel.findOne({
                        _id: studentId,
                        isActive: true
                  })
                  .exec()
                  .then(studentDetails => {

                        // console.log(studentDetails);

                        if (studentDetails) {

                              StudentModel.find({
                                          loginId: studentDetails.loginId,
                                          isActive: true
                                    }).exec()
                                    .then(async studentsList => {

                                          let error = 0;
                                          let index = 0;
                                          let studentArray = new Array();
                                          let latestOnlyDate = "";
                                          let formattedNextDay = "";

                                          let eventsCount = 0;

                                          while (error == 0 && index < studentsList.length) {

                                                const studentId = studentsList[index]._id;

                                                studentArray.push(studentId) // this has been used to get calendar events of all students

                                                await ConnectionModel.find({
                                                            studentId,
                                                            connectionStatus: 2,
                                                            isActive: 1
                                                      }, {
                                                            _id: 0,
                                                            groupId: 1
                                                      })
                                                      .then(async connections => {

                                                            //console.log(connections);

                                                            if (connections.length > 0) {

                                                                  connectionsArray = new Array();

                                                                  for (let index = 0; index < connections.length; index++) {
                                                                        let connection = connections[index];
                                                                        connectionsArray.push(connection.groupId)
                                                                  }

                                                                  let today = "";

                                                                  today = new Date();

                                                                  let nextDay = new Date(today);

                                                                  nextDay.setDate(today.getDate() + 1);

                                                                  let nextDayMonth = (nextDay.getUTCMonth() + 1) < 10 ? "0" + String(nextDay.getUTCMonth() + 1) : nextDay.getUTCMonth() + 1;

                                                                  let nexDayDate = nextDay.getDate() < 10 ? "0" + String(nextDay.getDate()) : nextDay.getDate();

                                                                  formattedNextDay = new Date(nextDay.getFullYear() + '-' + nextDayMonth + '-' + nexDayDate + 'T00:00:00.000Z');

                                                                  let todayMonth = (today.getUTCMonth() + 1) < 10 ? "0" + String(today.getUTCMonth() + 1) : today.getUTCMonth() + 1;

                                                                  let todayDate = today.getDate() < 10 ? "0" + String(today.getDate()) : today.getDate();

                                                                  latestOnlyDate = new Date(today.getFullYear() + '-' + todayMonth + '-' + todayDate + 'T00:00:00.000Z');


                                                                  await AssignmentModel.countDocuments({
                                                                              groupId: {
                                                                                    $in: connectionsArray
                                                                              },
                                                                              isActive: true,
                                                                              teacherDeleteAllStatus: false,
                                                                              eventDate: {
                                                                                    $gte: new Date(latestOnlyDate),
                                                                                    $lt: new Date(formattedNextDay)

                                                                              },
                                                                              $or: [{
                                                                                    "deleted": {
                                                                                          $ne: studentId
                                                                                    }
                                                                              }, {
                                                                                    "deleted": {
                                                                                          $exists: false
                                                                                    }
                                                                              }]

                                                                        })
                                                                        .exec()
                                                                        .then(recordsCount => {

                                                                              eventsCount += recordsCount;

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err)

                                                                              error = 1;

                                                                              res.status(200).json({
                                                                                    statusCode: 0,
                                                                                    message: "Something went wrong. Please try later..!!"
                                                                              })
                                                                        });

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            error = 1;

                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Access Denied..!!"
                                                            })
                                                      });

                                                index++;
                                          }

                                          if (error == 0) {

                                                if (latestOnlyDate == "") {

                                                      let today = "";

                                                      today = new Date(_date);

                                                      let nextDay = new Date(today);

                                                      nextDay.setDate(today.getDate() + 1);

                                                      let nextDayMonth = (nextDay.getUTCMonth() + 1) < 10 ? "0" + String(nextDay.getUTCMonth() + 1) : nextDay.getUTCMonth() + 1;

                                                      let nexDayDate = nextDay.getDate() < 10 ? "0" + String(nextDay.getDate()) : nextDay.getDate();

                                                      formattedNextDay = new Date(nextDay.getFullYear() + '-' + nextDayMonth + '-' + nexDayDate + 'T00:00:00.000Z');

                                                      let todayMonth = (today.getUTCMonth() + 1) < 10 ? "0" + String(today.getUTCMonth() + 1) : today.getUTCMonth() + 1;

                                                      let todayDate = today.getDate() < 10 ? "0" + String(today.getDate()) : today.getDate();

                                                      latestOnlyDate = new Date(today.getFullYear() + '-' + todayMonth + '-' + todayDate + 'T00:00:00.000Z');

                                                }

                                                PersonalEventModel.countDocuments({
                                                            userId: {
                                                                  $in: studentArray
                                                            },
                                                            isActive: true,
                                                            eventDate: {
                                                                  $gte: new Date(latestOnlyDate),
                                                                  $lt: new Date(formattedNextDay)
                                                            }
                                                      })
                                                      .exec()
                                                      .then(calendarEventsCount => {

                                                            eventsCount += calendarEventsCount

                                                            if (eventsCount > 0) {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        calendarEventsCount: eventsCount,
                                                                        date: latestOnlyDate,
                                                                        message: "Data Found...!!"
                                                                  });

                                                            } else {
                                                                  console.log(err);

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        calendarEventsCount: 0,
                                                                        date: latestOnlyDate,
                                                                        message: "No Records Found..!!"
                                                                  });
                                                            }
                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!"
                                                            })
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
                  .catch(err => {
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




exports.todayEvents = (studentId, todayDate, tomorrowDate) => {

      return new Promise((resolve, reject) => {

            if (studentId && todayDate && tomorrowDate) {

                  StudentModel.findOne({
                              _id: studentId,
                              isActive: true
                        })
                        .exec()
                        .then(studentDetails => {

                              // console.log(studentDetails);

                              if (studentDetails) {

                                    StudentModel.find({
                                                loginId: studentDetails.loginId,
                                                isActive: true
                                          }).exec()
                                          .then(async studentsList => {

                                                let calendarEventsDataConcat = new Array();
                                                let error = 0;
                                                let index = 0;
                                                let studentArray = new Array();

                                                while (error == 0 && index < studentsList.length) {

                                                      const studentId = studentsList[index]._id;

                                                      studentArray.push(studentId) // this has been used to get calendar events of all students

                                                      await ConnectionModel.find({
                                                            studentId,
                                                            connectionStatus: 2,
                                                            isActive: 1
                                                      }, {
                                                            _id: 0,
                                                            groupId: 1
                                                      }).then(async connections => {

                                                            //console.log(connections);

                                                            if (connections.length > 0) {

                                                                  connectionsArray = new Array();

                                                                  for (let index = 0; index < connections.length; index++) {
                                                                        let connection = connections[index];
                                                                        connectionsArray.push(connection.groupId)
                                                                  }

                                                                  await AssignmentModel.find({
                                                                              groupId: {
                                                                                    $in: connectionsArray
                                                                              },
                                                                              isActive: true,
                                                                              teacherDeleteAllStatus: false,
                                                                              eventDate: {
                                                                                    $gte: new Date(todayDate),
                                                                                    $lt: new Date(tomorrowDate)

                                                                              },
                                                                              $or: [{
                                                                                    "deleted": {
                                                                                          $ne: studentId
                                                                                    }
                                                                              }, {
                                                                                    "deleted": {
                                                                                          $exists: false
                                                                                    }
                                                                              }]

                                                                        })
                                                                        .sort({
                                                                              'date': -1
                                                                        })
                                                                        .populate('groupData.students', 'name profilePic')
                                                                        .populate('groupId', 'grade section groupName groupPic')
                                                                        .populate('teacherId', 'name')
                                                                        .exec()
                                                                        .then(async records => {

                                                                              console.log(records);

                                                                              if (records.length > 0) {

                                                                                    const calendarEventsData = await Calendar.parseAssignmentEvents(records, studentId, 2) //2->userType = student

                                                                                    calendarEventsDataConcat = calendarEventsDataConcat.concat(calendarEventsData);
                                                                              }

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err)
                                                                              error = 1;
                                                                              reject("Something Went Wrong. Please Try Later...!!")
                                                                        });

                                                            }

                                                      }).catch(err => {
                                                            console.log(err);
                                                            error = 1;
                                                            reject("Something Went Wrong. Please Try Later...!!")
                                                      });

                                                      index++;
                                                }

                                                if (error == 0) {

                                                      PersonalEventModel.find({
                                                                  userId: {
                                                                        $in: studentArray
                                                                  },
                                                                  isActive: true,
                                                                  eventDate: {
                                                                        $gte: new Date(todayDate),
                                                                        $lt: new Date(tomorrowDate)
                                                                  }
                                                            })
                                                            .populate('userId', '_id name')
                                                            .exec()
                                                            .then(async calendarEvents => {

                                                                  let customEvents = [];

                                                                  if (calendarEvents.length > 0) {
                                                                        customEvents = await CustomAssignments.events(calendarEvents);
                                                                  }

                                                                  if (calendarEventsDataConcat.length > 0 || customEvents.length > 0) {

                                                                        resolve(calendarEventsDataConcat.concat(customEvents));

                                                                  } else {

                                                                        resolve([]);
                                                                  }

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);
                                                                  reject("Something Went Wrong. Please Try Later...!!");
                                                            })
                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);
                                                reject("Something Went Wrong. Please Try Later...!!");
                                          })

                              } else {
                                    reject("Access Deined...!!");
                              }

                        })
                        .catch(err => {
                              console.log(err)
                              reject("Something Went Wrong. Please Try Later...!!");
                        });

            } else {
                  reject("All Fields Are Mandatory...!!");
            }

      })

}




exports.upcomingEvents = (studentId, tomorrowDate) => {

      return new Promise((resolve, reject) => {

            if (studentId && tomorrowDate) {

                  StudentModel.findOne({
                              _id: studentId,
                              isActive: true
                        })
                        .exec()
                        .then(studentDetails => {

                              // console.log(studentDetails);

                              if (studentDetails) {

                                    StudentModel.find({
                                                loginId: studentDetails.loginId,
                                                isActive: true
                                          }).exec()
                                          .then(async studentsList => {

                                                let calendarEventsDataConcat = new Array();
                                                let error = 0;
                                                let index = 0;
                                                let studentArray = new Array();

                                                while (error == 0 && index < studentsList.length) {

                                                      const studentId = studentsList[index]._id;

                                                      studentArray.push(studentId) // this has been used to get calendar events of all students

                                                      await ConnectionModel.find({
                                                            studentId,
                                                            connectionStatus: 2,
                                                            isActive: 1
                                                      }, {
                                                            _id: 0,
                                                            groupId: 1
                                                      }).then(async connections => {

                                                            //console.log(connections);

                                                            if (connections.length > 0) {

                                                                  connectionsArray = new Array();

                                                                  for (let index = 0; index < connections.length; index++) {
                                                                        let connection = connections[index];
                                                                        connectionsArray.push(connection.groupId)
                                                                  }

                                                                  await AssignmentModel.find({
                                                                              groupId: {
                                                                                    $in: connectionsArray
                                                                              },
                                                                              isActive: true,
                                                                              teacherDeleteAllStatus: false,
                                                                              eventDate: {
                                                                                    $gte: new Date(tomorrowDate)

                                                                              },
                                                                              $or: [{
                                                                                    "deleted": {
                                                                                          $ne: studentId
                                                                                    }
                                                                              }, {
                                                                                    "deleted": {
                                                                                          $exists: false
                                                                                    }
                                                                              }]

                                                                        })
                                                                        .sort({
                                                                              'eventDate': 1
                                                                        })
                                                                        .limit(5)
                                                                        .populate('groupData.students', 'name profilePic')
                                                                        .populate('groupId', 'grade section groupName groupPic')
                                                                        .populate('teacherId', 'name')
                                                                        .exec()
                                                                        .then(async records => {

                                                                              console.log(records);

                                                                              if (records.length > 0) {

                                                                                    const calendarEventsData = await Calendar.parseAssignmentEvents(records, studentId, 2) //2->userType = student

                                                                                    calendarEventsDataConcat = calendarEventsDataConcat.concat(calendarEventsData);
                                                                              }

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err)
                                                                              error = 1;
                                                                              reject("Something Went Wrong. Please Try Later...!!")
                                                                        });

                                                            }

                                                      }).catch(err => {
                                                            console.log(err);
                                                            error = 1;
                                                            reject("Something Went Wrong. Please Try Later...!!")
                                                      });

                                                      index++;
                                                }

                                                if (error == 0) {

                                                      PersonalEventModel.find({
                                                                  userId: {
                                                                        $in: studentArray
                                                                  },
                                                                  isActive: true,
                                                                  eventDate: {
                                                                        $gte: new Date(tomorrowDate)
                                                                  }
                                                            })
                                                            .populate('userId', '_id name')
                                                            .sort({
                                                                  'eventDate': 1
                                                            })
                                                            .limit(5)
                                                            .exec()
                                                            .then(async calendarEvents => {

                                                                  console.log(calendarEvents);

                                                                  let customEvents = [];

                                                                  if (calendarEvents.length > 0) {
                                                                        customEvents = await CustomAssignments.events(calendarEvents);
                                                                  }

                                                                  if (calendarEventsDataConcat.length > 0 || customEvents.length > 0) {

                                                                        let events = calendarEventsDataConcat.concat(customEvents);


                                                                        events.sort(function (a, b) {
                                                                              // Turn your strings into dates, and then subtract them
                                                                              // to get a value that is either negative, positive, or zero.
                                                                              return new Date(b.eventDate) - new Date(a.eventDate);
                                                                        });

                                                                        resolve(events);

                                                                  } else {

                                                                        resolve([]);
                                                                  }

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);
                                                                  reject("Something Went Wrong. Please Try Later...!!");
                                                            })
                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);
                                                reject("Something Went Wrong. Please Try Later...!!");
                                          })

                              } else {
                                    reject("Access Deined...!!");
                              }

                        })
                        .catch(err => {
                              console.log(err)
                              reject("Something Went Wrong. Please Try Later...!!");
                        });

            } else {
                  reject("All Fields Are Mandatory...!!");
            }

      })

}