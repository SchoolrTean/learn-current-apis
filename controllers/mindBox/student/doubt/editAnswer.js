const mongoose = require('mongoose');

const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../../models/mindBox/mindBoxAnswerModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')



module.exports = (req, res, next) => {

      let answerUrls = new Array();

      if (req.file) {
            answerUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      if (req.params.studentId && req.params.groupId && req.params.questionId && req.params.answerId && (req.body.answer || answerUrls.length > 0 || req.body.prevAnswerUrls)) {

            let studentId = req.params.studentId;
            let classId = req.params.groupId;
            let questionId = req.params.questionId;
            let answerId = req.params.answerId;

            let answer = req.params.answer;
            let prevAnswerUrls = req.params.prevAnswerUrls;

            if (prevAnswerUrls) {
                  prevAnswerUrls.split(',').forEach(file => {
                        answerUrls.push(file);
                  });
            }

            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.singleRecord(studentId, classId)
                                    .then(connection => {

                                          if (connection != 0) {

                                                //check wheather user has deleted the doubt
                                                MindBoxQuestionModel.findOne({
                                                            _id: questionId,
                                                            groupId: classId,
                                                            // deletedUsers: {
                                                            //       $ne: studentId
                                                            // },
                                                            questionType: 3,
                                                            reported: false,
                                                            questionDeletedStatus: false,
                                                            isActive: true
                                                      })
                                                      .populate('userId', 'type')
                                                      .exec()
                                                      .then(QuestionRecord => {

                                                            console.log(QuestionRecord);

                                                            if (QuestionRecord && String(QuestionRecord.userId._id) != String(studentId)) {

                                                                  MindBoxAnswerModel.findOne({
                                                                              _id: answerId,
                                                                              questionId,
                                                                              correctAnswerStatus: false,
                                                                              answeredUserId: studentId,
                                                                              isActive: true
                                                                        })
                                                                        .exec()
                                                                        .then(answerFound => {

                                                                              if (answerFound) {

                                                                                    if (answerFound.reported == false && answerFound.answerDeletedStatus == false) {

                                                                                          MindBoxAnswerModel.updateOne({
                                                                                                      _id: answerId
                                                                                                }, {
                                                                                                      $set: {
                                                                                                            answer,
                                                                                                            answerUrls
                                                                                                      }
                                                                                                })
                                                                                                .exec()
                                                                                                .then(questionUpdated => {

                                                                                                      if (questionUpdated.nModified == 1) {

                                                                                                            let answerSavedDetails = {
                                                                                                                  _id: answerSaved._id,
                                                                                                                  userId: studentId,
                                                                                                                  userType: "Student",
                                                                                                                  name: response.studentData.firstName + " " + response.studentData.surName,
                                                                                                                  profilePic: response.studentData.profilePic ? response.studentData.profilePic : "",
                                                                                                                  points: 0,

                                                                                                                  answer: answerSaved.answer ? answerSaved.answer : "",
                                                                                                                  answerUrls: answerSaved.answerUrls ? answerSaved.answerUrls : [],

                                                                                                                  correctAnswerStatus: "false",

                                                                                                                  answerDeletedStatus: "false",
                                                                                                                  answerEditedStatus: "false",
                                                                                                                  answerDeletedByUserId: "",
                                                                                                                  answerDeletedUserName: "",

                                                                                                                  answerDeletedMessage: "",
                                                                                                                  date: answerSaved.date

                                                                                                            }

                                                                                                            if (QuestionRecord.userId.type == true) {

                                                                                                                  // TeacherNotification.sendAndSaveMindBoxNotification(QuestionRecord.userId, groupId, questionId, 2) //2-messageType used for choosing notification
                                                                                                                  //       .then(notificationSentAndSaved => {

                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "1",
                                                                                                                        answer: answerSavedDetails,
                                                                                                                        message: "Successful...!!"
                                                                                                                  })

                                                                                                                  // })
                                                                                                                  // .catch(err => {
                                                                                                                  //       console.log(err);
                                                                                                                  //       res.status(200).json({
                                                                                                                  //             statusCode: "0",
                                                                                                                  //             message: "Something went wrong..!!"
                                                                                                                  //       })
                                                                                                                  // })

                                                                                                            } else if (String(studentId) != String(QuestionRecord.userId._id)) {

                                                                                                                  // StudentNotification.sendAndSaveMindBoxNotification(studentId, groupId, questionId, 2) //2-messageType used for choosing notification
                                                                                                                  //       .then(notificationsSentAndSaved => {

                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "1",
                                                                                                                        answer: answerSavedDetails,
                                                                                                                        message: "Answered Successfully...!!"
                                                                                                                  })

                                                                                                                  // })
                                                                                                                  // .catch(err => {
                                                                                                                  //       console.log(err);
                                                                                                                  //       res.status(200).json({
                                                                                                                  //             statusCode: "0",
                                                                                                                  //             message: "Something went wrong..!!"
                                                                                                                  //       })
                                                                                                                  // })

                                                                                                            } else {

                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "1",
                                                                                                                        answer: answerSavedDetails,
                                                                                                                        message: "Answered Successfully...!!"
                                                                                                                  })
                                                                                                            }

                                                                                                      } else {

                                                                                                            res.status(200).json({
                                                                                                                  statusCode: "0",
                                                                                                                  message: "Something went wrong...!!"
                                                                                                            })

                                                                                                      }

                                                                                                })
                                                                                                .catch(err => {
                                                                                                      console.log(err)
                                                                                                      res.status(200).json({
                                                                                                            statusCode: "0",
                                                                                                            message: "Something went wrong. Please Try Later...!!"
                                                                                                      })
                                                                                                })
                                                                                    } else {
                                                                                          res.status(200).json({
                                                                                                statusCode: "20",
                                                                                                message: answerFound.reported == true ? "Answer Reported..!!" : "Answer Deleted..!!"
                                                                                          })
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

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something went wrong. Please Try Later...!!"
                                                                              })
                                                                        })

                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Access Denied..!!"
                                                                  })

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err)
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong...!!"
                                                            })
                                                      })

                                          } else {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Access Denied..!!!"
                                                })
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied..!!"
                                          })
                                    })

                        } else {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: success.message
                              })

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please Try Later..!!"
                        })
                  })
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}