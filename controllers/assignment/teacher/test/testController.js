const DateDiff = require('date-diff');
const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const AssignmentModel = require('../../../../models/assignment/assignmentModel');
// const TestModel = require('../../../../models/assignment/testModel');


/** Common files */
const ConnectedStudentsGroupCount = require('../../../group/teacher/connectedStudentsGroupsCount')
const ActiveStudents = require('../../../group/teacher/connectedStudentsList')
const DeleteAssignment = require('../deletePreviousAssignments')
const AssignmentNotification = require('../../../../third-party/notification/teacher/sendAssignmentNotification');
const Assignment = require('../../checkAssingmentExists')
const formatDate = require('../../formatDate')
// const ValidateScheduledDateAndTime = require('../validateSchduledDateAndTime')


const ValidateTest = (subjectsArray, chaptersArray, datesArray, durationArray, scheduleDateAndTime, updateType = null) => {

   return new Promise(async (resolve, reject) => {

      try {

         let error = 0;

         const testListArray = new Array();

         for (let index = 0; index < datesArray.length; index++) {

            if (error == 0) {

               let formattedTodayDate = await formatDate(new Date(new Date().setMinutes(new Date().getMinutes() + 330)));
               let testDateDiff = Math.floor(new DateDiff(formattedTodayDate, new Date(datesArray[index])).days());


               let ScheduledDateDiff = -1; // set Schedule Date Diff to greater than today date.

               if (scheduleDateAndTime) {

                  let formattedScheduledDate = await formatDate(new Date(new Date(scheduleDateAndTime).setMinutes(new Date(scheduleDateAndTime).getMinutes() + 330)));

                  let formattedDateDiff = new DateDiff(formattedTodayDate, formattedScheduledDate);
                  ScheduledDateDiff = Math.floor(formattedDateDiff.days());
               }

               console.log(testDateDiff + "testDateDiff");
               console.log(ScheduledDateDiff + "ScheduledDateDiff");


               if (!updateType) {

                  if ((testDateDiff >= 0 || ScheduledDateDiff > 0) && error == 0) { // error should be shown when it satisfy error condition
                     error = 1;
                     resolve(0);
                     break;
                  }

               } else {

                  if (ScheduledDateDiff > 0 && error == 0) { // error should be shown when it satisfy error condition
                     error = 1;
                     resolve(0);
                     break;
                  }

               }


               testListArray.push({

                  subject: subjectsArray[index],
                  chapter: chaptersArray[index] ? chaptersArray[index] : "",
                  eventDate: new Date(datesArray[index]).setMinutes(new Date(datesArray[index]).getMinutes() + 330), // testDate
                  duration: durationArray[index]
               })

            }

         }

         if (error == 0) {
            resolve(testListArray);
         }

      } catch (error) {
         console.log(error)
         reject(0)
      }

   })

}



const insertTest = (teacherId, teacherName, groupId, groupName, TestDataArray, testTitle, fileUrls, additionalInformation, scheduledDateAndTime, updateType, previousTestId = null, previousTestDate = null) => {

   return new Promise(async (resolve, reject) => {

      let activeStudentIds = scheduledDateAndTime ? [] : await ActiveStudents(groupId, 1)

      let sentStatus = scheduledDateAndTime ? false : true

      var today = scheduledDateAndTime ? new Date(new Date(scheduledDateAndTime).setMinutes(new Date(scheduledDateAndTime).getMinutes() + 330)) : new Date(new Date().setMinutes(new Date().getMinutes() + 330));

      console.log(today);

      // var today_date = new Date(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).setMinutes(new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()).getMinutes() + 330));

      // console.log(today_date);

      let PromiseData = []

      for (let index = 0; index < TestDataArray.length; index++) {
         const TestDataSingle = TestDataArray[index];

         const testData = new AssignmentModel({
            _id: new mongoose.Types.ObjectId(),
            teacherId,
            groupId,
            sectionType: "Test",
            title: testTitle,
            subject: TestDataSingle.subject,
            chapter: TestDataSingle.chapter,
            eventDate: TestDataSingle.eventDate,
            duration: TestDataSingle.duration,
            fileUrls,
            additionalInformation,
            activeStudentIds,
            sentStatus,
            updatedStatus: (updateType == 2 || updateType == 3) ? true : false,
            // upcomingDate: upcomingDate,
         });



         if (scheduledDateAndTime) {
            testData.date = today
         }

         if (previousTestId && updateType == 2) {
            testData.updatedAssignmentId = previousTestId;
            testData.updatedAssignmentDate = previousTestDate;
         }

         console.log(testData);

         PromiseData.push(testData.save())
      }


      Promise.all(PromiseData)
         .then(async testSaved => {

            if (updateType == 2) {

               await AssignmentModel.updateOne({
                  _id: previousTestId
               }, {
                  $set: {
                     updatedAssignmentId: testSaved._id,
                     updatedAssignmentDate: testSaved.date,
                     updatedStatus: true,
                     previousRecord: true
                  }
               })
                  .exec()
            }


            let actionType = updateType == 1 ? 1 : 2

            if (updateType != 4) {

               console.log('coming')

               // AssignmentNotification(teacherName, groupId, groupName, testSaved._id, "Test", actionType)
               //    .then(success => {
               resolve(1);
               // })
               // .catch(err => {
               //    console.log(err);
               //    reject(0);
               // })

            } else {
               resolve(1);
            }

         })
         .catch(err => {
            console.log(err);
            reject(err);
         })


   })
}



exports.saveTest = (req, res, next) => {

   let fileUrls = new Array();

   if (req.files) {
      let filesArray = req.files;

      filesArray.forEach(file => {
         let correctPath = file.path.replace(/\\/g, '/');
         fileUrls.push(correctPath);
      });
   }

   if (req.body.teacherId && req.body.groupIds && req.body.testTitle && req.body.subjects && req.body.testDates && req.body.duration) {

      let teacherId = req.body.teacherId;
      let groupIds = req.body.groupIds;
      let testTitle = req.body.testTitle;
      let subjects = req.body.subjects;
      let chapters = req.body.chapters;
      let testDates = req.body.testDates;
      let additionalInformation = req.body.additionalInformation;
      let scheduleDateAndTime = req.body.dataAndTime;
      let duration = req.body.duration;

      let subjectArray = subjects.toLowerCase().split('%-%');
      let chaptersArray = chapters.split('%-%');
      let testDatesArray = testDates.split('%-%');
      let durationArray = duration.split('%-%');


      ValidateTest(subjectArray, chaptersArray, testDatesArray, durationArray, scheduleDateAndTime)
         .then(validatedData => {

            if (validatedData != 0 && validatedData.length > 0) {

               if (Array.isArray(validatedData)) {

                  VerifyTeacher(teacherId, groupIds, (error, response) => {

                     if (response && response.statusCode != "0") {

                        ConnectedStudentsGroupCount(groupIds)
                           .then(groupsData => {

                              let groupIdArray = groupIds.split(',')

                              if (groupsData.groupsCount == groupIdArray.length) {

                                 if (subjectArray.length == testDatesArray.length) {

                                    validatedData.sort(function (a, b) {
                                       return new Date(a.eventDate) - new Date(b.eventDate);
                                    });

                                    // let upcomingDate = validatedData[validatedData.length - 1].testDate;

                                    let index = 0;

                                    let savedGroupTest = [];

                                    if (!Array.isArray(response.classData)) {
                                       response.classData = [response.classData];
                                    }

                                    while (response.classData.length > index) {

                                       const groupJsonObj = response.classData[index];

                                       let groupName = groupJsonObj.section ? groupJsonObj.grade + "-" + groupJsonObj.section : groupJsonObj.grade;

                                       savedGroupTest.push(insertTest(teacherId, response.teacherData.firstName, groupJsonObj._id, groupName, validatedData, testTitle, fileUrls, additionalInformation, scheduleDateAndTime, 1)) // 1- updateType upcomingDate,

                                       index++;

                                    }

                                    Promise.all(savedGroupTest)
                                       .then(success => {

                                          if (success.length > 0) {

                                             res.status(200).json({
                                                "statusCode": "1",
                                                "message": "Successfull..!!"
                                             })

                                          } else {

                                             res.status(200).json({
                                                "statusCode": "0",
                                                "message": "Something Went Wrong. Please try Later..!!"
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
                                       "statusCode": "0",
                                       "message": "Please fill all fields correctly..!!"
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
                                 statusCode: "1",
                                 message: "Something Went Wrong. Please try Later..!"
                              })

                           })

                     } else {

                        return res.status(200).json({
                           statusCode: "0",
                           message: error.message
                        })

                     }

                  });

               } else {

                  res.status(200).json({
                     "statusCode": "0",
                     "message": "Something Went Wrong. Please try Later..!!"
                  })

               }

            } else {

               res.status(200).json({
                  "statusCode": "0",
                  "message": "Please check future dates..!!"
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
         "statusCode": "0",
         "message": "All Fields are mandatory...!!"
      })
   }

}



exports.getTest = (req, res, next) => {

   if (req.params.teacherId && req.params.groupId && req.params.testId) {

      let teacherId = req.params.teacherId;
      let groupId = req.params.groupId;
      let testId = req.params.testId;


      //check Student Exists
      VerifyTeacher(teacherId, groupId, (error, response) => {

         if (response && response.statusCode != "0") {

            AssignmentModel.findOne({
               _id: testId,
               groupId,
               sectionType: "Test",
               cancelStatus: false,
               teacherDeleteStatus: false,
               isActive: true,
            }, {
               title: 1,
               subject: 1,
               chapter: 1,
               eventDate: 1,
               duration: 1,
               fileUrls: 1,
               additionalInformation: 1,
               sentStatus: 1,
               date: 1
            })
               .exec()
               .then(TestRecord => {

                  if (TestRecord) {

                     res.status(200).json({
                        "statusCode": "1",
                        "title": TestRecord.title,
                        "subject": TestRecord.subject,
                        "chapter": TestRecord.chapter,
                        "eventDate": TestRecord.eventDate,
                        "duration": TestRecord.duration,
                        "fileUrls": TestRecord.fileUrls,
                        "additionalInformation": TestRecord.additionalInformation,
                        "scheduleDateAndTime": TestRecord.sentStatus == false ? TestRecord.date : "",
                        "message": "Data Found..!!"
                     });

                  } else {
                     res.status(200).json({
                        "statusCode": "0",
                        "message": "No Records Found...!!"
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



exports.updateTest = (req, res, next) => {

   let fileUrls = new Array();

   if (req.files) {
      let filesArray = req.files;

      filesArray.forEach(file => {
         let correctPath = file.path.replace(/\\/g, '/');
         fileUrls.push(correctPath);
      });
   }

   if (req.params.teacherId && req.params.groupId && req.params.testId && req.body.testTitle && req.body.subject && req.body.testDate && req.body.duration) {

      let teacherId = req.params.teacherId;
      let groupId = req.params.groupId;
      let testId = req.params.testId;

      let testTitle = req.body.testTitle;
      let subject = req.body.subject;
      let chapter = req.body.chapter;
      let testDate = req.body.testDate;
      let duration = req.body.duration;
      let additionalInformation = req.body.additionalInformation;
      let testUrls = req.body.testUrls;
      let scheduledDateAndTime = req.body.dataAndTime;

      if (testUrls.trim() != "") {

         testUrls.split('%-%').forEach(testUrl => {
            if (testUrl.trim()) {
               fileUrls.push(testUrl);
            }
         });

      }


      VerifyTeacher(teacherId, groupId, (error, response) => {

         if (response && response.statusCode != "0") {

            Assignment.checkAssignmentExists(testId, groupId, "Test")
               .then(record => {

                  console.log("record");
                  console.log(record);

                  if (record) {

                     ConnectedStudentsGroupCount(groupId)
                        .then(async groupsData => {

                           if (groupsData.groupsCount == 1) {

                              let groupName = response.classData.section ? response.classData.grade + " - " + response.classData.section : response.classData.grade

                              let testDateDiff = Math.floor(new DateDiff(formattedTodayDate, new Date(testDate)).days());

                              let ScheduledDateDiff = -1; // set Schedule Date Diff to greater than today date.

                              if (scheduleDateAndTime) {

                                 let formattedScheduledDate = await formatDate(new Date(new Date(scheduleDateAndTime).setMinutes(new Date(scheduleDateAndTime).getMinutes() + 330)));

                                 let formattedDateDiff = new DateDiff(formattedTodayDate, formattedScheduledDate);
                                 ScheduledDateDiff = Math.floor(formattedDateDiff.days());
                              }

                              if (testDateDiff < 0 && ScheduledDateDiff < 0) {

                                 let formattedTodayDate = await formatDate(new Date(new Date().setMinutes(new Date().getMinutes() + 330)));
                                 let PrevTestDateDiff = Math.floor(new DateDiff(formattedTodayDate, new Date(record.eventDate)).days());

                                 let PrevScheduledDateDiff = -1; // set Schedule Date Diff to greater than today date.

                                 if (record.sentStatus == false) {

                                    let formattedScheduledDate = await formatDate(new Date(new Date(record.scheduleDateAndTime).setMinutes(new Date(record.scheduleDateAndTime).getMinutes() + 330)));

                                    let formattedDateDiff = new DateDiff(formattedTodayDate, formattedScheduledDate);
                                    PrevScheduledDateDiff = Math.floor(formattedDateDiff.days());
                                 }

                                 console.log(PrevTestDateDiff + "PrevTestDateDiff");
                                 console.log(PrevScheduledDateDiff + "PrevScheduledDateDiff");

                                 let updateData = "";
                                 let updatedStatus = false

                                 if (PrevTestDateDiff < 0 && PrevScheduledDateDiff < 0) {

                                    let checkTestRescheduled = Math.floor(new DateDiff(new Date(testDate), new Date(record.eventDate)).minutes());

                                    if (checkTestRescheduled != 0) {
                                       updateData = "Resheduled from " + record.eventDate
                                    }

                                    if (subject != record.subject) {
                                       updateData = updateData != "" ? "& Subject Updated from " + record.subject : "Subject Updated from " + record.subject
                                    }

                                    if (record.chapter && chapter != record.chapter) {
                                       updateData = updateData != "" ? "& Chapter Updated from " + record.chapter : "Chapter Updated from " + record.chapter
                                    }

                                    if (duration != record.duration) {
                                       updateData = updateData != "" ? "& Duratoin Updated from " + record.duration : "Duratoin Updated from " + record.duration
                                    }

                                    if (record.additionalInformation && additionalInformation != record.additionalInformation) {
                                       updateData = updateData != "" ? "& Instructions has Updated " : "Instructions has Updated"
                                    }
                                    updatedStatus = true
                                 }


                                 const testData = new AssignmentModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    teacherId,
                                    groupId,
                                    sectionType: "Test",
                                    title: testTitle,
                                    subject: TestDataSingle.subject,
                                    chapter: TestDataSingle.chapter,
                                    eventDate: TestDataSingle.eventDate,
                                    duration: TestDataSingle.duration,
                                    fileUrls,
                                    additionalInformation,
                                    activeStudentIds,
                                    sentStatus,
                                    updatedStatus,
                                    updatedText: updateData,
                                    scheduledDateAndTime,
                                    sentStatus: scheduledDateAndTime ? false : true
                                    // upcomingDate: upcomingDate,
                                 });


                                 testData.save()
                                    .then(testSaved => {

                                       //Check Date Diff b/w sent date and today to distingush wheather we should overwrite it or send as new record
                                       // if (currentDayAssignmentDateDiff <= 0) {
                                       //Overwrite Operatoin because its previous or future date

                                       DeleteAssignment(testId)
                                          .then(deletedPreviousAssignment => {

                                             AssignmentNotification(teacherName, groupId, groupName, testSaved._id, "Test", updatedStatus)
                                                .then(success => {

                                                   res.status(200).json({
                                                      "statusCode": 1,
                                                      "message": "Successfull...!!"
                                                   })

                                                })
                                                .catch(err => {
                                                   console.log(err);

                                                   res.status(200).json({
                                                      "statusCode": 0,
                                                      "message": "Something went wrong. Please try later..!!"
                                                   })

                                                })

                                          })
                                          .catch(err => {
                                             console.log(err);

                                             res.status(200).json({
                                                "statusCode": 0,
                                                "message": "Something went wrong. Please try later..!!"
                                             })

                                          })

                                       // } else {

                                       //    //Send as new because it is previous date record
                                       //    res.status(200).json({
                                       //       "statusCode": 1,
                                       //       "message": "Successfull...!!"
                                       //    })

                                       // }

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
                                    "statusCode": "0",
                                    "message": "Please Choose Future Dates..!!"
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
                              statusCode: "1",
                              message: "Something Went Wrong. Please try Later..!!"
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
            return res.status(200).json({
               statusCode: "0",
               message: error.message
            })
         }

      });

   } else {
      res.status(200).json({
         "statusCode": "0",
         "message": "All Fields are mandatory...!!"
      })
   }

}



exports.forwardTest = (req, res, next) => {

   if (req.params.teacherId && req.params.groupId && req.body.groupIds && req.params.testId) {

      let teacherId = req.params.teacherId;
      let groupId = req.params.groupId;
      let testId = req.params.testId;
      let groupIds = req.body.groupIds;

      VerifyTeacher(teacherId, groupIds, (error, response) => {

         if (response && response.statusCode != "0") {

            Assignment.checkAssignmentExists(testId, groupId, "Test")
               .then(async record => {

                  if (record && record.sentStatus == true) {

                     ConnectedStudentsGroupCount(groupIds)
                        .then(async groupsData => {

                           let groupArray = groupIds.split(',').filter(e => e);

                           if (groupsData.groupsCount == groupArray.length) {

                              let index = 0;

                              if (!Array.isArray(response.classData)) {
                                 response.classData = [response.classData];
                              }

                              let PromiseArray = new Array();

                              while (index < response.classData.length) {


                                 let groupDetails = response.classData[index];

                                 let groupName = groupDetails.section ? groupDetails.grade + " - " + groupDetails.section : groupDetails.grade;

                                 PromiseArray.push(insertTest(teacherId, response.teacherData.firstName, groupDetails._id, groupName, record.test.testSchedule, record.test.testTitle, record.fileUrls, record.additionalInformation, "", 1))


                                 // const testData = new TestModel({
                                 //    _id: new mongoose.Types.ObjectId(),
                                 //    groupId,
                                 //    sectionType: "Test",
                                 //    test: {
                                 //       testTitle: record.testTitle,
                                 //       subject: record.subject,
                                 //       chapter: record.chapter,
                                 //       eventDate: record.eventDate,
                                 //    },
                                 //    fileUrls: record.fileUrls,
                                 //    additionalInformation: record.fileUrls,
                                 //    activeStudentIds,
                                 //    upcomingDate: record.upcomingDate,
                                 //    sentStatus: record.sentStatus
                                 // });

                                 // await testData.save()
                                 //    .then(async testSaved => {

                                 //       console.log(groupDetails);

                                 //       let groupName = groupDetails.section ? groupDetails.grade + " - " + groupDetails.section : groupDetails.grade;
                                 //       let updateType = 2;

                                 //       NewActivityDot(teacherId, response.teacherData.name, groupDetails._id, groupName, testSaved._id, updateType, "Test")
                                 //          .then(success => {

                                 //          })
                                 //          .catch(err => {
                                 //             console.log(err);
                                 //             error = 1;
                                 //          })

                                 //    })
                                 //    .catch(err => {
                                 //       console.log(err);
                                 //       error = 1;
                                 //    })


                                 index++;
                              }

                              Promise.all(PromiseArray)
                                 .then(success => {

                                    res.status(200).json({
                                       statusCode: "1",
                                       message: "Test has been forwarded successfully...!!"
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
                              statusCode: "0",
                              message: "Something Went Wrong. Please try Later..!"
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
            return res.status(200).json({
               statusCode: "0",
               message: error.message
            })
         }
      });

   } else {
      res.status(200).json({
         "statusCode": "0",
         "message": "All Fields are mandatory...!!"
      })
   }

}



exports.viewTest = (req, res, next) => {

   if (req.params.teacherId && req.params.classId && req.params.testId) {

      let teacherId = req.params.teacherId;
      let classId = req.params.classId;
      let testId = req.params.testId;

      VerifyTeacher(teacherId, classId, (error, response) => {

         if (response && response.statusCode != "0") {

            AssignmentModel.findOne({
               _id: testId,
               groupId: classId,
               sectionType: "Test",
               teacherDeleteAllStatus: false,
               teacherDeleteStatus: false,
               isActive: true
            }, {
               "sectionType": 1,
               "groupId": 1,
               "subject": 1,
               "title": 1,
               "eventDate": 1,
               "duration": 1,
               "endDateAndTime": 1,
               "additionalInformation": 1,
               "fileUrls": 1,
               "cancelStatus": 1,
               "sentStatus": 1,
               "savedDateAndTime": 1,
               "date": 1
            })
               .populate('groupId', 'grade section gradeId groupPic')
               .exec()
               .then(async result => {

                  console.log(result);

                  if (result) {

                     let endDate = new Date(result.eventDate)
                     endDate.setMinutes(endDate.getMinutes() + parseInt(result.duration));

                     console.log("endDate")
                     console.log(endDate)

                     let completionDayDiff = new DateDiff(new Date(new Date().setMinutes(new Date().getMinutes() + 330)), new Date(endDate));

                     res.status(200).json({
                        statusCode: "1",
                        testId: result._id,
                        sectionType: result.sectionType,
                        groupName: result.groupId.grade + " " + result.groupId.section,
                        groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",
                        subject: result.subject ? result.subject : "",
                        title: result.title ? result.title : "",
                        startDateAndTime: result.eventDate, //Submission Date

                        duration: result.duration ? result.duration : "",
                        endDateAndTime: endDate,

                        additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                        fileUrls: result.fileUrls ? result.fileUrls : [],
                        
                        showOptions: completionDayDiff.hours() <= 0 ? 1 : 2, //1-Event Not Completed Show Edit, Delete and Cancel //2-Event Completed Resend Option

                        cancelStatus: result.cancelStatus,
                        sentStatus: result.sentStatus,
                        scheduledDateAndTime: result.sentStatus == false ? result.savedDateAndTime : "",
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
