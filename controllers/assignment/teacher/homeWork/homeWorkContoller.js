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



// const ValidateHomework = (_subjectData, _chaptersData, _exercisesData, _bookType, fileUrls) => {

//        return new Promise(async (resolve, reject) => {

//               try {

//                      console.log(_subjectData + _chaptersData + _exercisesData + _bookType);

//                      let _subjectArray = (_subjectData.trim() != "") ? _subjectData.split('%-%') : "";

//                      let _chapterArray = (_chaptersData.trim() != "") ? _chaptersData.split('%-%') : "";

//                      let _exierciseArray = (_exercisesData.trim() != "") ? _exercisesData.split('%-%') : "";

//                      let _bookTypeArray = (_bookType.trim() != "") ? _bookType.split('%-%') : "";

//                      let filteredSubjectArray = new Array();

//                      if (_subjectArray.length > 0 || _chapterArray.length > 0 || _exierciseArray.length > 0 || _bookTypeArray.length > 0) {

//                             let totalRecords = Math.max(_subjectArray.length, _chapterArray.length, _exierciseArray.length, _bookTypeArray.length)

//                             for (let index = 0; index < totalRecords; index++) {

//                                    if ((_subjectArray[index] && _subjectArray[index].trim()) || (_bookTypeArray[index] && _bookTypeArray[index].trim()) || (_chapterArray[index] && _chapterArray[index].trim()) || (_exierciseArray[index] && _exierciseArray[index].trim())) {

//                                           let filteredObj = {
//                                                  subject: _subjectArray[index],
//                                                  chapter: _chapterArray[index],
//                                                  exercises: _exierciseArray[index],
//                                                  bookType: _bookTypeArray[index]
//                                           }

//                                           filteredSubjectArray.push(filteredObj);

//                                    }

//                             }

//                      }

//                      if (filteredSubjectArray.length > 0) {

//                             resolve(filteredSubjectArray);

//                      } else if (filteredSubjectArray.length == 0 && fileUrls) {

//                             let filteredObj = {
//                                    subject: "",
//                                    chapter: "",
//                                    exercises: "",
//                                    bookType: ""
//                             }

//                             filteredSubjectArray.push(filteredObj);

//                             resolve(filteredSubjectArray);

//                      } else {
//                             resolve(0);
//                      }

//               } catch (error) {

//                      console.log(error);
//                      reject(0);

//               }

//        });
// }



const insertNewHomework = (teacherId, teacherName, groupId, groupName, homeWorkArray, additionalInformation, fileUrls, scheduledDateAndTime, updateType) => { // previousHomeWorkId = null, previousHomeWorkDate = null //,

       return new Promise(async (resolve, reject) => {

              try {

                     let activeStudentIds = scheduledDateAndTime ? [] : await ActiveStudents(groupId, 1)

                     let sentStatus = scheduledDateAndTime ? false : true;

                     var today = scheduledDateAndTime ? new Date(new Date(scheduledDateAndTime).setMinutes(new Date(scheduledDateAndTime).getMinutes() + 330)) : new Date(new Date().setMinutes(new Date().getMinutes() + 330));

                     console.log(today);

                     // var today_date = new Date(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).setMinutes(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).getMinutes() + 330));

                     // console.log(today_date);

                     const homeWork = new AssignmentModel({
                            _id: new mongoose.Types.ObjectId(),
                            teacherId,
                            groupId,
                            sectionType: "HomeWork",

                            subject: homeWorkArray.subject,
                            title: homeWorkArray.homeWorkTitle,
                            eventDate: homeWorkArray.eventDate,

                            chapter: homeWorkArray.chapter,

                            topics: homeWorkArray.topics,
                            workSheetIds: homeWorkArray.workSheetIds,

                            additionalInformation,
                            fileUrls,
                            activeStudentIds,
                            sentStatus,
                            scheduledDateAndTime: scheduledDateAndTime ? new Date(new Date(scheduledDateAndTime).setMinutes(new Date(scheduledDateAndTime).getMinutes() + 330)) : "",
                            updatedStatus: (updateType == 2 || updateType == 3) ? true : false,
                     })

                     // if (scheduledDateAndTime) {
                     // homeWork.date = today
                     // chapterId: homeWorkArray.chapterId,
                     // topicIds: homeWorkArray.topicIds,
                     // exercises: homeWorkArray.exercises,
                     // exerciseId: homeWorkArray.exerciseId,                            
                     // upcomingDate: scheduledDateAndTime ? today : today_date,
                     // }
                     // if (previousHomeWorkId && updateType == 2) {
                     //        homeWork.updatedAssignmentId = previousHomeWorkId;
                     //        homeWork.updatedAssignmentDate = previousHomeWorkDate;
                     // }

                     if (homeWorkArray.exerciseId) {
                            homeWork.exerciseId = homeWorkArray.exerciseId
                     }

                     if (updateType == 2 || updateType == 3) {
                            homeWork.lastActionTimeStamp = new Date(new Date().setMinutes(new Date().getMinutes() + 330));
                     }

                     homeWork.save()
                            .then(async savedHomeWork => {

                                   /**
                                    * Update Type
                                    * 1 - New Homework
                                    * 2 - Previous Date (Update Id and Update Stauts)
                                    * 3 - Current Date (Update Stauts)
                                    * 4 - Scheduled or Future Date
                                    * 5 - Current Date Less than 2 hrs(Overwrite)
                                    */

                                   // if (updateType == 2) {

                                   //        await AssignmentModel.updateOne({
                                   //               _id: previousHomeWorkId
                                   //        }, {
                                   //               $set: {
                                   //                      updatedAssignmentId: savedHomeWork._id,
                                   //                      updatedAssignmentDate: savedHomeWork.date,
                                   //                      updatedStatus: true,
                                   //                      previousRecord: true
                                   //               }
                                   //        })
                                   //               .exec()
                                   // }

                                   let actionType = updateType == 1 ? 1 : 2

                                   if (updateType != 4) {

                                          AssignmentNotification(teacherName, groupId, groupName, savedHomeWork._id, "Home Work", actionType)
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




exports.insertHomeWork = (req, res, next) => {

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

              if (req.body.teacherId && req.body.teacherId.trim() && req.body.classIds && req.body.classIds.trim() && req.body.subjectName && req.body.subjectName.trim() && req.body.homeWorkTitle && req.body.homeWorkTitle.trim() && req.body.submissionDate && req.body.submissionDate.trim()) //&& req.body.date //|| fileUrls.length > 0 //&& req.body.chapter && req.body.topics
              {

                     let teacherId = req.body.teacherId;
                     let classIds = req.body.classIds;
                     let subjectName = req.body.subjectName.trim().toLowerCase();

                     let homeWorkTitle = req.body.homeWorkTitle.trim();
                     let submissionDate = req.body.submissionDate.trim();

                     let chapterName = req.body.chapter.trim();
                     // let chapterIds = req.body.chapterIds;
                     // let topicIds = req.body.topicIds;
                     // let exercises = req.body.exercises;
                     let topics = req.body.topics.trim();
                     let exerciseId = req.body.exerciseId.trim();

                     let workSheetIds = req.body.workSheetIds.trim();

                     let instructions = req.body.instructions.trim();
                     let scheduledDateAndTime = req.body.dateAndTime.trim();

                     //Validate Scheduled Date for previous Date Detection
                     let validateDate = scheduledDateAndTime ? ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

                     let validateSubmissionDate = ValidateScheduledDateAndTime(submissionDate);

                     // let validateHomeWork = ValidateHomework(subjectArray, chaptersArray, exercisesArray, bookTypeArray, fileUrls)

                     Promise.all([validateDate, validateSubmissionDate]) // validateHomeWork,
                            .then(validatedData => {

                                   console.log("validatedData");
                                   console.log(validatedData);

                                   if (validatedData[0] !== 0 && validatedData[1] !== 0) {

                                          verifyTeacher(teacherId, classIds, (error, response) => {

                                                 if (response && response.statusCode != "0" && response.classData) {

                                                        console.log(response);

                                                        ConnectedStudentsGroupCount(classIds)
                                                               .then(groupsData => {

                                                                      let classIdArray = classIds.split(',').filter(e => e);

                                                                      if (groupsData.groupsCount == classIdArray.length) {

                                                                             let homeWorkArray = [];

                                                                             if (!Array.isArray(response.classData)) {
                                                                                    response.classData = [response.classData]
                                                                             }

                                                                             for (let index = 0; index < response.classData.length; index++) {

                                                                                    const groupDetails = response.classData[index];

                                                                                    const groupName = groupDetails.section ? groupDetails.grade + " - " + groupDetails.section : groupDetails.grade;

                                                                                    let homeworkData = {
                                                                                           subject: subjectName,
                                                                                           homeWorkTitle: homeWorkTitle,
                                                                                           eventDate: submissionDate,
                                                                                           chapter: chapterName ? chapterName.split('%-%') : [],
                                                                                           // chapterId: chapterIds ? chapterIds.split('%-%') : [],
                                                                                           // topicIds: topicIds ? topicIds.split('%-%') : [],
                                                                                           // exercises: exercises ? exercises.split('%-%') : [],
                                                                                           topics: topics ? topics.split('%-%') : [],
                                                                                           exerciseId: exerciseId ? exerciseId : "",
                                                                                           workSheetIds: workSheetIds ? workSheetIds.split('%-%') : []
                                                                                    }

                                                                                    homeWorkArray.push(insertNewHomework(teacherId, response.teacherData.firstName, groupDetails._id, groupName, homeworkData, instructions, fileUrls, scheduledDateAndTime, 1)); //1- updateType-New Record
                                                                             }


                                                                             Promise.all(homeWorkArray)
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

                                          let errorMessage = validatedData[0] != 1 ? "Please choose future dates..!!" : "Please fill all fields correctly..!!";

                                          res.status(200).json({
                                                 "statusCode": "0",
                                                 "message": errorMessage
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




exports.getHomeWork = (req, res, next) => {

       if (req.params.teacherId && req.params.classId && req.params.homeWorkId) {

              let teacherId = req.params.teacherId;
              let classId = req.params.classId;
              let homeWorkId = req.params.homeWorkId;

              verifyTeacher(teacherId, classId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            AssignmentModel.findOne({
                                   _id: homeWorkId,
                                   groupId: classId,
                                   sectionType: "HomeWork",
                                   teacherDeleteStatus: false,
                                   cancelStatus: false,
                                   isActive: true
                            }, {
                                   "subject": 1,
                                   "title": 1,
                                   "eventDate": 1,
                                   "chapter": 1,
                                   "topics": 1,
                                   "exerciseId": 1,
                                   "workSheetIds": 1,
                                   "fileUrls": 1,
                                   "additionalInformation": 1,
                                   "sentStatus": 1,
                                   "scheduledDateAndTime": 1,
                                   "teacherDeleteAllStatus": 1,
                                   "date": 1
                            })
                                   .populate('groupId')
                                   .populate('exerciseId')
                                   .populate('workSheetIds')
                                   .exec()
                                   .then(result => {

                                          console.log(result);

                                          if (result && result.teacherDeleteAllStatus == false) {

                                                 let workSheetIData = [];

                                                 if (result.workSheetIds.length > 0) {

                                                        workSheetIData = result.workSheetIds.map(worksheet => {
                                                               return {
                                                                      testPaperId: worksheet._id,
                                                                      classId: worksheet.classId,
                                                                      subjectName: worksheet.subjectName,
                                                                      chapterName: worksheet.chapterName,
                                                                      testPaperTitle: worksheet.testPaperTitle,
                                                                      instructions: worksheet.instructions,
                                                                      questionCount: worksheet.questionsIdsAdded.length,
                                                                      class: result.groupId.section ? result.groupId.grade + " " + result.groupId.section : result.groupId.grade,
                                                                      date: worksheet.date,
                                                                      isSelected: true
                                                               }
                                                        })
                                                 }

                                                 res.status(200).json({
                                                        statusCode: "1",
                                                        homeWorkId: result._id,
                                                        subject: result.subject ? result.subject : "",
                                                        title: result.title ? result.title : "",
                                                        eventDate: result.eventDate,
                                                        chapter: result.chapter ? result.chapter : [],
                                                        chapterId: result.exerciseId ? result.exerciseId.chapterId : "",
                                                        topics: result.topics ? result.topics : [],
                                                        exerciseId: result.exerciseId ? result.exerciseId._id : "",
                                                        exerciseName: result.exerciseId ? result.exerciseId.exerciseName : "",
                                                        workSheetData: workSheetIData,
                                                        homeWorkUrls: result.fileUrls ? result.fileUrls : [],
                                                        additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                                                        scheduledDateAndTime: result.scheduledDateAndTime ? result.scheduledDateAndTime : "",
                                                        message: "Data Found...!"

                                                        // homeWorkData: result.homeWork,
                                                        // chapterId: result.chapterId ? result.chapterId : [],
                                                        // topicIds: result.topicIds ? result.topicIds : [],
                                                        // exercises: result.exercises ? result.exercises : [],
                                                 });


                                          } else {
                                                 res.status(200).json({
                                                        statusCode: "0",
                                                        message: result && result.teacherDeleteAllStatus == true ? "Record has been Deleted..!!" : "No Record Found..!!"
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




exports.updateHomeWork = async (req, res, next) => {

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

       if (req.params.homeWorkId && req.params.homeWorkId.trim() && req.params.teacherId && req.params.teacherId.trim() && req.params.classId && req.params.classId.trim() && req.body.subjectName && req.body.subjectName.trim() && req.body.homeWorkTitle && req.body.homeWorkTitle.trim() && req.body.submissionDate && req.body.submissionDate.trim()) //&& req.body.date //|| fileUrls.length > 0 //&& req.body.chapter && req.body.topics
       {

              let teacherId = req.params.teacherId.trim();
              let classId = req.params.classId.trim();
              let homeWorkId = req.params.homeWorkId.trim();
              let subjectName = req.body.subjectName.trim();
              let homeWorkTitle = req.body.homeWorkTitle.trim();
              let submissionDate = req.body.submissionDate.trim();

              let chapterName = req.body.chapter.trim();
              let topics = req.body.topics.trim();
              let exerciseId = req.body.exerciseId.trim();

              let workSheetIds = req.body.workSheetIds.trim();

              let instructions = req.body.instructions.trim();
              let scheduledDateAndTime = req.body.dateAndTime.trim();

              //Adding previous images urls to new image urls
              if (req.body.homeWorkUrls && req.body.homeWorkUrls.trim() != "") {

                     req.body.homeWorkUrls.split("%-%").forEach(homeWorkUrl => {
                            if (homeWorkUrl.trim() != "") {
                                   fileUrls.push(homeWorkUrl);
                            }
                     });

              }

              //Validate Scheduled Date for previous Date Detection
              let validateDate = scheduledDateAndTime ? ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

              let validateSubmissionDate = scheduledDateAndTime ? ValidateScheduledDateAndTime(submissionDate) : 1;


              /** Validate Homework and push it into array of list */
              Promise.all([validateDate, validateSubmissionDate])
                     .then(validatedData => {

                            if (validatedData[0] != 0 && validatedData[1] != 0) {

                                   /**Verify teacher with groupId and get teacher details and group details*/
                                   verifyTeacher(teacherId, classId, (error, response) => {

                                          if (response && response.statusCode != "0") {

                                                 /**Check  Assignment Exists*/
                                                 Assignment.checkAssignmentExists(homeWorkId, classId, "HomeWork")
                                                        .then(record => {

                                                               console.log(record);

                                                               if (record) {

                                                                      /**Can edit before scheduled Time Or Only Sent Date because its homework*/
                                                                      let diff = record.sentStatus == true ? new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), record.eventDate) : new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), record.scheduledDateAndTime);

                                                                      // console.log(diff);

                                                                      let daysDiff = record.sentStatus == false ? Math.floor(diff.minutes()) : Math.floor(diff.days());

                                                                      // console.log(daysDiff);

                                                                      if (daysDiff <= 0) {

                                                                             ConnectedStudentsGroupCount(classId)
                                                                                    .then(async groupsData => {

                                                                                           if (groupsData.groupsCount == 1) {

                                                                                                  if (!Array.isArray(response.classData)) {

                                                                                                         let groupName = response.classData.section ? response.classData.grade + "-" + response.classData.section : response.classData.grade;

                                                                                                         let submissionDateDiff = Math.floor(new DateDiff(await formatDate(new Date(new Date().setMinutes(new Date().getMinutes() + 330))), await formatDate(new Date(record.submissionDate))).days());

                                                                                                         console.log(submissionDateDiff + " - submissionDateDiff");

                                                                                                         let updateType = 2;

                                                                                                         let updatedText = "";


                                                                                                         if (record.sentStatus == true) {
                                                                                                                /**Compare Both and form updated text*/



                                                                                                         } else {

                                                                                                         }

                                                                                                         // if (record.sentStatus == true && currentDayAssignmentDateDiff < 0) {

                                                                                                         //        /**
                                                                                                         //         * Update Type
                                                                                                         //         * 1 - New Homework
                                                                                                         //         * 2 - Previous Date (Update Id and Update Stauts)
                                                                                                         //         * 3 - Current Date greater than 2 hrs (Update Stauts)
                                                                                                         //         * 4 - Scheduled or Future Date
                                                                                                         //         * 5 - Current Date Less than 2 hrs (Overwrite)
                                                                                                         //         */

                                                                                                         //        let hourDiff = new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), new Date(record.eventDate)).minutes();

                                                                                                         //        console.log(hourDiff + " - hourDiff");

                                                                                                         //        updateType = currentDayAssignmentDateDiff == 0 && hourDiff > 120 ? 3 : currentDayAssignmentDateDiff > 0 ? 2 : currentDayAssignmentDateDiff == 0 && hourDiff <= 120 ? 5 : 4
                                                                                                         // } else {

                                                                                                         // }

                                                                                                         console.log(updateType + "updateType");

                                                                                                         let homeworkData = {
                                                                                                                subject: subjectName,
                                                                                                                homeWorkTitle: homeWorkTitle,
                                                                                                                eventDate: submissionDate,
                                                                                                                chapter: chapterName ? chapterName.split('%-%') : [],
                                                                                                                topics: topics ? topics.split('%-%') : [],
                                                                                                                exerciseId: exerciseId ? exerciseId : "",
                                                                                                                workSheetIds: workSheetIds ? workSheetIds.split('%-%') : []
                                                                                                         }

                                                                                                         insertNewHomework(teacherId, response.teacherData.firstName, response.classData._id, groupName, homeworkData, instructions, fileUrls, scheduledDateAndTime, updateType)//, homeWorkId, record.date
                                                                                                                .then(homeWorkSaved => {

                                                                                                                       // if (submissionDateDiff <= 0) {

                                                                                                                       DeleteAssignment(homeWorkId)
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
                                                                                                                       //        res.status(200).json({
                                                                                                                       //               statusCode: 1,
                                                                                                                       //               message: "Successfull...!!"
                                                                                                                       //        });
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
                                                                                    message: "Event has been Expired...!!"
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

                                   let errorMessage = validatedData[0] != 1 ? "Please choose future dates..!!" : "Please fill all fields correctly..!!";

                                   res.status(200).json({
                                          "statusCode": "0",
                                          "message": errorMessage
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

                                                                             homeWorkArray.push(insertNewHomework(teacherId, response.teacherData.firstName, groupDetails._id, groupName, record.homeWork, record.additionalInformation, record.fileUrls, "", 1));

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




exports.viewHomeWork = (req, res, next) => {

       if (req.params.teacherId && req.params.classId && req.params.homeWorkId) {

              let teacherId = req.params.teacherId;
              let classId = req.params.classId;
              let homeWorkId = req.params.homeWorkId;

              verifyTeacher(teacherId, classId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            AssignmentModel.findOne({
                                   _id: homeWorkId,
                                   groupId: classId,
                                   sectionType: "HomeWork",
                                   teacherDeleteAllStatus: false,
                                   teacherDeleteStatus: false,
                                   isActive: true
                            }, {
                                   "groupId": 1,
                                   "subject": 1,
                                   "title": 1,
                                   "eventDate": 1,
                                   "chapter": 1,
                                   "topics": 1,
                                   "exerciseId": 1,
                                   "workSheetIds": 1,
                                   "additionalInformation": 1,
                                   "fileUrls": 1,
                                   "completedStudentList": 1,
                                   "notCompletedStudents": 1,
                                   "activeStudentIds": 1,
                                   "cancelStatus": 1,
                                   "sentStatus": 1,
                                   "scheduledDateAndTime": 1,
                                   "date": 1
                            })
                                   .populate('groupId', 'grade section gradeId groupPic')
                                   .populate('exerciseId', 'exerciseName')
                                   .populate('workSheetIds', 'testPaperTitle')
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

                                                 let completionDayDiff = new DateDiff(new Date(await formatDate(new Date())), new Date(await formatDate(result.eventDate)));

                                                 res.status(200).json({
                                                        statusCode: "1",
                                                        homeWorkId: result._id,
                                                        sectionType: result.sectionType,
                                                        groupId: result.groupId._id,
                                                        groupName: result.groupId.grade + " " + result.groupId.section,
                                                        groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",
                                                        subject: result.subject ? result.subject : "",
                                                        title: result.title ? result.title : "",
                                                        eventDate: result.eventDate, //Submission Date
                                                        chapter: chapterId ? [chapterId] : [{ _id: "", chapterName: result.chapter[0] }],
                                                        topics: topicData,
                                                        exerciseId: result.exerciseId ? result.exerciseId._id : "",
                                                        exerciseName: result.exerciseId ? result.exerciseId.exerciseName : "",
                                                        workSheetData: result.workSheetIds,
                                                        additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                                                        fileUrls: result.fileUrls ? result.fileUrls : [],

                                                        totalStudentCount: result.activeStudentIds.length,
                                                        completedStudentsCount: result.completedStudentList ? result.completedStudentList.length : 0,
                                                        inCompletedStudentsCount: result.notCompletedStudents ? result.notCompletedStudents.length : 0,

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
