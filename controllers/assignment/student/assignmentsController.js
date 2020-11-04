const DateDiff = require('date-diff');
const mongoose = require('mongoose');

const ConnectionModel = require('../../../models/group/connectionModel');
const AssignmentModel = require('../../../models/assignment/assignmentModel');

const ParseAssignments = require('./parseSchoolAssignmentsController')
const formatDate = require('../formatDate');
const ConnectedGroups = require('../../group/student/connectedGroups');

const StudentModel = require('../../../models/authentication/userModel');
// const PartnerModel = require('../../../models/partner/partner');

const VideosModel = require('../../../models/admin/learn/academic/videosModel');




const isItTodayCheck = (recordDate, dateType = null) => { //dateType -1 => Normal , empty  =>Assignment Record Date

      return new Promise(async (resolve, reject) => {

            try {

                  let convertedRecordDate = "";

                  if (!dateType) {
                        recordDate.setMinutes(recordDate.getMinutes() - 330);

                        console.log("record Date" + recordDate);

                        convertedRecordDate = await formatDate(recordDate);
                  } else {
                        convertedRecordDate = await formatDate(new Date(recordDate));
                  }


                  console.log("convertedRecordDate" + convertedRecordDate);

                  let todayDate = new Date();

                  // todayDate.setMinutes(todayDate.getMinutes() + 330);

                  let convertedtodayDate = await formatDate(todayDate);

                  dateDiff = new DateDiff(convertedtodayDate, new Date(convertedRecordDate));

                  dayDiff = Math.floor(dateDiff.days());

                  isItToday = (dayDiff == 0) ? "true" : "false";

                  console.log("isItToday - " + isItToday);

                  resolve(isItToday);

            } catch (error) {

                  console.log(error);
                  resolve(0)
            }


      })

}


/*******************************************************************************
 * Assignment List 
 */
exports.list = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;
            let _date = req.params.date;

            StudentModel.findOne({
                  _id: studentId,
                  type: true, //student
                  isActive: true
            })
                  .exec()
                  .then(async studentDetails => {

                        if (studentDetails) {

                              let date = "";

                              if (_date) {
                                    date = new Date(_date);
                                    isItToday = await isItTodayCheck(_date, 1);
                              } else {
                                    date = new Date();
                                    isItToday = "true";
                              }

                              let nextDay = new Date(date);

                              nextDay.setDate(date.getDate() + 1);

                              let formattedNextDay = await formatDate(nextDay);

                              let latestOnlyDate = await formatDate(date);

                              /**Connected Group List  */
                              let groupList = await ConnectedGroups.list(studentId)

                              console.log(groupList)

                              /**Check Previous Day Records to show Previous Arrow */
                              let previousDayRecord = AssignmentModel.findOne({
                                    groupId: {
                                          $in: groupList
                                    },
                                    deleted: {
                                          $nin: studentId
                                    },
                                    sentStatus: true,
                                    date: {
                                          $lt: new Date(latestOnlyDate)
                                    },
                                    isActive: true

                              }, {
                                    date: 1
                              }).sort({
                                    'date': -1
                              })
                                    .exec()

                              /**Check Future Day Records to show Next Arrow */
                              let futureDayRecord = AssignmentModel.findOne({
                                    groupId: {
                                          $in: groupList
                                    },
                                    deleted: {
                                          "$nin": studentId
                                    },
                                    sentStatus: true,
                                    isActive: true,
                                    date: {
                                          $gt: new Date(formattedNextDay)
                                    }
                              }, {
                                    date: 1
                              }).sort({
                                    'date': 1
                              })
                                    .exec()

                              /**Current Date or Selected Date Records */
                              let dayRecords = AssignmentModel.find({
                                    groupId: {
                                          $in: groupList
                                    },
                                    deleted: {
                                          $nin: studentId
                                    },
                                    sentStatus: true,
                                    isActive: true,
                                    date: {
                                          $gte: new Date(latestOnlyDate),
                                          $lt: new Date(formattedNextDay)
                                    }
                              }, {
                                    homeWork: 1,
                                    projectWork: 1,
                                    announcement: 1,
                                    test: 1,
                                    topics: 1,

                                    //common things
                                    groupId: 1,
                                    sectionType: 1,
                                    fileUrls: 1,
                                    additionalInformation: 1,
                                    cancelStatus: 1,
                                    teacherDeleteAllStatus: 1,
                                    remindedUsers: 1,
                                    sentStatus: 1,
                                    stared: 1,
                                    date: 1,
                                    studentsAddedToPortfolio: 1,
                                    updatedStatus: 1,
                                    updatedAssignmentId: 1,
                                    updatedAssignmentDate: 1
                              })
                                    .sort({
                                          'date': -1
                                    })
                                    .populate({
                                          path: 'projectWork.groupData.students',
                                          select: 'firstName surName profilePic'
                                    })
                                    .populate({
                                          path: 'groupId',
                                          select: 'grade section groupPic teacherId',
                                          populate: {
                                                path: 'teacherId',
                                                select: 'firstName surname _id',
                                          }
                                    })
                                    .exec()


                              Promise.all([previousDayRecord, futureDayRecord, dayRecords])
                                    .then(async resultArray => {

                                          console.log("complete List");
                                          console.log(resultArray);

                                          let prevDate = resultArray[0] ? await formatDate(new Date(resultArray[0].date.setMinutes(resultArray[0].date.getMinutes() - 330))) : ""

                                          let nextDate = resultArray[1] ? await formatDate(new Date(resultArray[1].date.setMinutes(resultArray[1].date.getMinutes() - 330))) : ""

                                          if (resultArray[2].length > 0) {

                                                ParseAssignments.parseAssignmentData(resultArray[2], studentId, 2, isItToday)
                                                      .then(assignmentsData => {

                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  assignmentRecords: assignmentsData,
                                                                  date: latestOnlyDate,
                                                                  prevDate,
                                                                  nextDate,
                                                                  today: isItToday,
                                                                  message: "Data Found...!!"
                                                            });

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!"
                                                            })

                                                      })

                                          } else {

                                                res.status(200).json({
                                                      statusCode: "1",
                                                      assignmentRecords: [],
                                                      date: latestOnlyDate,
                                                      prevDate,
                                                      nextDate,
                                                      today: isItToday,
                                                      message: "No Record Found...!!"
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



/*******************************************************************************
 * Remind Assignment at any time
 */
exports.reminder = (req, res, next) => {

      console.log(req.body);

      if (req.params.studentId && req.params.assignmentId && ((req.params.reminderType == 1 && req.body.reminderDateAndTime) || req.params.reminderType == 2)) { // reminderType =>  1 - set reminder 2 - remove reminder

            let studentId = req.params.studentId;
            let assignmentId = req.params.assignmentId;
            let reminderType = req.params.reminderType;
            let reminderSetDateAndTime = req.body.reminderDateAndTime;
            let reminderNote = req.body.reminderNote;

            /**Check Student Exists and is Active */
            StudentModel.findOne({
                  _id: studentId,
                  type: 1, //student
                  isActive: true
            })
                  .exec()
                  .then(async studentDetails => {

                        if (studentDetails) {

                              AssignmentModel.findOne({
                                    _id: assignmentId,
                                    // deleted: {
                                    //       $nin: studentId
                                    // },
                                    sentStatus: true,
                              })
                                    .exec()
                                    .then(result => {

                                          if (result) {

                                                if (result.isActive === true && result.cancelStatus === false && result.teacherDeleteAllStatus === false) {

                                                      AssignmentModel.findOne({
                                                            _id: assignmentId,
                                                            "remindedUsers.userId": studentId
                                                      }, {
                                                            "remindedUsers.userId.$": 1
                                                      })
                                                            .exec()
                                                            .then(alreadyReminded => {

                                                                  console.log(alreadyReminded);

                                                                  if (reminderType == 1 && !alreadyReminded) {

                                                                        AssignmentModel.updateOne({
                                                                              _id: assignmentId,
                                                                        }, {
                                                                              $push: {
                                                                                    remindedUsers: {
                                                                                          userId: studentId,
                                                                                          reminderDate: new Date(new Date(reminderSetDateAndTime).setMinutes(new Date(reminderSetDateAndTime).getMinutes() + 330)),
                                                                                          reminderNote: reminderNote
                                                                                    }
                                                                              }
                                                                        })
                                                                              .exec()
                                                                              .then(done => {

                                                                                    let remDate = new Date(new Date(reminderSetDateAndTime).setMinutes(new Date(reminderSetDateAndTime).getMinutes() + 330))

                                                                                    let splitedDate = remDate.toString().split(' ');
                                                                                    let splitTimestamp = splitedDate[4].split(':')

                                                                                    //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                                                                    let remId = String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))



                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          reminderId: remId,
                                                                                          reminderDate: new Date(new Date(reminderSetDateAndTime).setMinutes(new Date(reminderSetDateAndTime).getMinutes() + 330)),
                                                                                          reminderNote: reminderNote,
                                                                                          message: "Reminder set successfully...!!"
                                                                                    });
                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something went wrong. Please try again..!!!"
                                                                                    });
                                                                              });


                                                                  } else if (reminderType == 1 && alreadyReminded) {

                                                                        AssignmentModel.updateOne({
                                                                              _id: assignmentId,
                                                                        }, {
                                                                              $pull: {
                                                                                    "remindedUsers": {
                                                                                          userId: studentId
                                                                                    }
                                                                              }
                                                                        })
                                                                              .exec()
                                                                              .then(done => {

                                                                                    let remDate = new Date(new Date(reminderSetDateAndTime).setMinutes(new Date(reminderSetDateAndTime).getMinutes() + 330))

                                                                                    let splitedDate = remDate.toString().split(' ');
                                                                                    let splitTimestamp = splitedDate[4].split(':')

                                                                                    //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                                                                    let remId = String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))


                                                                                    AssignmentModel.updateOne({
                                                                                          _id: assignmentId,
                                                                                    }, {
                                                                                          $push: {
                                                                                                remindedUsers: {
                                                                                                      userId: studentId,
                                                                                                      reminderDate: remDate, //new Date(new Date(reminderSetDateAndTime).setMinutes(new Date(reminderSetDateAndTime).getMinutes() + 330)),
                                                                                                      reminderNote: reminderNote
                                                                                                }
                                                                                          }
                                                                                    })
                                                                                          .exec()
                                                                                          .then(done => {


                                                                                                res.status(200).json({
                                                                                                      statusCode: "1",
                                                                                                      reminderId: remId,
                                                                                                      reminderDate: remDate,
                                                                                                      reminderNote: reminderNote,
                                                                                                      message: "Reminder set successfully...!!"
                                                                                                });
                                                                                          })
                                                                                          .catch(err => {
                                                                                                console.log(err);
                                                                                                res.status(200).json({
                                                                                                      statusCode: "0",
                                                                                                      message: "Something went wrong. Please try again..!!!"
                                                                                                });
                                                                                          });
                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something went wrong. Please try again..!!!"
                                                                                    });
                                                                              });

                                                                  } else {

                                                                        AssignmentModel.updateOne({
                                                                              _id: assignmentId,
                                                                        }, {
                                                                              $pull: {
                                                                                    "remindedUsers": {
                                                                                          userId: studentId
                                                                                    }
                                                                              }
                                                                        })
                                                                              .exec()
                                                                              .then(done => {
                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          message: "Reminder removed successfully...!!"
                                                                                    });
                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something went wrong. Please try again..!!!"
                                                                                    });
                                                                              });

                                                                  }
                                                            })
                                                            .catch(err => {
                                                                  console.log(err);
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something went wrong. Please try again..!!!"
                                                                  });
                                                            });

                                                } else {

                                                      let message = (result.isActive === false || result.teacherDeleteAllStatus === true || result.teacherDeleteStatus === true) ? "Already Deleted...!!" : result.cancelStatus == true ? "Already Cancelled...!!" : "Something went wrong...!!";

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: message
                                                      })

                                                }
                                          } else {

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something went wrong. Please try again..!!"
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



/*******************************************************************************
 * Star Assignment at any time
 */
exports.star = (req, res, next) => {

      if (req.params.studentId && req.params.groupId && req.params.assignmentId) {

            let studentId = req.params.studentId;
            let groupId = req.params.groupId;
            let assignmentId = req.params.assignmentId;

            StudentModel.findOne({
                  _id: studentId,
                  type: 1, //Student
                  isActive: true
            })
                  .exec()
                  .then(studentDetails => {

                        if (studentDetails) {

                              // ConnectionModel.findOne({
                              //             studentId,
                              //             groupId,
                              //             connectionStatus: 2,
                              //             isActive: true
                              //       }, {
                              //             _id: 1
                              //       })
                              //       .then(connection => {

                              //             if (connection) {

                              AssignmentModel.findOne({
                                    _id: assignmentId,
                                    sentStatus: true,
                                    // deleted: {
                                    //       $nin: studentId
                                    // },
                                    groupId
                              })
                                    .exec()
                                    .then(result => {

                                          //console.log(result);

                                          if (result) {

                                                // if (result.deleted.indexOf(studentId) == -1) {

                                                if (result.isActive === true && result.cancelStatus === false && result.teacherDeleteAllStatus == false) {


                                                      if (result.stared.length > 0 && result.stared.indexOf(studentId) != -1) {

                                                            AssignmentModel.updateOne({
                                                                  _id: assignmentId
                                                            }, {
                                                                  $pull: {
                                                                        stared: studentId
                                                                  }
                                                            })
                                                                  .exec()
                                                                  .then(done => {
                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Unstared Successfully...!!"
                                                                        });
                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);
                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something went wrong. Please try again..!!!"
                                                                        });
                                                                  });

                                                      } else {

                                                            AssignmentModel.updateOne({
                                                                  _id: assignmentId
                                                            }, {
                                                                  $push: {
                                                                        stared: studentId
                                                                  }
                                                            })
                                                                  .exec()
                                                                  .then(done => {
                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Stared Successfully...!!"
                                                                        });
                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);
                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something went wrong. Please try again..!!!"
                                                                        });
                                                                  });

                                                      }

                                                } else {
                                                      let message = (result.isActive == false || result.teacherDeleteAllStatus == true) ? "Already Deleted...!!" : result.cancelStatus == true ? "Already Cancelled...!!" : "Something went wrong...!!";

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: message
                                                      })
                                                }

                                          } else {
                                                res.status(200).json({
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

                              //       } else {
                              //             console.log(err);
                              //             return res.status(200).json({
                              //                   statusCode: "0",
                              //                   message: "Access Denied..!!"
                              //             })
                              //       }

                              // })
                              // .catch(err => {
                              //       console.log(err);
                              //       return res.status(200).json({
                              //             statusCode: "0",
                              //             message: "Access Denied..!!"
                              //       })
                              // });
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



/**
 * Completed Homework and Announcement Status
 */
//Completed homework and announcement status
exports.updateAssignmentStatus = (req, res, next) => {

      if (req.params.studentId && req.params.groupId && req.params.assignmentId && req.body.status) {

            let studentId = req.params.studentId;
            let groupId = req.params.groupId;
            let assignmentId = req.params.assignmentId;

            /**
             * HomeWork its about not doing HomeWork & Vicecersa if already checked 1- HomeWork Done 2-HomeWork Not Done
             * Announcement Attending 1- attending  2- remove attending 3- remove completely
             */
            let completedStatus = req.body.status;
            let reason = req.body.reason;

            /**
             * Check Student Exist with given studentId and active
             */
            StudentModel.findOne({
                  _id: studentId,
                  type: 1, //Student
                  isActive: true
            })
                  .exec()
                  .then(studentDetails => {

                        if (studentDetails) {

                              /**
                               * Check Connection exists b/w student and teacher
                               */

                              // ConnectionModel.findOne({
                              //             studentId,
                              //             connectionStatus: 2,
                              //             groupId,
                              //             isActive: true
                              //       }, {
                              //             _id: 1
                              //       })
                              //       .then(connections => {

                              //             if (connections) {

                              /**
                               * Check Assignment Exists
                               */
                              AssignmentModel.findOne({
                                    _id: assignmentId,
                                    groupId,
                                    $or: [{
                                          sectionType: "HomeWork",
                                    }, {
                                          sectionType: "Announcement"
                                    }, {
                                          sectionType: "ProjectWork"
                                    }],
                                    // deleted: {
                                    //       $nin: studentId
                                    // },
                                    sentStatus: true,
                                    teacherDeleteAllStatus: false,
                                    isActive: true
                              })
                                    .exec()
                                    .then(assignmentRecord => {

                                          if (assignmentRecord) {

                                                if (assignmentRecord.sectionType == "Announcement") {


                                                      //check Announcement was not completed
                                                      let notComingRecord = AssignmentModel.findOne({
                                                            _id: assignmentId,
                                                            "notComing": mongoose.Types.ObjectId(studentId)
                                                      }, {
                                                            _id: 1
                                                      })
                                                            .exec()

                                                      let ComingRecord = AssignmentModel.findOne({
                                                            _id: assignmentId,
                                                            "coming": mongoose.Types.ObjectId(studentId)
                                                      }, {
                                                            _id: 1
                                                      })
                                                            .exec()

                                                      Promise.all([notComingRecord, ComingRecord]).then(async resultData => {

                                                            console.log(resultData);

                                                            //already updated as  notcompleted with some other reason
                                                            if (resultData[0]) {

                                                                  await AssignmentModel.updateOne({
                                                                        _id: assignmentId,
                                                                        isActive: true
                                                                  }, {
                                                                        $pull: {

                                                                              "notComing": studentId

                                                                        }
                                                                  })
                                                                        .exec()

                                                                  //already Updated as completed
                                                            } else if (resultData[1]) {

                                                                  await AssignmentModel.updateOne({
                                                                        _id: assignmentId,
                                                                        isActive: true
                                                                  }, {
                                                                        $pull: {

                                                                              "coming": studentId

                                                                        }
                                                                  })
                                                                        .exec()
                                                            }

                                                            //updating as not Coming
                                                            if (completedStatus == 2) {

                                                                  AssignmentModel.updateOne({
                                                                        _id: assignmentId,
                                                                        isActive: true
                                                                  }, {
                                                                        $push: {

                                                                              "notComing": studentId,

                                                                        }
                                                                  })
                                                                        .exec()
                                                                        .then(updatedNotDone => {

                                                                              res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    message: "Not Coming Successfull..!!"
                                                                              })

                                                                        })
                                                                        .catch(err => {

                                                                              console.log(err);

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something Went Wrong. Please Try Later..!!"
                                                                              })

                                                                        })

                                                            } else if (completedStatus == 1) {

                                                                  AssignmentModel.updateOne({
                                                                        _id: assignmentId,
                                                                        isActive: true
                                                                  }, {
                                                                        $push: {

                                                                              "coming": studentId

                                                                        }
                                                                  })
                                                                        .exec()
                                                                        .then(updatedNotDone => {

                                                                              res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    message: "Coming Successfull..!!"
                                                                              })

                                                                        })
                                                                        .catch(err => {

                                                                              console.log(err);

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something Went Wrong. Please Try Later..!!"
                                                                              })

                                                                        })

                                                            } else if (completedStatus == 3) {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "Reset Successfull..!!"
                                                                  })

                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something Went Wrong. Please Try Later..!!"
                                                                  })

                                                            }

                                                      })
                                                            .catch(err => {
                                                                  console.log(err);
                                                                  return res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something Went Wrong. Please Try Later..!!"
                                                                  })
                                                            });

                                                } else {

                                                      AssignmentModel.findOne({
                                                            _id: assignmentId,
                                                            "notCompletedStudents.userId": studentId
                                                      }, {
                                                            _id: 1
                                                      })
                                                            .exec()
                                                            .then(studentAlreadyNotSubmitted => {

                                                                  if (!studentAlreadyNotSubmitted) {

                                                                        AssignmentModel.updateOne({
                                                                              _id: assignmentId
                                                                        }, {
                                                                              $push: {
                                                                                    notCompletedStudents: {
                                                                                          userId: studentId,
                                                                                          reason: reason
                                                                                    }
                                                                              }
                                                                        })
                                                                              .exec()
                                                                              .then(success => {
                                                                                    return res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          message: "Successful..!!"
                                                                                    })
                                                                              })
                                                                              .catch(err => {
                                                                                    return res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something Went Wrong. Please Try Later..!!"
                                                                                    })
                                                                              })



                                                                  } else {

                                                                        return res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Status Already Submitted..!!"
                                                                        })

                                                                  }

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);
                                                                  return res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something Went Wrong. Please Try Later..!!"
                                                                  })
                                                            });
                                                }


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
                                                message: "Something Went Wrong. Please Try Later..!!"
                                          })
                                    });

                              //       } else {
                              //             console.log(err);
                              //             return res.status(200).json({
                              //                   statusCode: "0",
                              //                   message: "Access Denied..!!"
                              //             })
                              //       }

                              // })
                              // .catch(err => {
                              //       console.log(err);
                              //       return res.status(200).json({
                              //             statusCode: "0",
                              //             message: "Access Denied..!!"
                              //       })
                              // });

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




/** Signle Assingment Record can be used for */
exports.AssignmentRecord = (req, res, next) => {

      if (req.params.studentId && req.params.assignmentId) {

            let studentId = req.params.studentId;
            let assignmentId = req.params.assignmentId;

            StudentModel.findOne({
                  _id: studentId,
                  type: true, //Student
                  isActive: true
            })
                  .exec()
                  .then(studentDetails => {

                        if (studentDetails) {

                              AssignmentModel.findOne({
                                    _id: assignmentId,
                                    // groupId,
                                    deleted: {
                                          $nin: studentId
                                    },
                                    isActive: true

                              }, {
                                    homeWork: 1,
                                    projectWork: 1,
                                    announcement: 1,
                                    test: 1,
                                    topics: 1,

                                    //common things
                                    groupId: 1,
                                    sectionType: 1,
                                    fileUrls: 1,
                                    additionalInformation: 1,
                                    cancelStatus: 1,
                                    teacherDeleteAllStatus: 1,
                                    studentsAddedToPortfolio: 1,
                                    remindedUsers: 1,
                                    sentStatus: 1,
                                    stared: 1,
                                    date: 1,
                                    updatedStatus: 1,
                                    updatedAssignmentId: 1,
                                    updatedAssignmentDate: 1
                              })
                                    .populate({
                                          path: 'projectWork.groupData.students',
                                          select: 'firstName surName profilePic'
                                    })
                                    .populate({
                                          path: 'groupId',
                                          select: 'grade section groupPic teacherId',
                                          populate: {
                                                path: 'teacherId',
                                                select: 'firstName surname _id',
                                          }
                                    })
                                    .exec()
                                    .then(async record => {

                                          if (record) {

                                                const activityData = await ParseAssignments.parseAssignmentData([record], studentId, 2, "");

                                                console.log(activityData);

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




/** play Video in taught in class*/
exports.playVideos = (req, res, next) => {

      if (req.params.studentId && req.params.topicId) {

            let studentId = req.params.studentId;
            let videoId = req.params.videoId;
            let topicId = req.params.topicId;

            StudentModel.findOne({
                  _id: studentId,
                  isActive: true
            })
                  .exec()
                  .then(studentDetails => {

                        if (studentDetails) {

                              let VideoList = [];

                              let topicVideoQuery = {
                                    topicId,
                                    isActive: true
                              }

                              /**
                               * VideoId gets only single video
                               * To get related video we need to get based on topic Id which is not the video we had fetched
                               */
                              if (videoId) {

                                    VideoList.push(VideosModel.findOne({
                                          _id: videoId,
                                          isActive: true
                                    })
                                          .populate('partnerId')
                                          .exec())

                                    topicVideoQuery._id = {
                                          $ne: videoId
                                    }

                              }

                              VideoList.push(VideosModel.find(topicVideoQuery).populate('partnerId').exec())

                              Promise.all(VideoList)
                                    .then(async getResults => {

                                          console.log(getResults[0]);
                                          console.log(getResults[1]);

                                          let videosArray = []

                                          if (getResults.length > 0 && (getResults[0].length > 0 || getResults[1].length > 0)) {

                                                for (let index = 0; index < getResults.length; index++) {
                                                      const result = getResults[index];

                                                      if (result.length > 0) {

                                                            for (let index = 0; index < result.length; index++) {
                                                                  const video = result[index];

                                                                  while (index < 3) {

                                                                        videosArray.push({
                                                                              videoId: video._id,
                                                                              videoTitle: video.videoTitle,
                                                                              videoUrl: video.videoUrl,
                                                                              partnerName: video.partnerId ? video.partnerId.partnerName : "",
                                                                              partnerId: video.partnerId ? video.partnerId._id : "",
                                                                              // subjectId: video.subjectId,
                                                                              // chapterId: video.chapterId,
                                                                              // topicId: video.topicId,
                                                                        })

                                                                        index++

                                                                  }
                                                            }

                                                      }

                                                }

                                                res.status(200).json({
                                                      statusCode: "1",
                                                      videos: videosArray,
                                                      message: "Data Found...!!"
                                                })

                                          } else {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      videos: [],
                                                      message: "No Records Found...!!"
                                                })
                                          }

                                    })
                                    .catch(err => {

                                          console.log(err);

                                          res.status(200).json({
                                                statusCode: "0",
                                                videos: [],
                                                message: "Something Went Wrong. Please try later...!!"
                                          })
                                    })



                              // VideosModel.findOne(queryObj).exec()
                              //       .then(videoFound => {
                              //             //Search topic and get its id
                              //             TopicsModel.findOne({
                              //                         searchableTopicName: topicName
                              //                   })
                              //                   .exec()
                              //                   .then(topicFound => {

                              //                         if (topicFound) {

                              //                               //Get already seen videos to remove them from videos of that topic
                              //                               // HistoryModel.find({
                              //                               //             userId: studentId,
                              //                               //             topicId: topicFound._id,
                              //                               //             isActive: true
                              //                               //       }).exec()
                              //                               //       .then(alreadySeenVideos => {

                              //                               let alreadySeenVideosArray = new Array();

                              //                               let query = {
                              //                                     topicId: topicFound._id,
                              //                                     isActive: true
                              //                               }

                              //                               if (alreadySeenVideos.length > 0) {

                              //                                     for (let index = 0; index < alreadySeenVideos.length; index++) {
                              //                                           alreadySeenVideosArray.push(alreadySeenVideos[index]._id);
                              //                                     }

                              //                                     query._id = {
                              //                                           $nin: alreadySeenVideosArray
                              //                                     }

                              //                               }

                              //                               //Get all videos removing already seen
                              //                               VideosModel.find(query)
                              //                                     .populate('partnerId')
                              //                                     .exec()
                              //                                     .then(async videosFound => {

                              //                                           console.log(videosFound);

                              //                                           let videosArray = new Array();

                              //                                           if (videosFound) {

                              //                                                 // unseen videos are found
                              //                                                 if (videosFound.length > 0) {

                              //                                                       let index = 0

                              //                                                       while (index < 3 || index < videosFound.length) {

                              //                                                             let video = videosFound[index];

                              //                                                             videosArray.push({
                              //                                                                   videoId: video._id,
                              //                                                                   videoTitle: video.videoTitle,
                              //                                                                   videoUrl: video.videoUrl,
                              //                                                                   partner: video.partnerId.partnerName,
                              //                                                                   partner: video.partnerId._id,
                              //                                                                   subjectId: video.subjectId,
                              //                                                                   chapterId: video.chapterId,
                              //                                                                   topicId: video.topicId,
                              //                                                             })

                              //                                                             index++

                              //                                                       }
                              //                                                 }

                              //                                           }
                              //                                           //Not seen videos are less than required no i.e 3
                              //                                           if (videosArray.length < 3) {

                              //                                                 //take videos from already seen and add them to it 
                              //                                                 if (alreadySeenVideosArray.length > 0) {

                              //                                                       let seenVideosList = await VideosModel.find({
                              //                                                                   _id: {
                              //                                                                         $in: alreadySeenVideosArray
                              //                                                                   },
                              //                                                                   topicId: topicFound._id,
                              //                                                                   isActive: true,
                              //                                                             })
                              //                                                             .populate('partnerId')
                              //                                                             .exec()

                              //                                                       let notSeenVideoslength = videosArray.length

                              //                                                       for (let index = notSeenVideoslength; index < 4; index++) {
                              //                                                             const seenVideo = seenVideosList[index];

                              //                                                             videosArray.push({
                              //                                                                   videoId: seenVideo._id,
                              //                                                                   videoTitle: seenVideo.videoTitle,
                              //                                                                   videoUrl: seenVideo.videoUrl,
                              //                                                                   partner: seenVideo.partnerId.partnerName,
                              //                                                                   partner: seenVideo.partnerId._id,
                              //                                                                   subjectId: seenVideo.subjectId,
                              //                                                                   chapterId: seenVideo.chapterId,
                              //                                                                   topicId: seenVideo.topicId,
                              //                                                             })

                              //                                                       }

                              //                                                       res.status(200).json({
                              //                                                             statusCode: "1",
                              //                                                             videos: videosArray,
                              //                                                             message: "Data Found...!!"
                              //                                                       })

                              //                                                 } else {

                              //                                                       if (videosArray.length > 0) {

                              //                                                             res.status(200).json({
                              //                                                                   statusCode: "1",
                              //                                                                   videos: videosArray,
                              //                                                                   message: "Data Found...!!"
                              //                                                             })

                              //                                                       } else {
                              //                                                             res.status(200).json({
                              //                                                                   statusCode: "0",
                              //                                                                   videos: [],
                              //                                                                   message: "No Records Found...!!"
                              //                                                             })

                              //                                                       }

                              //                                                 }

                              //                                           } else {
                              //                                                 res.status(200).json({
                              //                                                       statusCode: "1",
                              //                                                       videos: videosArray,
                              //                                                       message: "Data Found...!!"
                              //                                                 })
                              //                                           }
                              //                                     })
                              //                                     .catch(err => {
                              //                                           console.log(err);

                              //                                           res.status(200).json({
                              //                                                 statusCode: "0",
                              //                                                 message: "Something went wrong...!!"
                              //                                           })

                              //                                     })
                              //                               // })

                              //                         } else {
                              //                               res.status(200).json({
                              //                                     statusCode: "0",
                              //                                     message: "No Records Found...!!"
                              //                               })
                              //                         }

                              //                   })
                              //                   .catch(err => {
                              //                         console.log(err);
                              //                         res.status(200).json({
                              //                               statusCode: "0",
                              //                               message: "Something went wrong. Please try again..!!"
                              //                         })
                              //                   })
                              //       })
                              //       .catch(err => {

                              //       })

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