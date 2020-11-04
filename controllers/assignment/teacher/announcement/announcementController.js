const mongoose = require('mongoose');
const DateDiff = require('date-diff');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const BroadcastModel = require('../../../../models/assignment/broadcastModel');

/** Common files */
const ConnectedStudentsGroupCount = require('../../../group/teacher/connectedStudentsGroupsCount');
const ActiveStudents = require('../../../group/teacher/connectedStudentsList');
const DeleteAssignment = require('../deletePreviousAssignments');
const AssignmentNotification = require('../../../../third-party/notification/teacher/sendAssignmentNotification');
const Assignment = require('../../checkAssingmentExists');
const formatDate = require('../../formatDate');
const ValidateScheduledDateAndTime = require('../validateSchduledDateAndTime')


const insertBroadcast = (teacherName, groupId, groupName, announcementTitle, announcementDate, announcement, studentConfirmation, fileUrls, scheduledDateAndTime, updateType, previousAnnouncementId = null, previousAnnouncementDate = null) => {

       return new Promise(async (resolve, reject) => {

              let activeStudentIds = scheduledDateAndTime ? [] : await ActiveStudents(groupId, 1)

              let sentStatus = scheduledDateAndTime ? false : true;

              var today = scheduledDateAndTime ? new Date(new Date(scheduledDateAndTime).setMinutes(new Date(scheduledDateAndTime).getMinutes() + 330)) : new Date(new Date().setMinutes(new Date().getMinutes() + 330));

              console.log(today);

              // var today_date = new Date(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).setMinutes(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).getMinutes() + 330));

              // console.log(today_date);

              // let upcomingDate = announcementDate ? announcementDate : scheduledDateAndTime ? today : today_date;


              const AnnouncementData = new BroadcastModel({
                     _id: new mongoose.Types.ObjectId(),
                     groupId,
                     sectionType: "Announcement",
                     announcement: {
                            announcementTitle,
                            eventDate: announcementDate,
                            announcement,
                            studentConfirmation
                     },
                     fileUrls,
                     activeStudentIds,
                     sentStatus,
                     updatedStatus: (updateType == 2 || updateType == 3) ? true : false,

                     // upcomingDate
              })

              if (scheduledDateAndTime) {
                     AnnouncementData.date = today
              }

              if (previousAnnouncementId && updateType == 2) {
                     AnnouncementData.updatedAssignmentId = previousAnnouncementId;
                     AnnouncementData.updatedAssignmentDate = previousAnnouncementDate;
              }


              AnnouncementData.save()
                     .then(async savedAnnouncement => {

                            /**
                             * Update Type
                             * 1 - New Homework
                             * 2 - Previous Date (Update Id and Update Stauts)
                             * 3 - Current Date (Update Stauts)
                             * 4 - Scheduled or Future Date
                             * 5 - Current Date Less than 2 hrs(Overwrite)
                             */

                            if (updateType == 2) {

                                   await AssignmentModel.updateOne({
                                                 _id: previousAnnouncementId
                                          }, {
                                                 $set: {
                                                        updatedAssignmentId: savedAnnouncement._id,
                                                        updatedAssignmentDate: savedAnnouncement.date,
                                                        updatedStatus: true,
                                                        previousRecord: true
                                                 }
                                          })
                                          .exec()
                            }

                            let actionType = updateType == 1 ? 1 : 2

                            if (updateType != 4) {

                                   AssignmentNotification(teacherName, groupId, groupName, savedAnnouncement._id, "Announcement", actionType)
                                          .then(success => {
                                                 resolve(1);
                                          })
                                          .catch(err => {
                                                 console.log(err);
                                                 reject(0);
                                          })

                            } else {
                                   resolve(1);
                            }

                     })
                     .catch(err => {
                            reject(new Error(err));
                     })
       });
}



exports.saveBroadcast = async (req, res, next) => {

       let fileUrls = new Array();

       if (req.files) {
              let filesArray = req.files;

              filesArray.forEach(file => {
                     let correctPath = file.path.replace(/\\/g, '/');
                     fileUrls.push(correctPath);
              });
       }

       if (req.body.teacherId && req.body.groupIds && (req.body.announcementTitle || req.body.announcementDate || req.body.announcement || fileUrls.length > 0)) {

              let teacherId = req.body.teacherId;
              let groupIds = req.body.groupIds;
              let announcementTitle = req.body.announcementTitle;
              let announcementDate = req.body.announcementDate;
              let announcement = req.body.announcement;
              let studentConfirmation = req.body.studentConfirmation;
              let scheduledDateAndTime = req.body.dateAndTime;

              let validateScheduledDateAndTime = scheduledDateAndTime ? await ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

              if (validateScheduledDateAndTime != 0) {

                     VerifyTeacher(teacherId, groupIds, async (error, response) => {

                            if (response && response.statusCode != "0") {

                                   ConnectedStudentsGroupCount(groupIds)
                                          .then(async groupsData => {

                                                 let groupIdArray = groupIds.split(',').filter(e => e);

                                                 if (groupsData.groupsCount == groupIdArray.length) {

                                                        let studentConfirmationData = studentConfirmation == "true" ? true : false;

                                                        let daysDiff = "";
                                                        let scheduleDaysDiff = "";

                                                        //Announcement date should be greater than today and greater than to scheduled date
                                                        if (announcementDate) {

                                                               let formattedToday = await formatDate(new Date())
                                                               let diff = new DateDiff(new Date(formattedToday), new Date(announcementDate));
                                                               daysDiff = Math.floor(diff.days());

                                                        }

                                                        if (scheduledDateAndTime && announcementDate) {

                                                               let formattedScheduleDay = await formatDate(new Date(scheduledDateAndTime));
                                                               let schdeuledDiff = new DateDiff(new Date(formattedScheduleDay), new Date(announcementDate));
                                                               scheduleDaysDiff = Math.floor(schdeuledDiff.days());

                                                        }

                                                        if (((announcementDate && daysDiff < 0) || !announcementDate) && ((scheduleDaysDiff < 0 && scheduledDateAndTime) || !scheduledDateAndTime)) {

                                                               let updateType = 1;
                                                               let index = 0;
                                                               let insertedAnnoucements = [];

                                                               if (!response.classData[0]) {
                                                                      response.classData = [response.classData];
                                                               }

                                                               while (index < groupIdArray.length) {

                                                                      let groupName = response.classData[index].section ? response.classData[index].grade + " - " + response.classData[index].section : response.classData[index].grade;

                                                                      insertedAnnoucements.push(insertBroadcast(response.teacherData.firstName, response.classData[index]._id, groupName, announcementTitle, announcementDate, announcement, studentConfirmationData, fileUrls, scheduledDateAndTime, updateType)) // update type 1 is used to send notification as new assignment

                                                                      index++;
                                                               }

                                                               Promise.all(insertedAnnoucements)
                                                                      .then(success => {
                                                                             res.status(200).json({
                                                                                    "statusCode": 1,
                                                                                    "message": "Successfull..!"
                                                                             })
                                                                      })
                                                                      .catch(err => {
                                                                             console.log(err);
                                                                             res.status(200).json({
                                                                                    "statusCode": "0",
                                                                                    "message": "Something Went Wrong. Please try later..!!"
                                                                             })
                                                                      })
                                                        } else {

                                                               let errorMessage = (announcementDate != "" && daysDiff >= 0) && (scheduleDaysDiff >= 0 && scheduleDaysDiff != "") ? "Announcement Date and Scheduled Date Should be future dates" : (announcementDate != "" && daysDiff >= 0) ? "Announcement Date Should be future dates" : "Scheduled Date Should be future dates"

                                                               res.status(200).json({
                                                                      "statusCode": "0",
                                                                      "message": errorMessage
                                                               })
                                                        }



                                                 } else {
                                                        res.status(200).json({
                                                               statusCode: "0",
                                                               message: "Please add students...!!"
                                                        })
                                                 }

                                          })
                                          .catch(err => {
                                                 console.log(err);

                                                 res.status(200).json({
                                                        statusCode: "0",
                                                        message: "Something Went Wrong. Please try Later..!!"
                                                 })
                                          })

                            } else {
                                   res.status(200).json({
                                          "statusCode": "0",
                                          "message": error.message
                                   })
                            }

                     })

              } else {

                     res.status(200).json({
                            "statusCode": "0",
                            "message": "Please choose future dates..!!"
                     })

              }


       } else {
              res.status(200).json({
                     "statusCode": "0",
                     "message": "All Fields are mandatory...!!"
              })
       }

}



exports.getBroadcast = (req, res, next) => {

       if (req.params.teacherId && req.params.groupId && req.params.announcementId) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;
              let announcementId = req.params.announcementId;


              //check Student Exists
              VerifyTeacher(teacherId, groupId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            AssignmentModel.findOne({
                                          groupId: groupId,
                                          _id: announcementId,
                                          sectionType: "Announcement",
                                          cancelStatus: false,
                                          teacherDeleteStatus: false,
                                          teacherDeleteAllStatus: false,
                                          isActive: true
                                   }, {
                                          announcement: 1,
                                          fileUrls: 1,
                                          sentStatus: 1,
                                          date: 1
                                   })
                                   .exec()
                                   .then(Announcement => {

                                          console.log(Announcement);

                                          if (Announcement) {

                                                 res.status(200).json({
                                                        "statusCode": "1",
                                                        "_id": Announcement._id,
                                                        "title": Announcement.announcement.announcementTitle ? Announcement.announcement.announcementTitle : "",
                                                        "eventDate": Announcement.announcement.eventDate ? Announcement.announcement.eventDate : "",
                                                        "announcement": Announcement.announcement.announcement ? Announcement.announcement.announcement : "",
                                                        "studentConfirmation": Announcement.announcement.studentConfirmation,
                                                        "fileUrls": Announcement.fileUrls ? Announcement.fileUrls : [],
                                                        "scheduleDateAndTime": Announcement.sentStatus == false ? Announcement.date : "",
                                                        "message": "Data Found"
                                                 });

                                          } else {

                                                 res.status(200).json({
                                                        "statusCode": "0",
                                                        "message": "Something Went Wrong.Please try later..!!"
                                                 });

                                          }

                                   })
                                   .catch(err => {
                                          console.log(err)
                                          res.status(200).json({
                                                 "statusCode": "0",
                                                 "message": "Something went wrong. Please try later..!!"
                                          })
                                   })

                     } else {
                            return res.status(200).json({
                                   statusCode: "0",
                                   message: error.message
                            })
                     }
              })

       } else {
              res.status(200).json({
                     "statusCode": "0",
                     "message": "All Fields are mandatory...!!"
              })
       }

}



exports.updateBroadcast = async (req, res, next) => {

       let fileUrls = new Array();

       if (req.files) {

              let filesArray = req.files;

              filesArray.forEach(file => {
                     let correctPath = file.path.replace(/\\/g, '/');
                     fileUrls.push(correctPath);
              });
       }

       if (req.params.teacherId && req.params.groupId && req.params.announcementId && (req.body.announcementTitle || req.body.announcementDate || req.body.announcement || req.body.announcementUrls || fileUrls.length > 0)) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;
              let announcementId = req.params.announcementId;

              let announcementTitle = req.body.announcementTitle
              let announcementDate = req.body.announcementDate
              let announcement = req.body.announcement
              let studentConfirmation = req.body.studentConfirmation
              let announcementUrls = req.body.announcementUrls
              let scheduledDateAndTime = req.body.dateAndTime;

              if (announcementUrls) {
                     announcementUrls.split('%-%').forEach(url => {
                            if (url.trim()) {
                                   fileUrls.push(url);
                            }
                     });
              }

              let validateScheduledDateAndTime = scheduledDateAndTime ? await ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

              if (validateScheduledDateAndTime != 0) {

                     VerifyTeacher(teacherId, groupId, (error, response) => {

                            if (response && response.statusCode != "0") {

                                   Assignment.checkAssignmentExists(announcementId, groupId, "Announcement")
                                          .then(async recordFound => {

                                                 if (recordFound) {

                                                        let studentConfirmationData = studentConfirmation == "true" ? true : false;

                                                        let daysDiff = "";
                                                        let scheduleDaysDiff = "";

                                                        if (announcementDate) {

                                                               let formattedToday = await formatDate(new Date())
                                                               let diff = new DateDiff(new Date(formattedToday), new Date(announcementDate));
                                                               daysDiff = Math.floor(diff.days());
                                                               console.log(daysDiff + "daysDiff");

                                                        }

                                                        if (scheduledDateAndTime && announcementDate) {

                                                               let formattedScheduleDay = await formatDate(new Date(scheduledDateAndTime));
                                                               let schdeuledDiff = new DateDiff(new Date(formattedScheduleDay), new Date(announcementDate));
                                                               scheduleDaysDiff = Math.floor(schdeuledDiff.days());

                                                               console.log(scheduleDaysDiff + "scheduleDaysDiff");

                                                        }

                                                        if (((announcementDate && daysDiff < 0) || !announcementDate) && (scheduleDaysDiff < 0 || !scheduleDaysDiff)) {

                                                               ConnectedStudentsGroupCount(groupId)
                                                                      .then(async groupsData => {

                                                                             if (groupsData.groupsCount == 1) {

                                                                                    let groupName = response.classData.section ? response.classData.grade + "-" + response.classData.section : response.classData.grade;

                                                                                    let currentDayAssignmentDateDiff = Math.floor(new DateDiff(await formatDate(new Date(new Date().setMinutes(new Date().getMinutes() + 330))), await formatDate(new Date(recordFound.date))).days());

                                                                                    let updateType = 4;

                                                                                    if (recordFound.sentStatus == true) {
                                                                                           /**
                                                                                            * Update Type
                                                                                            * 1 - New Homework
                                                                                            * 2 - Previous Date(Update Id and Update Stauts) 
                                                                                            * 3 - Current Date greater than 2 hrs(Update Stauts) 
                                                                                            * 4 - Scheduled or Future Date 
                                                                                            * 5 - Current Date Less than 2 hrs(Overwrite)
                                                                                            */

                                                                                           let hourDiff = new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), new Date(recordFound.date)).minutes();

                                                                                           console.log(hourDiff + " - hourDiff");

                                                                                           updateType = currentDayAssignmentDateDiff == 0 && hourDiff > 120 ? 3 : currentDayAssignmentDateDiff > 0 ? 2 : currentDayAssignmentDateDiff == 0 && hourDiff <= 120 ? 5 : 4

                                                                                    }

                                                                                    insertBroadcast(response.teacherData.firstName, groupId, groupName, announcementTitle, announcementDate, announcement, studentConfirmationData, fileUrls, scheduledDateAndTime, updateType, announcementId, recordFound.date)
                                                                                           .then(announcementSaved => {

                                                                                                  /**Current or future dates should be deleted */
                                                                                                  if (currentDayAssignmentDateDiff <= 0) {

                                                                                                         DeleteAssignment(announcementId)
                                                                                                                .then(deletedPreviousAssignment => {
                                                                                                                       res.status(200).json({
                                                                                                                              "statusCode": 1,
                                                                                                                              "message": "Successfull..!!"
                                                                                                                       })
                                                                                                                })
                                                                                                                .catch(err => {
                                                                                                                       console.log(err);
                                                                                                                       res.status(200).json({
                                                                                                                              "statusCode": 0,
                                                                                                                              "message": "Something went wrong. Please try later"
                                                                                                                       })
                                                                                                                })

                                                                                                  } else {
                                                                                                         res.status(200).json({
                                                                                                                "statusCode": 1,
                                                                                                                "message": "Successfull..!!"
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
                                                                                    res.status(200).json({
                                                                                           statusCode: "0",
                                                                                           message: "Please add students...!!"
                                                                                    })
                                                                             }

                                                                      })
                                                                      .catch(err => {
                                                                             console.log(err);

                                                                             res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something Went Wrong. Please try Later..!"
                                                                             })
                                                                      })

                                                        } else {

                                                               if (!daysDiff) {
                                                                      res.status(200).json({
                                                                             statusCode: "0",
                                                                             message: "Access Denied..!!"
                                                                      })
                                                               } else {
                                                                      res.status(200).json({
                                                                             statusCode: "0",
                                                                             message: "Event or Announcement date should be future dates..!!"
                                                                      })
                                                               }

                                                        }

                                                 } else {
                                                        res.status(200).json({
                                                               statusCode: "0",
                                                               message: "No Records Found..!!"
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
                                          message: error.message
                                   })
                            }
                     })

              } else {
                     res.status(200).json({
                            "statusCode": "0",
                            "message": "Please check future date...!!"
                     })
              }

       } else {
              res.status(200).json({
                     "statusCode": "0",
                     "message": "All Fields are mandatory...!!"
              })
       }

}



exports.forwardBroadcast = (req, res, next) => {

       if (req.params.teacherId && req.params.groupId && req.body.groupIds && req.params.announcementId) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;
              let announcementId = req.params.announcementId;
              let groupIds = req.body.groupIds;


              VerifyTeacher(teacherId, groupIds, (error, response) => {

                     if (response && response.statusCode != "0") {

                            Assignment.checkAssignmentExists(announcementId, groupId, "Announcement")
                                   .then(announcementData => {

                                          if (announcementData) {

                                                 let announcementTitle = announcementData.announcement.announcementTitle;
                                                 let announcementDate = announcementData.announcement.eventDate;
                                                 let announcement = announcementData.announcement.announcement;
                                                 let studentConfirmationData = announcementData.announcement.studentConfirmation;
                                                 let fileUrls = announcementData.fileUrls;

                                                 ConnectedStudentsGroupCount(groupIds)
                                                        .then(groupsData => {

                                                               let groupIdArray = groupIds.split(',').filter(e => e);

                                                               if (groupsData.groupsCount == groupIdArray.length) {

                                                                      let insertedAnnoucements = [];

                                                                      if (!response.classData[0]) {
                                                                             response.classData = [response.classData];
                                                                      }

                                                                      for (let index = 0; index < response.classData.length; index++) {
                                                                             const groupDetails = response.classData[index];

                                                                             let groupName = groupDetails.section ? groupDetails.grade + "-" + groupDetails.section : groupDetails.grade

                                                                             insertedAnnoucements.push(insertBroadcast(response.teacherData.firstName, groupDetails._id, groupName, announcementTitle, announcementDate, announcement, studentConfirmationData, fileUrls, "", 1)) //1- specifies notification should be sent as new one
                                                                      }

                                                                      Promise.all(insertedAnnoucements)
                                                                             .then(success => {

                                                                                    res.status(200).json({
                                                                                           statusCode: "1",
                                                                                           message: "Announcement has been forwarded successfully...!!"
                                                                                    })

                                                                             }).catch(err => {

                                                                                    console.log(err);

                                                                                    res.status(200).json({
                                                                                           statusCode: "0",
                                                                                           message: "Something went wrong. Please try later...!!"
                                                                                    })
                                                                             })

                                                               } else {
                                                                      res.status(200).json({
                                                                             statusCode: "0",
                                                                             message: "Please add students...!!"
                                                                      })
                                                               }

                                                        })
                                                        .catch(err => {
                                                               console.log(err);

                                                               res.status(200).json({
                                                                      statusCode: "0",
                                                                      message: "Something Went Wrong. Please try Later..!"
                                                               })
                                                        })



                                          } else {
                                                 res.status(200).json({
                                                        statusCode: "0",
                                                        message: "No Records Found..!!"
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
                                   message: error.message
                            })
                     }
              })

       } else {
              res.status(200).json({
                     "statusCode": "0",
                     "message": "All Fields are mandatory...!!"
              })
       }

}