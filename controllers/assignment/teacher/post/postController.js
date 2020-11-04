const mongoose = require('mongoose');
const DateDiff = require('date-diff');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const AssignmentModel = require('../../../../models/assignment/assignmentModel')

/** Common files */
const ConnectedStudentsGroupCount = require('../../../group/teacher/connectedStudentsGroupsCount');
const ActiveStudents = require('../../../group/teacher/connectedStudentsList');
const DeleteAssignment = require('../deletePreviousAssignments');
const AssignmentNotification = require('../../../../third-party/notification/teacher/sendAssignmentNotification');
const Assignment = require('../../checkAssingmentExists');
const formatDate = require('../../formatDate');
const ValidateScheduledDateAndTime = require('../validateSchduledDateAndTime')


const insertPost = (teacherId, teacherName, classId, groupName, post, fileUrls, scheduledDateAndTime, updateType, previousAnnouncementId = null, previousAnnouncementDate = null) => {

      return new Promise(async (resolve, reject) => {

            let activeStudentIds = scheduledDateAndTime ? [] : await ActiveStudents(classId, 1)

            let sentStatus = scheduledDateAndTime ? false : true;

            var today = scheduledDateAndTime ? new Date(new Date(scheduledDateAndTime).setMinutes(new Date(scheduledDateAndTime).getMinutes() + 330)) : new Date(new Date().setMinutes(new Date().getMinutes() + 330));

            console.log(today);

            // var today_date = new Date(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).setMinutes(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).getMinutes() + 330));

            // console.log(today_date);

            // let upcomingDate = announcementDate ? announcementDate : scheduledDateAndTime ? today : today_date;


            const PostData = new AssignmentModel({
                  _id: new mongoose.Types.ObjectId(),
                  teacherId,
                  groupId: classId,
                  sectionType: "Post",
                  announcement: post,
                  fileUrls,
                  activeStudentIds,
                  sentStatus,
                  updatedStatus: (updateType == 2 || updateType == 3) ? true : false,
                  // upcomingDate
            })

            if (scheduledDateAndTime) {
                  PostData.scheduledDateAndTime = scheduledDateAndTime
            }

            // if (previousAnnouncementId && updateType == 2) {
            //       PostData.updatedAssignmentId = previousAnnouncementId;
            //       PostData.updatedAssignmentDate = previousAnnouncementDate;
            // }


            PostData.save()
                  .then(async savedPost => {

                        /**
                         * Update Type
                         * 1 - New Homework
                         * 2 - Previous Date (Update Id and Update Stauts)
                         * 3 - Current Date (Update Stauts)
                         * 4 - Scheduled or Future Date
                         * 5 - Current Date Less than 2 hrs(Overwrite)
                         */

                        // if (updateType == 2) {

                        //       await AssignmentModel.updateOne({
                        //             _id: previousAnnouncementId
                        //       }, {
                        //             $set: {
                        //                   updatedAssignmentId: savedPost._id,
                        //                   updatedAssignmentDate: savedPost.date,
                        //                   updatedStatus: true,
                        //                   previousRecord: true
                        //             }
                        //       })
                        //             .exec()
                        // }

                        let actionType = updateType == 1 ? 1 : 2

                        if (updateType != 4) {

                              AssignmentNotification(teacherName, classId, groupName, savedPost._id, "Post", actionType)
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



exports.savePost = async (req, res, next) => {

      let fileUrls = new Array();

      if (req.files) {
            let filesArray = req.files;

            filesArray.forEach(file => {
                  let correctPath = file.path.replace(/\\/g, '/');
                  fileUrls.push(correctPath);
            });
      }

      if (req.body.teacherId && req.body.classIds && (req.body.post || fileUrls.length > 0)) {

            let teacherId = req.body.teacherId;
            let classIds = req.body.classIds;
            let post = req.body.post;
            let scheduledDateAndTime = req.body.dateAndTime;

            let validateScheduledDateAndTime = scheduledDateAndTime ? await ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

            if (validateScheduledDateAndTime != 0) {

                  VerifyTeacher(teacherId, classIds, async (error, response) => {

                        if (response && response.statusCode != "0") {

                              ConnectedStudentsGroupCount(classIds)
                                    .then(async classData => {

                                          let groupIdArray = classIds.split(',').filter(e => e);

                                          if (classData.groupsCount == groupIdArray.length) {

                                                let updateType = 1;
                                                let index = 0;
                                                let insertedPosts = [];

                                                if (!response.classData[0]) {
                                                      response.classData = [response.classData];
                                                }

                                                while (index < groupIdArray.length) {

                                                      let groupName = response.classData[index].section ? response.classData[index].grade + " - " + response.classData[index].section : response.classData[index].grade;

                                                      insertedPosts.push(insertPost(teacherId, response.teacherData.firstName, response.classData[index]._id, groupName, post, fileUrls, scheduledDateAndTime, updateType)) // update type 1 is used to send notification as new assignment

                                                      index++;
                                                }

                                                Promise.all(insertedPosts)
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



exports.getPost = (req, res, next) => {

      if (req.params.teacherId && req.params.classId && req.params.postId) {

            let teacherId = req.params.teacherId;
            let classId = req.params.classId;
            let postId = req.params.postId;


            //check Student Exists
            VerifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        AssignmentModel.findOne({
                              groupId: classId,
                              _id: postId,
                              sectionType: "Post",
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
                              .then(Post => {

                                    console.log(Post);

                                    if (Post) {

                                          res.status(200).json({
                                                "statusCode": "1",
                                                "_id": Post._id,
                                                "post": Post.announcement ? Post.announcement : "",
                                                "fileUrls": Post.fileUrls ? Post.fileUrls : [],
                                                "scheduleDateAndTime": Post.sentStatus == false ? Post.date : "",
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



exports.updatePost = async (req, res, next) => {

      let fileUrls = new Array();

      if (req.files) {

            let filesArray = req.files;

            filesArray.forEach(file => {
                  let correctPath = file.path.replace(/\\/g, '/');
                  fileUrls.push(correctPath);
            });
      }

      if (req.params.teacherId && req.params.classId && req.params.postId && (req.body.post || req.body.postUrls || fileUrls.length > 0)) {

            let teacherId = req.params.teacherId;
            let classId = req.params.classId;
            let postId = req.params.postId;

            let post = req.body.post;
            let scheduledDateAndTime = req.body.dateAndTime;

            if (req.body.postUrls) {
                  req.body.postUrls.split('%-%').forEach(url => {
                        if (url.trim()) {
                              fileUrls.push(url);
                        }
                  });
            }

            let validateScheduledDateAndTime = scheduledDateAndTime ? await ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

            if (validateScheduledDateAndTime != 0) {

                  VerifyTeacher(teacherId, classId, (error, response) => {

                        if (response && response.statusCode != "0") {

                              Assignment.checkAssignmentExists(postId, classId, "Post")
                                    .then(async recordFound => {

                                          if (recordFound) {

                                                ConnectedStudentsGroupCount(classId)
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

                                                                  insertPost(teacherId, response.teacherData.firstName, classId, groupName, post, fileUrls, scheduledDateAndTime, updateType, postId, recordFound.date)
                                                                        .then(announcementSaved => {

                                                                              /**Current or future dates should be deleted */
                                                                              if (currentDayAssignmentDateDiff <= 0) {

                                                                                    DeleteAssignment(postId)
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



exports.forwardPost = (req, res, next) => {

      if (req.params.teacherId && req.params.classId && req.body.classIds && req.params.postId) {

            let teacherId = req.params.teacherId;
            let classId = req.params.classId;
            let postId = req.params.postId;
            let classIds = req.body.classIds;


            VerifyTeacher(teacherId, classIds, (error, response) => {

                  if (response && response.statusCode != "0") {

                        Assignment.checkAssignmentExists(postId, classId, "Announcement")
                              .then(announcementData => {

                                    if (announcementData) {

                                          let post = req.body.post;
                                          let fileUrls = announcementData.fileUrls;

                                          ConnectedStudentsGroupCount(classIds)
                                                .then(groupsData => {

                                                      let groupIdArray = classIds.split(',').filter(e => e);

                                                      if (groupsData.groupsCount == groupIdArray.length) {

                                                            let insertedPosts = [];

                                                            if (!response.classData[0]) {
                                                                  response.classData = [response.classData];
                                                            }

                                                            for (let index = 0; index < response.classData.length; index++) {
                                                                  const groupDetails = response.classData[index];

                                                                  let groupName = groupDetails.section ? groupDetails.grade + "-" + groupDetails.section : groupDetails.grade

                                                                  insertedPosts.push(insertPost(teacherId, response.teacherData.firstName, groupDetails._id, groupName, post, fileUrls, "", 1)) //1- specifies notification should be sent as new one
                                                            }

                                                            Promise.all(insertedPosts)
                                                                  .then(success => {

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Successfull...!!"
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



exports.viewPost = (req, res, next) => {

      if (req.params.teacherId && req.params.classId && req.params.postId) {

            let teacherId = req.params.teacherId;
            let classId = req.params.classId;
            let postId = req.params.postId;

            VerifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        AssignmentModel.findOne({
                              _id: postId,
                              groupId: classId,
                              sectionType: "Post",
                              teacherDeleteAllStatus: false,
                              teacherDeleteStatus: false,
                              isActive: true
                        }, {
                              "groupId": 1,
                              "announcement": 1,
                              "additionalInformation": 1,
                              "fileUrls": 1,
                              "cancelStatus": 1,
                              "sentStatus": 1,
                              "scheduledDateAndTime": 1,
                              "date": 1
                        })
                              .populate('groupId', 'grade section gradeId groupPic')
                              .exec()
                              .then(async result => {

                                    console.log(result);

                                    if (result) {

                                          let completionDayDiff = new DateDiff(new Date(await formatDate(new Date())), new Date(await formatDate(result.date)));

                                          res.status(200).json({
                                                statusCode: "1",
                                                postId: result._id,
                                                sectionType: result.sectionType,
                                                groupName: result.groupId.grade + " " + result.groupId.section,
                                                groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",

                                                announcement: result.announcement,
                                                fileUrls: result.fileUrls ? result.fileUrls : [],

                                                showOptions: completionDayDiff.days() <= 0 ? 1 : 2, //1-Event Not Completed Show Edit, Delete and Cancel //2-Event Completed Resend Option

                                                cancelStatus: result.cancelStatus,
                                                sentStatus: result.sentStatus,
                                                scheduledDateAndTime: result.sentStatus == false ? result.scheduledDateAndTime : "",
                                                date: result.date,
                                                message: "Data Found...!"
                                          });


                                    } else {
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "No Record Found..!!"
                                          });
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. Please try again..!!"
                                    })
                              });
                  } else {
                        res.status(200).json({
                              statusCode: "0",
                              message: error.message
                        })
                  }
            })

      } else {
            res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}
