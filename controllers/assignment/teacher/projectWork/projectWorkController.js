const DateDiff = require('date-diff');
const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const StudentModel = require('../../../../models/authentication/userModel');
const ClassStudentConnectionModel = require('../../../../models/classes/classStudentConnectionModel');
const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const ProjectWorkModel = require('../../../../models/assignment/projectWorkModel');
const formatDate = require('../../formatDate');

/** Common files */
const ConnectedStudentsGroupCount = require('../../../group/teacher/connectedStudentsGroupsCount');
const ActiveStudents = require('../../../group/teacher/connectedStudentsList');
const DeleteAssignment = require('../deletePreviousAssignments');
const Assignment = require('../../checkAssingmentExists');
const ValidateScheduledDateAndTime = require('../validateSchduledDateAndTime');
const AssignmentNotification = require('../../../../third-party/notification/teacher/sendAssignmentNotification');
const CreateNewProjectGroup = require('../../../chat/shared/createNewProjectGroup');


const insertProjectWork = (teacherId, teacherName, groupId, groupName, projectTitle, subjectName, submissionDate, groupDataArray, additionalInformation, fileUrls, scheduledDateAndTime, updateType, previousProjectWorkId = null, previousProjectWorkDate = null) => {

       return new Promise(async (resolve, reject) => {

              try {

                     let activeStudentIds = scheduledDateAndTime ? [] : await ActiveStudents(groupId, 1, subjectName)

                     // let sentStatus = scheduledDateAndTime ? false : true

                     // var today = scheduledDateAndTime ? new Date(new Date(scheduledDateAndTime).setMinutes(new Date(scheduledDateAndTime).getMinutes() + 330)) : new Date(new Date().setMinutes(new Date().getMinutes() + 330));

                     // console.log(today);

                     // var today_date = new Date(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).setMinutes(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).getMinutes() + 330));

                     // console.log(today_date);

                     // let upcomingDate = submissionDate ? submissionDate : scheduledDateAndTime ? today : today_date;

                     let noGroupData = 0;

                     if (groupDataArray.length == 0) {
                            noGroupData = 1;
                            for (let index = 0; index < activeStudentIds.length; index++) {
                                   const studentId = activeStudentIds[index];
                                   groupDataArray.push({ _id: new mongoose.Types.ObjectId(), students: [studentId] })
                            }
                     }

                     const projectData = new AssignmentModel({
                            _id: new mongoose.Types.ObjectId(),
                            teacherId,
                            groupId,
                            sectionType: "ProjectWork",
                            subject: subjectName,
                            title: projectTitle,
                            eventDate: submissionDate,
                            groupData: groupDataArray,
                            fileUrls,
                            additionalInformation,
                            activeStudentIds,
                            sentStatus: scheduledDateAndTime ? false : true,
                            scheduledDateAndTime: scheduledDateAndTime ? new Date(new Date(scheduledDateAndTime).setMinutes(new Date(scheduledDateAndTime).getMinutes() + 330)) : "",
                            updatedStatus: (updateType == 2 || updateType == 3) ? true : false,
                     });


                     projectData.save()
                            .then(async savedProject => {

                                   let ProjectGroupArray = [];

                                   if (noGroupData == 0) {

                                          for (let index = 0; index < groupDataArray.length; index++) {
                                                 const groupData = groupDataArray[index];
                                                 ProjectGroupArray.push(CreateNewProjectGroup(groupData.students, groupData.groupTopic, "", teacherId, groupData._id))
                                          }

                                   }

                                   Promise.all(ProjectGroupArray)
                                          .then(allProjectGroupsSaved => {

                                                 let actionType = updateType == 1 ? 1 : 2

                                                 if (updateType != 4) {

                                                        AssignmentNotification(teacherName, groupId, groupName, savedProject._id, "Project Work", actionType)
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
                                                 console.log(err);
                                                 reject(0);
                                          })

                            })
                            .catch(err => {
                                   console.log(err);

                                   if (err.name == 'ValidationError')
                                          resolve(2); // All fields are mandatory
                                   else
                                          reject(0);

                            })

              } catch (error) {
                     reject(0);
              }

       })

}



const validateProjectWork = (groupId, topicsList, studentList, submissionDate, scheduledDateAndTime) => {

       return new Promise((resolve, reject) => {

              let topicArray = [];
              let studentArray = [];

              if (topicsList.trim()) {
                     topicArray = topicsList.split('%-%');
              }

              if (studentList.trim()) {
                     studentArray = studentList.split('%-%');
              }

              console.log(topicArray.length + '&&' + studentArray.length);

              let daysDiff = "";

              if (submissionDate) {

                     let comparisonDate = scheduledDateAndTime ? new Date(scheduledDateAndTime) : new Date();

                     let diff = new DateDiff(comparisonDate, new Date(submissionDate));
                     daysDiff = Math.floor(diff.days());
              }

              if (daysDiff <= 0 || submissionDate == "") {

                     if (topicArray.length == studentArray.length && (topicArray.length != 0 && studentArray.length != 0)) {

                            let groupDataArray = new Array();

                            let checkAllStudents = new Array();

                            if (topicArray.length == studentArray.length) {

                                   let error = 0;

                                   for (let i = 0; i < topicArray.length; i++) {

                                          if (topicArray[i].trim() && studentArray[i].trim()) {

                                                 let groupDataObj = {};

                                                 groupDataObj._id = new mongoose.Types.ObjectId();

                                                 groupDataObj.groupTopic = topicArray[i];

                                                 groupDataObj.students = new Array();

                                                 let studentIds = studentArray[i].split(',');

                                                 studentIds.forEach(studentId => {
                                                        groupDataObj.students.push(studentId);
                                                        checkAllStudents.push(studentId);
                                                 });

                                                 groupDataArray.push(groupDataObj);

                                          } else {

                                                 resolve(2); // all fields are mandatory
                                                 error = 1;
                                                 break;

                                          }

                                   }

                                   if (error == 0) {

                                          StudentModel.find({
                                                 "_id": {
                                                        $in: checkAllStudents
                                                 },
                                                 "isActive": true
                                          })
                                                 .exec()
                                                 .then(studentDetails => {

                                                        ClassStudentConnectionModel.find({
                                                               classId: groupId,
                                                               "studentId": {
                                                                      $in: checkAllStudents
                                                               },
                                                               "isActive": true,
                                                               "connectionStatus": 1
                                                        }, {
                                                               _id: 1,
                                                               connectionStatus: 1
                                                        })
                                                               .exec()
                                                               .then(connections => {

                                                                      console.log(connections)

                                                                      console.log(connections.length + " -- " + studentDetails.length);

                                                                      if (connections.length >= studentDetails.length && connections.length != 0) {

                                                                             resolve(groupDataArray); //Done

                                                                      } else {
                                                                             reject(0)
                                                                      }

                                                               }).catch(err => {
                                                                      console.log(err)
                                                                      reject(0)
                                                               })

                                                 })
                                                 .catch(err => {
                                                        console.log(err);
                                                        reject(0)
                                                 })

                                   }

                            } else {
                                   reject(0)
                            }

                     } else {
                            reject(0)
                     }

              } else {
                     resolve(3) // Please check date of submission to future dates
              }
       })

}



exports.saveProjectWork = async (req, res, next) => {

       let fileUrls = new Array();

       if (req.files) {
              fileUrls = req.files.map(file => {
                     return file.path.replace(/\\/g, '/');
              });
       }

       if (req.body.teacherId && req.body.groupId && req.body.subjectName && req.body.projectTitle && req.body.submissionDate) {

              let teacherId = req.body.teacherId;
              let groupId = req.body.groupId;
              let subjectName = req.body.subjectName;
              let projectTitle = req.body.projectTitle;
              let topicsList = req.body.topicList //Group Topic List
              let studentList = req.body.studentList; //Group Topic Subject List
              let projectSubmissionDate = req.body.submissionDate;
              let additionalInformation = req.body.additionalInformation;
              let scheduledDateAndTime = req.body.dateAndTime;

              let validatedProjectWork = topicsList.trim() && studentList.trim() ? await validateProjectWork(groupId, topicsList, studentList, projectSubmissionDate, scheduledDateAndTime) : await ValidateScheduledDateAndTime(projectSubmissionDate);

              let valdidateScheduleDateAndTime = scheduledDateAndTime ? await ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

              Promise.all([validatedProjectWork, valdidateScheduleDateAndTime]).then(validatedData => {

                     console.log(validatedData)

                     if ((validatedData[0] == 1 || Array.isArray(validatedData[0])) && validatedData[1] == 1) {

                            VerifyTeacher(teacherId, groupId, (error, response) => {

                                   if (response && response.statusCode != "0" && response.classData) {

                                          ConnectedStudentsGroupCount(groupId)
                                                 .then(async groupsData => {

                                                        if (groupsData.groupsCount == 1 && typeof (response.classData) == "object") {

                                                               let projectValidatedData = Array.isArray(validatedData[0]) ? validatedData[0] : [];

                                                               let groupName = response.classData.section ? response.classData.grade + "-" + response.classData.section : response.classData.grade

                                                               insertProjectWork(teacherId, response.teacherData.firstName, groupId, groupName, projectTitle, subjectName, projectSubmissionDate, projectValidatedData, additionalInformation, fileUrls, scheduledDateAndTime, 1) //updateType -1
                                                                      .then(saved => {

                                                                             res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    message: "Successfull..!!"
                                                                             })

                                                                      })
                                                                      .catch(err => {

                                                                             console.log(err)

                                                                             res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something went wrong. Please try later..!! "
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

                                          return res.status(200).json({
                                                 statusCode: "0",
                                                 message: error.message
                                          })
                                   }
                            })

                     } else {

                            let message = (validatedData[0] == 0 || validatedData[0] == 3) ? "Please choose future dates for Submission Date..!!" : validatedData[0] == 2 ? "Please fill all fields correctly..!!" : validatedData[0] == 1 ? "Please choose future dates for Schedule Date and Time..!!" : "Something Went Wrong. Please Try Later..!!";

                            res.status(200).json({
                                   "statusCode": "0",
                                   "message": message
                            })
                     }

              })
                     .catch(err => {

                            console.log(err)

                            res.status(200).json({
                                   statusCode: "0",
                                   message: "Something went wrong. Please try later..!! "
                            })
                     })

       } else {
              res.status(200).json({
                     "statusCode": "0",
                     "message": "All Fields are mandatory...!!"
              })
       }

}



exports.getProjectWork = (req, res, next) => {

       if (req.params.teacherId && req.params.groupId && req.params.projectWorkId) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;
              let projectWorkId = req.params.projectWorkId;

              //check Teacher Exists
              VerifyTeacher(teacherId, groupId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            AssignmentModel.findOne({
                                   _id: projectWorkId,
                                   groupId,
                                   sectionType: "ProjectWork",
                                   teacherDeleteStatus: false,
                                   cancelStatus: false,
                                   isActive: true,
                            }, {
                                   "subject": 1,
                                   "title": 1,
                                   "eventDate": 1,
                                   "groupData": 1,
                                   "fileUrls": 1,
                                   "additionalInformation": 1,
                                   "sentStatus": 1,
                                   "date": 1,
                            })
                                   .populate({
                                          path: 'groupData.students',
                                          select: 'name',
                                   })
                                   .exec()
                                   .then(AssignmentData => {

                                          console.log(AssignmentData);

                                          if (AssignmentData) {

                                                 let groupArray = new Array();

                                                 if (AssignmentData.groupData) {

                                                        AssignmentData.groupData.forEach(group => {
                                                               let groupObj = {}
                                                               let studentArray = new Array();

                                                               groupObj.groupTopic = group.groupTopic;
                                                               group.students.forEach(student => {
                                                                      studentObj = {};

                                                                      studentObj.id = student._id;
                                                                      studentObj.name = student.firstName + " " + student.surName;
                                                                      studentArray.push(studentObj)
                                                               });
                                                               groupObj.studentData = studentArray;
                                                               groupArray.push(groupObj);
                                                        });
                                                 }

                                                 res.status(200).json({
                                                        "statusCode": "1",
                                                        "_id": AssignmentData._id,
                                                        "title": AssignmentData.title ? AssignmentData.title : "",
                                                        "subject": AssignmentData.subject ? AssignmentData.subject : "",
                                                        "eventDate": AssignmentData.eventDate ? AssignmentData.eventDate : "",
                                                        "groupData": groupArray ? groupArray : [],
                                                        "fileUrls": AssignmentData.fileUrls ? AssignmentData.fileUrls : [],
                                                        "additionalInformation": AssignmentData.additionalInformation ? AssignmentData.additionalInformation : "",
                                                        "scheduledDateAndTime": AssignmentData.sentStatus == false ? AssignmentData.date : "",
                                                        "message": "Data Found..!!"
                                                 });
                                          } else {
                                                 res.status(200).json({
                                                        "statusCode": "0",
                                                        "message": "No Records Found..!!"
                                                 });
                                          }

                                   })
                                   .catch(error => {
                                          console.log(error);
                                          res.status(200).json({
                                                 "statusCode": "0",
                                                 "message": "Something went wrong. Please try later..!!"
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
                     "statusCode": "0",
                     "message": "All Fields are mandatory...!!"
              })
       }

}



exports.updateProjectWork = async (req, res, next) => {

       let fileUrls = new Array();

       if (req.files) {

              fileUrls = req.files.map(file => {
                     return file.path.replace(/\\/g, '/');
              });
       }

       if (req.params.teacherId && req.params.groupId && req.params.projectWorkId && req.body.projectTitle && req.body.subjectName && req.body.submissionDate) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;
              let projectWorkId = req.params.projectWorkId;

              let subjectName = req.body.subjectName;
              let projectTitle = req.body.projectTitle;
              let topicsList = req.body.topicsList
              let studentList = req.body.studentList;
              let projectSubmissionDate = req.body.submissionDate;
              let previousUrls = req.body.projectUrls;
              let additionalInformation = req.body.additionalInformation;
              let scheduledDateAndTime = req.body.dateAndTime; //1-Cancel Previous and new entry 2-Retain Previous and send as new entry 

              fileUrls = previousUrls.trim() != "" ? [...fileUrls, ...previousUrls.split('%-%')] : fileUrls;


              let validatedProjectWork = topicsList.trim() && studentList.trim() ? await validateProjectWork(groupId, topicsList, studentList, projectSubmissionDate) : await ValidateScheduledDateAndTime(projectSubmissionDate);

              let valdidateScheduleDateAndTime = scheduledDateAndTime ? await ValidateScheduledDateAndTime(scheduledDateAndTime) : 1;

              Promise.all([validatedProjectWork, valdidateScheduleDateAndTime]).then(validatedData => {

                     if ((validatedData[0] == 1 || Array.isArray(validatedData[0])) && validatedData[1] == 1) {

                            VerifyTeacher(teacherId, groupId, (error, response) => {

                                   if (response && response.statusCode != "0") {

                                          ConnectedStudentsGroupCount(groupId)
                                                 .then(async groupsData => {

                                                        if (groupsData.groupsCount == 1 && typeof (response.classData) == "object") {

                                                               Assignment.checkAssignmentExists(projectWorkId, groupId, "ProjectWork")
                                                                      .then(async projectWorkRecord => {

                                                                             console.log("projectWorkRecord");
                                                                             console.log(projectWorkRecord);

                                                                             if (projectWorkRecord) {

                                                                                    let projectValidatedData = Array.isArray(validatedData[0]) ? validatedData[0] : [];

                                                                                    let groupName = response.classData.section ? response.classData.grade + "-" + response.classData.section : response.classData.grade


                                                                                    let currentDayAssignmentDateDiff = Math.floor(new DateDiff(await formatDate(new Date(new Date().setMinutes(new Date().getMinutes() + 330))), await formatDate(new Date(projectWorkRecord.date))).days());

                                                                                    let updateType = 4;

                                                                                    if (projectWorkRecord.sentStatus == true) {

                                                                                           /**
                                                                                            * Update Type
                                                                                            * 1 - New Homework
                                                                                            * 2 - Previous Date (Update Id and Update Stauts)
                                                                                            * 3 - Current Date (Update Stauts)
                                                                                            * 4 - Scheduled or Future Date
                                                                                            * 5 - Current Date Less than 2 hrs(Overwrite)
                                                                                            */

                                                                                           let hourDiff = new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), new Date(projectWorkRecord.date)).minutes();

                                                                                           console.log(hourDiff + " - hourDiff");

                                                                                           updateType = currentDayAssignmentDateDiff == 0 && hourDiff > 120 ? 3 : currentDayAssignmentDateDiff > 0 ? 2 : currentDayAssignmentDateDiff == 0 && hourDiff <= 120 ? 5 : 4
                                                                                    }


                                                                                    insertProjectWork(teacherId, response.teacherData.firstName, groupId, groupName, projectTitle, subjectName, projectSubmissionDate, projectValidatedData, additionalInformation, fileUrls, scheduledDateAndTime, updateType, projectWorkId, projectWorkRecord.date)
                                                                                           .then(saved => {

                                                                                                  if (saved == 1) {

                                                                                                         if (currentDayAssignmentDateDiff <= 0) {
                                                                                                                //update 1- Delete Previous and send new One i.e Overwrite previous one

                                                                                                                DeleteAssignment(projectWorkId)
                                                                                                                       .then(deleted => {

                                                                                                                              res.status(200).json({
                                                                                                                                     statusCode: "1",
                                                                                                                                     message: "Successfull..!! "
                                                                                                                              })

                                                                                                                       })
                                                                                                                       .catch(err => {
                                                                                                                              console.log(err);
                                                                                                                              res.status(200).json({
                                                                                                                                     statusCode: "0",
                                                                                                                                     message: "Something went wrong. Please try later..!! "
                                                                                                                              })
                                                                                                                       })

                                                                                                         } else {

                                                                                                                res.status(200).json({
                                                                                                                       statusCode: "1",
                                                                                                                       message: "Successfull..!! "
                                                                                                                })

                                                                                                         }

                                                                                                  } else {
                                                                                                         res.status(200).json({
                                                                                                                statusCode: "0",
                                                                                                                message: "please fill all fields correctly..!! "
                                                                                                         })
                                                                                                  }

                                                                                           })
                                                                                           .catch(err => {

                                                                                                  console.log(err)

                                                                                                  res.status(200).json({
                                                                                                         statusCode: "0",
                                                                                                         message: "Something went wrong. Please try later..!! "
                                                                                                  })
                                                                                           })

                                                                             } else {
                                                                                    res.status(200).json({
                                                                                           "statusCode": "0",
                                                                                           "message": "Somerthing Went Wrong. Please try later...!!"
                                                                                    })
                                                                             }
                                                                      })
                                                                      .catch(err => {
                                                                             console.log(err);
                                                                             res.status(200).json({
                                                                                    "statusCode": "0",
                                                                                    "message": "Something Went Wrong. Please try Later..!!"
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

                                          return res.status(200).json({
                                                 statusCode: "0",
                                                 message: error.message
                                          })
                                   }
                            })

                     } else {

                            let message = (validatedData[0] == 0 || validatedData[0] == 3) ? "Please choose future dates for Submission Date..!!" : validatedData[0] == 2 ? "Please fill all fields correctly..!!" : validatedData[0] == 1 ? "Please choose future dates for Schedule Date and Time..!!" : "Something Went Wrong. Please Try Later..!!";

                            res.status(200).json({
                                   "statusCode": "0",
                                   "message": message
                            })
                     }

              })
                     .catch(err => {

                            console.log(err)

                            res.status(200).json({
                                   statusCode: "0",
                                   message: "Something went wrong. Please try later..!! "
                            })
                     })

       } else {
              res.status(200).json({
                     "statusCode": "0",
                     "message": "All Fields are mandatory...!!"
              })
       }

}



exports.getStudentList = (req, res, next) => {


       if (req.params.teacherId && req.params.groupId) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;


              VerifyTeacher(teacherId, groupId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            ActiveStudents(groupId, 2)
                                   .then(groupStudentList => {

                                          res.status(200).json({
                                                 "statusCode": "1",
                                                 "groupStudentList": groupStudentList,
                                                 "message": "Successfull...!!"
                                          })

                                   })
                                   .catch(err => {
                                          console.log(err);
                                          res.status(200).json({
                                                 "statusCode": "0",
                                                 "message": "Something went wrong. Please try later...!!"
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



exports.getSubjectWiseStudentList = (req, res, next) => {


       if (req.params.teacherId && req.params.groupId && req.body.subjectName) {

              let teacherId = req.params.teacherId;
              let groupId = req.params.groupId;
              let subjectName = req.body.subjectName;


              VerifyTeacher(teacherId, groupId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            ActiveStudents(groupId, 2, subjectName)
                                   .then(groupStudentList => {

                                          res.status(200).json({
                                                 "statusCode": "1",
                                                 "groupStudentList": groupStudentList,
                                                 "message": "Successfull...!!"
                                          })

                                   })
                                   .catch(err => {
                                          console.log(err);
                                          res.status(200).json({
                                                 "statusCode": "0",
                                                 "message": "Something went wrong. Please try later...!!"
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



exports.viewProjectWork = (req, res, next) => {

       if (req.params.teacherId && req.params.classId && req.params.projectWorkId) {

              let teacherId = req.params.teacherId;
              let classId = req.params.classId;
              let projectWorkId = req.params.projectWorkId;

              VerifyTeacher(teacherId, classId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            AssignmentModel.findOne({
                                   _id: projectWorkId,
                                   groupId: classId,
                                   sectionType: "ProjectWork",
                                   teacherDeleteAllStatus: false,
                                   teacherDeleteStatus: false,
                                   isActive: true
                            }, {
                                   "groupId": 1,
                                   "subject": 1,
                                   "title": 1,
                                   "eventDate": 1,
                                   "groupData": 1,
                                   "additionalInformation": 1,
                                   "fileUrls": 1,
                                   "activeStudentIds": 1,
                                   "cancelStatus": 1,
                                   "sentStatus": 1,
                                   "scheduledDateAndTime": 1,
                                   "date": 1
                            })
                                   .populate('groupId', 'grade section gradeId groupPic')
                                   .populate('groupData.students', 'firstName surName profilePic')
                                   .exec()
                                   .then(async result => {

                                          console.log(result);

                                          if (result) {

                                                 let groupDataArray = [];
                                                 let completedProjectsCount = 0
                                                 let incompletedProjectsCount = 0

                                                 if (result.groupData.length > 0) {
                                                        groupDataArray = result.groupData.map(group => {

                                                               if (group.projectSubmittedStatus && group.projectSubmittedStatus != '') {
                                                                      if (group.projectSubmittedStatus == 'true') {
                                                                             completedProjectsCount = completedProjectsCount + 1
                                                                      } else if (group.projectSubmittedStatus == 'false') {
                                                                             incompletedProjectsCount = incompletedProjectsCount + 1
                                                                      }
                                                               }

                                                               let studentData = []

                                                               if (group.students.length > 0) {
                                                                      studentData = group.students.map(student => {
                                                                             return {
                                                                                    "_id": student._id,
                                                                                    "firstName": student.firstName,
                                                                                    "surName": student.surName,
                                                                                    "profilePic": student.profilePic ? student.profilePic : ""
                                                                             }
                                                                      })
                                                               }

                                                               return {
                                                                      groupTopic: group.groupTopic ? group.groupTopic : "",
                                                                      projectSubmittedStatus: group.projectSubmittedStatus ? String(group.projectSubmittedStatus) : "",
                                                                      students: studentData
                                                               }
                                                        })
                                                 }

                                                 let completionDayDiff = new DateDiff(new Date(await formatDate(new Date())), new Date(await formatDate(result.eventDate)));

                                                 res.status(200).json({
                                                        statusCode: "1",
                                                        projectId: result._id,
                                                        sectionType: result.sectionType,
                                                        classId: result.groupId._id,
                                                        groupName: result.groupId.grade + " " + result.groupId.section,
                                                        groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",
                                                        subject: result.subject ? result.subject : "",
                                                        title: result.title ? result.title : "",
                                                        eventDate: result.eventDate, //Submission Date

                                                        groupData: groupDataArray,
                                                        additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                                                        fileUrls: result.fileUrls ? result.fileUrls : [],

                                                        totalStudentCount: groupDataArray.length,
                                                        completedStudentsCount: completedProjectsCount,
                                                        inCompletedStudentsCount: incompletedProjectsCount,

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
