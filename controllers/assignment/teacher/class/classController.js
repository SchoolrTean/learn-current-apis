const mongoose = require('mongoose');
const DateDiff = require('date-diff');

const verifyTeacher = require('../../../../middleware/verifyTeacher');

const formatDate = require('../../formatDate');

const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const SubjectModel = require('../../../../models/admin/master/academic/subjectsModel');
const ChapterModel = require('../../../../models/admin/learn/academic/chaptersModel');
const TopicsModel = require('../../../../models/admin/learn/academic/topicsModel');

/** Common files */
const ConnectedStudentsGroupCount = require('../../../group/teacher/connectedStudentsGroupsCount');
const ActiveStudents = require('../../../group/teacher/connectedStudentsList');
const DeleteAssignment = require('../deletePreviousAssignments');
const AssignmentNotification = require('../../../../third-party/notification/teacher/sendAssignmentNotification');
const Assignment = require('../../checkAssingmentExists');
const ValidateScheduledDateAndTime = require('../validateSchduledDateAndTime')




const insertClass = (teacherId, teacherName, groupId, groupName, classRoomData, additionalInformation, fileUrls, scheduledDateAndTime, updatedStatus) => { // previousHomeWorkId = null, previousHomeWorkDate = null //,

      return new Promise(async (resolve, reject) => {

            try {

                  let activeStudentIds = scheduledDateAndTime ? [] : await ActiveStudents(groupId, 1)

                  const NewClass = new AssignmentModel({
                        _id: new mongoose.Types.ObjectId(),
                        teacherId,
                        groupId,
                        sectionType: "Class",

                        subject: classRoomData.subject,
                        title: "",
                        eventDate: new Date(new Date(classRoomData.eventDate).setMinutes(new Date(classRoomData.eventDate).getMinutes() + 330)),
                        duration: classRoomData.duration,
                        chapter: classRoomData.chapter,
                        topics: classRoomData.topics,

                        additionalInformation,
                        fileUrls,
                        activeStudentIds,
                        sentStatus: scheduledDateAndTime ? false : true,
                        scheduledDateAndTime: scheduledDateAndTime ? new Date(new Date(scheduledDateAndTime).setMinutes(new Date(scheduledDateAndTime).getMinutes() + 330)) : "",
                        updatedStatus: (updatedStatus == 2 || updatedStatus == 3) ? true : false,
                  })


                  // if (updateType == 2 || updateType == 3) {
                  //       homeWork.lastActionTimeStamp = new Date(new Date().setMinutes(new Date().getMinutes() + 330));
                  // }

                  // if (previousHomeWorkId && updateType == 2) {
                  //       homeWork.updatedAssignmentId = previousHomeWorkId;
                  //       homeWork.updatedAssignmentDate = previousHomeWorkDate;
                  // }

                  NewClass.save()
                        .then(async savedClass => {

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
                              //             _id: previousHomeWorkId
                              //       }, {
                              //             $set: {
                              //                   updatedAssignmentId: savedHomeWork._id,
                              //                   updatedAssignmentDate: savedHomeWork.date,
                              //                   updatedStatus: true,
                              //                   previousRecord: true
                              //             }
                              //       })
                              //             .exec()
                              // }

                              let actionType = updatedStatus == 1 ? 1 : 2

                              if (updatedStatus != 4) {

                                    AssignmentNotification(teacherName, groupId, groupName, savedClass._id, "Class", actionType)
                                          .then(success => {
                                                resolve("done");
                                          })
                                          .catch(err => {
                                                console.log(err);
                                                reject(0);
                                          })

                              } else {
                                    resolve("done");
                              }

                        })
                        .catch(err => {
                              console.log(err);
                              reject(0);
                        });

            } catch (error) {
                  console.log(error)
                  reject(0);
            }

      })
}




exports.saveClass = (req, res, next) => {

      try {
            let fileUrls = new Array();

            if (req.files) {

                  let uploadedFileUrlsArray = req.files;

                  uploadedFileUrlsArray.forEach(file => {
                        let correctPath = file.path.replace(/\\/g, '/');
                        fileUrls.push(correctPath);
                  });
            }

            console.log(req.body)

            if (req.body.teacherId && req.body.teacherId.trim() && req.body.classId && req.body.classId.trim() && req.body.subjectName && req.body.subjectName.trim() && req.body.classDateAndTime && req.body.classDateAndTime.trim() && req.body.classDuration && req.body.classDuration.trim()) //&& req.body.date //|| fileUrls.length > 0 //&& req.body.chapter && req.body.topics
            {

                  let teacherId = req.body.teacherId;
                  let classId = req.body.classId;
                  let subjectName = req.body.subjectName.trim().toLowerCase();

                  let classDateAndTime = req.body.classDateAndTime.trim();
                  let classDuration = req.body.classDuration.trim();

                  let chapterName = req.body.chapter.trim();
                  let topics = req.body.topics.trim();

                  let instructions = req.body.instructions.trim();
                  let scheduledDateAndTime = req.body.scheduleDateAndTime.trim();

                  //Validate Scheduled Date for previous Date Detection
                  let validateDate = scheduledDateAndTime ? ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

                  let validateClassDate = ValidateScheduledDateAndTime(classDateAndTime);

                  // let validateHomeWork = ValidateHomework(subjectArray, chaptersArray, exercisesArray, bookTypeArray, fileUrls)

                  Promise.all([validateDate, validateClassDate]) // validateHomeWork,
                        .then(validatedData => {

                              console.log("validatedData");
                              console.log(validatedData);

                              if (validatedData[0] !== 0 && validatedData[1] !== 0) {

                                    verifyTeacher(teacherId, classId, (error, response) => {

                                          if (response && response.statusCode != "0" && response.classData) {

                                                console.log(response);

                                                ConnectedStudentsGroupCount(classId)
                                                      .then(groupsData => {

                                                            //     let classIdArray = classIds.split(',').filter(e => e);

                                                            if (groupsData.groupsCount == 1) {

                                                                  let classRoomArray = [];

                                                                  if (!Array.isArray(response.classData)) {
                                                                        response.classData = [response.classData]
                                                                  }

                                                                  for (let index = 0; index < response.classData.length; index++) {

                                                                        const groupDetails = response.classData[index];

                                                                        const groupName = groupDetails.section ? groupDetails.grade + " - " + groupDetails.section : groupDetails.grade;

                                                                        let classRoomData = {
                                                                              subject: subjectName,
                                                                              eventDate: classDateAndTime,
                                                                              duration: classDuration,
                                                                              chapter: chapterName ? chapterName.split('%-%') : [],
                                                                              topics: topics ? topics.split('%-%') : [],
                                                                        }

                                                                        classRoomArray.push(insertClass(teacherId, response.teacherData.firstName, groupDetails._id, groupName, classRoomData, instructions, fileUrls, scheduledDateAndTime, 1)); //1- updateType-New Record
                                                                  }


                                                                  Promise.all(classRoomArray)
                                                                        .then(done => {

                                                                              console.log(done);

                                                                              res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    message: "Successfull...!"
                                                                              })
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
                                                                  statusCode: "1",
                                                                  message: "Something Went Wrong. Please try Later..!"
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

                                    res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Please choose future dates..!!"
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
                        message: "All fields are mandatory..!!"
                  });
            }

      } catch (error) {
            console.log(error)
            res.status(200).json({
                  statusCode: "0",
                  message: "Something Went Wrong. Please try Later..!"
            })
      }

}




exports.getClass = (req, res, next) => {

      if (req.params.teacherId && req.params.classId && req.params.scheduledClassId) {

            let teacherId = req.params.teacherId;
            let classId = req.params.classId;
            let scheduledClassId = req.params.scheduledClassId;

            verifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        AssignmentModel.findOne({
                              _id: scheduledClassId,
                              groupId: classId,
                              sectionType: "Class",
                              teacherDeleteAllStatus: false,
                              teacherDeleteStatus: false,
                              cancelStatus: false,
                              isActive: true
                        }, {
                              "subject": 1,
                              "groupId": 1,
                              "title": 1,
                              "eventDate": 1,
                              "duration": 1,
                              "chapter": 1,
                              "topics": 1,
                              "fileUrls": 1,
                              "additionalInformation": 1,
                              "scheduledDateAndTime": 1,
                              "sentStatus": 1,
                              "date": 1
                        })
                              .populate('exerciseId')
                              .populate('workSheetIds')
                              .exec()
                              .then(result => {

                                    console.log(result);

                                    if (result) {

                                          let workSheetIData = [];

                                          if (result.workSheetIds.length > 0) {

                                                workSheetIData = result.workSheetIds.map(worksheet => {
                                                      return {
                                                            worksheetId: worksheet._id,
                                                            worksheetName: worksheet.testPaperTitle,
                                                      }
                                                })
                                          }

                                          res.status(200).json({
                                                statusCode: "1",
                                                scheduledClassId: result._id,
                                                subject: result.subject ? result.subject : "",
                                                eventDate: result.eventDate,
                                                duration: result.duration,
                                                chapter: result.chapter ? result.chapter : [],
                                                topics: result.topics ? result.topics : [],
                                                classUrls: result.fileUrls ? result.fileUrls : [],
                                                additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                                                scheduledDateAndTime: result.scheduledDateAndTime ? result.scheduledDateAndTime : "",
                                                message: "Data Found...!"
                                          });


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




exports.updateClass = async (req, res, next) => {

      let fileUrls = new Array();

      if (req.files) {

            let filesArray = req.files;

            filesArray.forEach(file => {
                  let correctPath = file.path.replace(/\\/g, '/');
                  fileUrls.push(correctPath);
            });
      }

      console.log(req.params)
      console.log(req.body)


      if (req.params.teacherId && req.params.teacherId.trim() && req.params.classId && req.params.classId.trim() && req.params.scheduledClassId && req.params.scheduledClassId.trim() && req.body.subjectName && req.body.subjectName.trim() && req.body.classDateAndTime && req.body.classDateAndTime.trim() && req.body.classDuration && req.body.classDuration.trim()) //&& req.body.date //|| fileUrls.length > 0 //&& req.body.chapter && req.body.topics
      {


            let teacherId = req.params.teacherId;
            let classId = req.params.classId;
            let scheduledClassId = req.params.scheduledClassId;
            let subjectName = req.body.subjectName.trim().toLowerCase();

            let classDateAndTime = req.body.classDateAndTime.trim();
            let classDuration = req.body.classDuration.trim();

            let chapterName = req.body.chapter.trim();
            let topics = req.body.topics.trim();

            let instructions = req.body.instructions.trim();
            let scheduledDateAndTime = req.body.scheduleDateAndTime.trim();


            //Adding previous images urls to new image urls
            if (req.body.classUrls && req.body.classUrls.trim() != "") {

                  req.body.classUrls.split("%-%").forEach(url => {
                        if (url && url.trim() != "") {
                              fileUrls.push(url);
                        }
                  });

            }


            //Validate Scheduled Date for previous Date Detection
            let validateDate = scheduledDateAndTime ? ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

            let validateClassDate = ValidateScheduledDateAndTime(classDateAndTime);

            /** Validate Homework and push it into array of list */
            Promise.all([validateDate, validateClassDate])
                  .then(validatedData => {

                        if (validatedData[0] != 0 && validatedData[1] != 0) {

                              /**Verify teacher with groupId and get teacher details and group details*/
                              verifyTeacher(teacherId, classId, (error, response) => {

                                    if (response && response.statusCode != "0") {

                                          /**Check  Assignment Exists*/
                                          Assignment.checkAssignmentExists(scheduledClassId, classId, "Class")
                                                .then(record => {

                                                      console.log(record);

                                                      if (record) {

                                                            /**Can edit before scheduled Time Or Only Sent Date because its homework*/
                                                            let diff = record.sentStatus == true ? new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), record.eventDate) : new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), record.scheduledDateAndTime);

                                                            console.log(diff);

                                                            let daysDiff = Math.floor(diff.minutes())  //record.sentStatus == false ? Math.floor(diff.minutes()) : Math.floor(diff.days());

                                                            console.log(daysDiff);

                                                            if (daysDiff <= 0) {

                                                                  ConnectedStudentsGroupCount(classId)
                                                                        .then(async groupsData => {

                                                                              if (groupsData.groupsCount == 1) {

                                                                                    if (!Array.isArray(response.classData)) {

                                                                                          let groupName = response.classData.section ? response.classData.grade + "-" + response.classData.section : response.classData.grade;

                                                                                          // let currentDayAssignmentDateDiff = Math.floor(new DateDiff(await formatDate(new Date(new Date().setMinutes(new Date().getMinutes() + 330))), await formatDate(new Date(record.date))).days());

                                                                                          // console.log(currentDayAssignmentDateDiff + " - currentDayAssignmentDateDiff");

                                                                                          let updateType = 1;

                                                                                          if (record.sentStatus == true) {

                                                                                                /**
                                                                                                 * Update Type
                                                                                                 * 1 - New Homework
                                                                                                 * 2 - Previous Date (Update Id and Update Stauts)
                                                                                                 * 3 - Current Date greater than 2 hrs (Update Stauts)
                                                                                                 * 4 - Scheduled or Future Date
                                                                                                 * 5 - Current Date Less than 2 hrs (Overwrite)
                                                                                                 */

                                                                                                // let hourDiff = new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), new Date(record.date)).minutes();

                                                                                                // console.log(hourDiff + " - hourDiff");
                                                                                                updateType = 2;

                                                                                                // updateType = currentDayAssignmentDateDiff == 0 && hourDiff > 120 ? 3 : currentDayAssignmentDateDiff > 0 ? 2 : currentDayAssignmentDateDiff == 0 && hourDiff <= 120 ? 5 : 4
                                                                                          }

                                                                                          console.log(updateType + "updateType");


                                                                                          let classRoomData = {
                                                                                                subject: subjectName,
                                                                                                eventDate: classDateAndTime,
                                                                                                duration: classDuration,
                                                                                                chapter: chapterName ? chapterName.split('%-%') : [],
                                                                                                topics: topics ? topics.split('%-%') : [],
                                                                                          }

                                                                                          insertClass(teacherId, response.teacherData.firstName, response.classData._id, groupName, classRoomData, instructions, fileUrls, scheduledDateAndTime, updateType) //, homeWorkId, record.date
                                                                                                .then(ClassSaved => {

                                                                                                      // if (currentDayAssignmentDateDiff <= 0) {

                                                                                                      DeleteAssignment(scheduledClassId)
                                                                                                            .then(done => {
                                                                                                                  console.log(done);
                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: 1,
                                                                                                                        message: "Successfull...!!"
                                                                                                                  });
                                                                                                            })
                                                                                                            .catch(err => {
                                                                                                                  console.log(err);
                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "0",
                                                                                                                        message: "Something went wrong. Please try again..!!"
                                                                                                                  });
                                                                                                            })
                                                                                                      // } else {
                                                                                                      //       res.status(200).json({
                                                                                                      //             statusCode: 1,
                                                                                                      //             message: "Successfull...!!"
                                                                                                      //       });
                                                                                                      // }

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
                                                                        message: "Cannot Edit Ongoing or Completed Class...!!"
                                                                  })
                                                            }

                                                      } else {
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "No Records Found...!!"
                                                            })
                                                      }

                                                }).catch(err => {
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

                              res.status(200).json({
                                    "statusCode": "0",
                                    "message": "Please choose future dates..!!"
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
                  message: "All fields are mandatory..!!"
            });
      }

}




exports.forwardHomeWork = (req, res, next) => {

      if (req.params.teacherId && req.params.classId && req.body.groupIds && req.params.homeWorkId) //&& req.body.date
      {

            let teacherId = req.params.teacherId;
            let classId = req.params.classId;
            let homeWorkId = req.params.homeWorkId; //Old HomeWorkId for check its not out of date
            let groupIds = req.body.groupIds; //New Group Id

            let groupIdArray = groupIds.split(',').filter(el => el);

            console.log(groupIdArray);

            verifyTeacher(teacherId, groupIds, (error, response) => {

                  if (response && response.statusCode != "0") {

                        Assignment.checkAssignmentExists(homeWorkId, classId, "HomeWork")
                              .then(record => {

                                    if (record && record.sentStatus == true) {

                                          ConnectedStudentsGroupCount(groupIds)
                                                .then(groupsData => {

                                                      console.log(groupsData.groupsCount + "==" + groupIdArray.length);

                                                      if (groupsData.groupsCount == groupIdArray.length) {

                                                            if (!Array.isArray(response.classData)) {
                                                                  response.classData = [response.classData];
                                                            }

                                                            let homeWorkArray = new Array();

                                                            for (let index = 0; index < response.classData.length; index++) {
                                                                  const groupDetails = response.classData[index];

                                                                  const groupName = groupDetails.section ? groupDetails.grade + " - " + groupDetails.section : groupDetails.grade;

                                                                  homeWorkArray.push(insertClass(teacherId, response.teacherData.firstName, groupDetails._id, groupName, record.homeWork, record.additionalInformation, record.fileUrls, "", 1));

                                                            }

                                                            Promise.all(homeWorkArray)
                                                                  .then(savedHomeworks => {
                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Successfull...!!"
                                                                        })
                                                                  })
                                                                  .catch(err => {
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
                                                            statusCode: "1",
                                                            message: "Something Went Wrong. Please try Later..!"
                                                      })
                                                })

                                    } else {

                                          let errorMessage = record ? "Access Denied..!!" : "No Records Found...!!";

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: errorMessage
                                          })
                                    }

                              }).catch(err => {
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
            res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}




exports.viewClass = (req, res, next) => {

      if (req.params.teacherId && req.params.classId && req.params.scheduledClassId) {

            let teacherId = req.params.teacherId;
            let classId = req.params.classId;
            let scheduledClassId = req.params.scheduledClassId;

            verifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        AssignmentModel.findOne({
                              _id: scheduledClassId,
                              groupId: classId,
                              sectionType: "Class",
                              teacherDeleteAllStatus: false,
                              teacherDeleteStatus: false,
                              isActive: true
                        }, {

                              "subject": 1,
                              "groupId": 1,
                              "title": 1,
                              "eventDate": 1,
                              "duration": 1,
                              "chapter": 1,
                              "topics": 1,
                              "fileUrls": 1,
                              "additionalInformation": 1,
                              "scheduledDateAndTime": 1,
                              "sentStatus": 1,
                              "cancelStatus": 1,
                              "date": 1
                        })
                              .populate('groupId', 'grade section gradeId groupPic')
                              .exec()
                              .then(async result => {

                                    console.log(result);

                                    if (result) {

                                          let chapterId = "";
                                          let topicId = [];
                                          let subjectId = await SubjectModel.findOne({
                                                searchableSubjectName: result.subject.toLowerCase(),
                                                isActive: true
                                          }, { _id: 1 })
                                                .exec()

                                          if (subjectId) {
                                                chapterId = await ChapterModel.findOne({
                                                      gradeId: result.groupId.gradeId,
                                                      subjectId,
                                                      searchableChapterName: result.chapter[0].toLowerCase(),
                                                      isActive: true
                                                }, { _id: 1, chapterName: 1 })
                                                      .exec()
                                          }

                                          if (subjectId && chapterId && result.topics.length > 0) {
                                                topicId = await TopicsModel.find({
                                                      gradeId: result.groupId.gradeId,
                                                      subjectId,
                                                      chapterId,
                                                      searchableTopicName: result.topics,
                                                      isActive: true
                                                }, {
                                                      _id: 1,
                                                      topicName: 1
                                                })
                                                      .exec()
                                          }

                                          let topicData = []

                                          console.log()

                                          if (topicId.length == 0 && result.topics.length > 0) {
                                                topicData = result.topics.map(topic => {
                                                      return {
                                                            _id: "",
                                                            topicName: topic
                                                      }
                                                })
                                          } else {
                                                topicData = topicId
                                          }

                                          let endDate = new Date(result.eventDate)
                                          endDate.setMinutes(endDate.getMinutes() + parseInt(result.duration));

                                          let completionDayDiff = new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), new Date(endDate))

                                          res.status(200).json({
                                                statusCode: "1",
                                                scheduledClassId: result._id,
                                                sectionType: result.sectionType,
                                                groupId: result.groupId._id,
                                                groupName: result.groupId.grade + " " + result.groupId.section,
                                                groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",
                                                subject: result.subject ? result.subject : "",
                                                startDateAndTime: result.eventDate, //Submission Date
                                                duration: result.duration,
                                                endDateAndTime: endDate,
                                                chapter: chapterId ? [chapterId] : [{ _id: "", chapterName: result.chapter[0] }],
                                                topics: topicData,
                                                additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                                                fileUrls: result.fileUrls ? result.fileUrls : [],

                                                showOptions: completionDayDiff.hours() <= 0 ? 1 : 2, //1-Event Not Completed Show Edit, Delete and Cancel //2-Event Completed Resend Option

                                                cancelStatus: result.cancelStatus,
                                                sentStatus: result.sentStatus,
                                                scheduledDateAndTime: result.scheduledDateAndTime ? result.scheduledDateAndTime : "",
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
