const DateDiff = require('date-diff');

const AssignmentModel = require('../../../models/assignment/assignmentModel');
// const ConnectionsModel = require('../../../models/group/connectionModel');
const ClassStudentConnectionsModel = require('../../../models/classes/classStudentConnectionModel');
const AssignmentNotification = require('../../../third-party/notification/teacher/sendAssignmentNotification');

const verifyTeacher = require('../../../middleware/verifyTeacher');
const formatDate = require('../formatDate');
const GroupList = require('../../group/teacher/activeGroupsList');

const ParseAssignments = require('./parseSchoolAssignmentsController')


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
 * Star School Assignment Any Time
 */
exports.starAssignment = (req, res, next) => {

       if (req.params.teacherId && req.params.groupId && req.params.assignmentId) {

              let teacherId = req.params.teacherId;
              let assignmentId = req.params.assignmentId;
              let groupId = req.params.groupId;

              verifyTeacher(teacherId, groupId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            /**
                             * Get Assignment Exists with the given Id
                             */
                            AssignmentModel.findOne({
                                   _id: assignmentId,
                                   groupId
                            })
                                   .exec()
                                   .then(result => {

                                          //console.log(result);

                                          if (result) {

                                                 /**
                                                  * Check active, Cancel and Delete Status of the assignment 
                                                  */
                                                 if (result.isActive === true && result.cancelStatus === false && result.teacherDeleteStatus === false && result.teacherDeleteAllStatus === false) {


                                                        AssignmentModel.updateOne({
                                                               _id: assignmentId
                                                        }, {
                                                               $set: {
                                                                      teacherStared: result.teacherStared == false ? true : false
                                                               }
                                                        })
                                                               .exec()
                                                               .then(done => {

                                                                      res.status(200).json({
                                                                             statusCode: "1",
                                                                             message: result.teacherStared == false ? "Stared Successfully..!!" : "Unstared Successfully..!!"
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
                                   message: error.message
                            })
                     }
              })

       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }
}



/*******************************************************************************
 * Delete can be done for scheduled events 
 * Delete All will work for 2hr from the time of sent 
 */
exports.deleteAssignment = (req, res, next) => {

       if (req.params.teacherId && req.params.groupId && req.params.assignmentId && req.params.deleteType) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;
              let assignmentId = req.params.assignmentId;
              let deleteType = req.params.deleteType; //1-delete only for teacher 2- delete for all

              verifyTeacher(teacherId, groupId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            AssignmentModel.findOne({
                                   _id: assignmentId,
                                   groupId
                            })
                                   .exec()
                                   .then(async result => {

                                          console.log(result);

                                          if (result) {

                                                 if (result.isActive === true && result.teacherDeleteStatus === false && (result.teacherDeleteAllStatus === false || (result.teacherDeleteAllStatus === true && deleteType == 1))) {

                                                        let recordDate = result.date;

                                                        let todayDate = new Date();

                                                        let convertedRecordDate = new Date(recordDate.setMinutes(recordDate.getMinutes()));

                                                        let convertedtodayDate = new Date(todayDate.setMinutes(todayDate.getMinutes() + 330));

                                                        let dateDiff = new DateDiff(convertedtodayDate, convertedRecordDate);

                                                        console.log(dateDiff);

                                                        let minuteDiff = Math.floor(dateDiff.minutes());

                                                        console.log("isItToday - " + minuteDiff + "=" + deleteType + "=" + result.sentStatus);

                                                        let Query = "";
                                                        let error = 0;

                                                        //Normal Delete option can be done
                                                        if (deleteType == 1 && result.sentStatus == false) {

                                                               Query = {
                                                                      $set: {
                                                                             isActive: false
                                                                      }
                                                               };

                                                        } else if (deleteType == 2 && result.sentStatus == true && minuteDiff < 120) {

                                                               Query = {
                                                                      $set: {
                                                                             teacherDeleteAllStatus: true
                                                                      }
                                                               };

                                                        } else {
                                                               error = 1;
                                                               res.status(200).json({
                                                                      statusCode: "0",
                                                                      message: "Access Denied..!!"
                                                               });
                                                        }


                                                        if (error == 0) {

                                                               AssignmentModel.update({
                                                                      _id: assignmentId
                                                               }, Query)
                                                                      .exec()
                                                                      .then(assignmentDeleted => {

                                                                             if (assignmentDeleted.nModified > 0) {

                                                                                    if (deleteType == 2) {

                                                                                           let actionType = '3'; //4-Delete For All

                                                                                           let groupName = response.classData.section ? response.classData.grade + " - " + response.classData.section : response.classData.grade;

                                                                                           let assignmentType = result.sectionType == "HomeWork" ? "Home Work" : result.sectionType == "ProjectWork" ? "Project Work" : result.sectionType;

                                                                                           AssignmentNotification(response.teacherData.firstName, groupId, groupName, assignmentId, assignmentType, actionType)
                                                                                                  .then(success => {
                                                                                                         res.status(200).json({
                                                                                                                statusCode: "1",
                                                                                                                message: "Deleted...!"
                                                                                                         })
                                                                                                  })
                                                                                                  .catch(err => {
                                                                                                         console.log(err);
                                                                                                         res.status(200).json({
                                                                                                                statusCode: "0",
                                                                                                                message: "Something went wrong. Please try again..!!"
                                                                                                         });
                                                                                                  })

                                                                                    } else {
                                                                                           res.status(200).json({
                                                                                                  statusCode: "1",
                                                                                                  message: "Deleted ...!"
                                                                                           });

                                                                                    }
                                                                             } else {
                                                                                    res.status(200).json({
                                                                                           statusCode: "1",
                                                                                           message: "Something went wrong. Please try again..!!"
                                                                                    });

                                                                             }

                                                                      })
                                                                      .catch(err => {
                                                                             console.log(err);
                                                                             res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something went wrong. Please try again..!!"
                                                                             });
                                                                      });

                                                        }


                                                 } else {

                                                        let message = (result.isActive == false || result.teacherDeleteStatus === true || result.teacherDeleteAllStatus === true) ? "Already Deleted...!!" : result.cancelStatus == true ? "Already Cancelled...!!" : "Something went wrong...!!";

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
                                   message: error.message
                            })

                     }
              })
       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }
}



/*******************************************************************************
 * Cancel can be done for Upcoming events 
 */
exports.cancelAssignment = (req, res, next) => {

       if (req.params.teacherId && req.params.groupId && req.params.assignmentId) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;
              let assignmentId = req.params.assignmentId;

              verifyTeacher(teacherId, groupId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            AssignmentModel.findOne({
                                   _id: assignmentId,
                                   groupId
                            })
                                   .exec()
                                   .then(async result => {

                                          console.log(result);

                                          if (result) {

                                                 if (result.isActive === true && result.teacherDeleteStatus === false && result.cancelStatus === false && result.teacherDeleteAllStatus === false) {

                                                        if (result.sentStatus == true) {

                                                               let recordDate = result.eventDate || result.date;

                                                               console.log(recordDate);

                                                               let todayDate = new Date();

                                                               let convertedRecordDate = await formatDate(new Date(recordDate.setMinutes(recordDate.getMinutes() - 330)));

                                                               let convertedtodayDate = await formatDate(new Date(todayDate.setMinutes(todayDate.getMinutes() + 330)));

                                                               dateDiff = new DateDiff(convertedtodayDate, convertedRecordDate);

                                                               let dayDiff = "";

                                                               if (result.sectionType == "Class") {
                                                                      dayDiff = Math.floor(dateDiff.hours());
                                                               } else {
                                                                      dayDiff = Math.floor(dateDiff.days());
                                                               }

                                                               // dayDiff = Math.floor(dateDiff.hours());

                                                               //Check Previous Day
                                                               // if (dayDiff > 2) {

                                                               if (dayDiff <= 0) {

                                                                      AssignmentModel.updateOne({
                                                                             _id: assignmentId,
                                                                      }, {
                                                                             $set: {
                                                                                    cancelStatus: true
                                                                             }
                                                                      })
                                                                             .exec()
                                                                             .then(cancelledAssignment => {

                                                                                    if (cancelledAssignment.nModified == 1) {

                                                                                           let actionType = '4'; //4-cancelled

                                                                                           let groupName = response.classData.section ? response.classData.grade + " - " + response.classData.section : response.classData.grade;

                                                                                           let assignmentType = result.sectionType == "HomeWork" ? "Home Work" : result.sectionType == "ProjectWork" ? "Project Work" : result.sectionType;

                                                                                           AssignmentNotification(response.teacherData.firstName, groupId, groupName, assignmentId, assignmentType, actionType)
                                                                                                  .then(success => {
                                                                                                         res.status(200).json({
                                                                                                                statusCode: "1",
                                                                                                                message: "Cancelled Successfully...!"
                                                                                                         })
                                                                                                  })
                                                                                                  .catch(err => {
                                                                                                         console.log(err);
                                                                                                         res.status(200).json({
                                                                                                                statusCode: "0",
                                                                                                                message: "Something went wrong. Please try again..!!"
                                                                                                         });
                                                                                                  })

                                                                                    } else {
                                                                                           res.status(200).json({
                                                                                                  statusCode: "0",
                                                                                                  message: "Something went wrong. Please try again..!!"
                                                                                           });
                                                                                    }

                                                                             })
                                                                             .catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(200).json({
                                                                                           statusCode: "0",
                                                                                           message: "Something went wrong. Please try again..!!"
                                                                                    });
                                                                             });

                                                               } else {

                                                                      res.status(200).json({
                                                                             statusCode: "0",
                                                                             message: "Something Went Wrong. Please Try Later..!!"
                                                                      });

                                                               }

                                                        } else {

                                                               res.status(200).json({
                                                                      statusCode: "0",
                                                                      message: "Cannot Cancel Scheduled Assignment..!!"
                                                               });

                                                        }

                                                 } else {
                                                        let message = (result.isActive == false || result.teacherDeleteStatus === true || result.teacherDeleteAllStatus === true) ? "Already Deleted...!!" : result.cancelStatus == true ? "Already Cancelled...!!" : "Something went wrong...!!";

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
                                   message: error.message
                            })
                     }
              })
       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }
}



/*******************************************************************************
 * Get School Activity of today or selected date
 */
exports.assignmentList = async (req, res, next) => {

       if (req.params.teacherId) {

              let teacherId = req.params.teacherId;
              let _date = req.params.date;

              let date = "";

              if (_date) {
                     date = new Date(_date);
                     isItToday = await isItTodayCheck(_date, 1);
              } else {
                     date = new Date();
                     isItToday = "true";
              }

              verifyTeacher(teacherId, "", async (error, response) => {

                     if (response && response.statusCode != "0") {

                            let nextDay = new Date(date);

                            nextDay.setDate(date.getDate() + 1);

                            let formattedNextDay = await formatDate(nextDay);

                            let latestOnlyDate = await formatDate(date);

                            let groupList = await GroupList(teacherId);

                            /**Check Previous Day Records to show Previous Arrow */
                            let previousDayRecord = AssignmentModel.findOne({
                                   groupId: {
                                          $in: groupList
                                   },
                                   isActive: true,
                                   teacherDeleteStatus: false,
                                   date: {
                                          $lt: new Date(latestOnlyDate)
                                   }
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
                                   isActive: true,
                                   teacherDeleteStatus: false,
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
                                   teacherDeleteStatus: false,
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
                                   seenStudents: 1,
                                   cancelStatus: 1,
                                   teacherDeleteAllStatus: 1,
                                   teacherStared: 1,
                                   activeStudentIds: 1,
                                   upcomingDate: 1,
                                   updatedStatus: 1,
                                   updatedAssignmentId: 1,
                                   updatedAssignmentDate: 1,
                                   remindedUsers: 1,
                                   sentStatus: 1,
                                   savedDateAndTime: 1,
                                   date: 1,
                            })
                                   .sort({
                                          'date': -1
                                   })
                                   .populate({
                                          path: 'projectWork.groupData.students',
                                          select: 'firstName surName profilePic'
                                   })
                                   .populate('groupId', 'grade section groupPic')
                                   .exec()

                            /**Check Connections Exist to Give Add Option For Assignments */
                            let ConnectionsExistsForTeacher = ClassStudentConnectionsModel.findOne({
                                   // teacherId,
                                   classId: {
                                          $in: groupList
                                   },
                                   connectionStatus: 1,
                                   isActive: true
                            }, {
                                   _id: 1
                            })
                                   .exec()

                            Promise.all([previousDayRecord, futureDayRecord, dayRecords, ConnectionsExistsForTeacher])
                                   .then(async resultArray => {

                                          console.log("complete List");
                                          console.log(resultArray);

                                          let addOption = resultArray[3] ? "true" : "false";

                                          let prevDate = resultArray[0] ? await formatDate(new Date(resultArray[0].date.setMinutes(resultArray[0].date.getMinutes() - 330))) : ""

                                          let nextDate = resultArray[1] ? await formatDate(new Date(resultArray[1].date.setMinutes(resultArray[1].date.getMinutes() - 330))) : ""

                                          if (resultArray[2].length > 0) {

                                                 ParseAssignments.parseAssignmentData(resultArray[2], teacherId, 1, isItToday)
                                                        .then(assignmentsData => {

                                                               res.status(200).json({
                                                                      statusCode: "1",
                                                                      assignmentRecords: assignmentsData,
                                                                      addOption: addOption, //Need to review once again
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
                                                        addOption: addOption,
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
                            res.status(200).json({
                                   statusCode: "0",
                                   message: error.message
                            })
                     }
              })

       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }
}


/*******************************************************************************
 * Get Single Assignment for Notification and chat and calender
 */
exports.singleAssignment = (req, res, next) => {

       if (req.params.teacherId && req.params.assignmentId) {

              console.log(req.params);

              let teacherId = req.params.teacherId;
              // let groupId = req.params.groupId;
              let assignmentId = req.params.assignmentId;

              //Verify Teacher
              verifyTeacher(teacherId, "", (error, response) => { //groupId

                     if (response && response.statusCode != "0") {

                            AssignmentModel.findOne({
                                   _id: assignmentId,
                                   // groupId,
                                   isActive: true,
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
                                   seenStudents: 1,
                                   cancelStatus: 1,
                                   teacherDeleteStatus: 1,
                                   teacherDeleteAllStatus: 1,
                                   teacherStared: 1,
                                   activeStudentIds: 1,
                                   upcomingDate: 1,
                                   updatedStatus: 1,
                                   updatedAssignmentId: 1,
                                   updatedAssignmentDate: 1,
                                   remindedUsers: 1,
                                   sentStatus: 1,
                                   savedDateAndTime: 1,
                                   date: 1,
                            })
                                   .populate({
                                          path: 'projectWork.groupData.students',
                                          select: 'firstName surName profilePic'
                                   })
                                   .populate('groupId', 'grade section groupPic')
                                   .exec()
                                   .then(async record => {

                                          if (record.teacherDeleteStatus === false && record.cancelStatus === false && record.teacherDeleteAllStatus === false) {

                                                 ParseAssignments.parseAssignmentData([record], teacherId, 1, "")
                                                        .then(assignmentsData => {

                                                               res.status(200).json({
                                                                      statusCode: "1",
                                                                      assignmentRecords: assignmentsData,
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

                                                 let message = (record.teacherDeleteStatus === true || record.teacherDeleteAllStatus === true) ? "Already Deleted...!!" : record.cancelStatus == true ? "Already Cancelled...!!" : "Something went wrong...!!";

                                                 res.status(200).json({
                                                        statusCode: "0",
                                                        message: message
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
                            return res.status(200).json({
                                   statusCode: "0",
                                   message: error.message
                            })
                     }
              })
       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }
}