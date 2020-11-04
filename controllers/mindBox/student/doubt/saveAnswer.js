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

      if (req.body.studentId && req.body.groupId && req.body.questionId && (req.body.answer || answerUrls.length > 0)) {

            let studentId = req.body.studentId;
            let classId = req.body.groupId;
            let answer = req.body.answer;
            let questionId = req.body.questionId;

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
                                                            deletedUsers: {
                                                                  $ne: studentId
                                                            },
                                                            questionType: 3,
                                                            questionDeletedStatus: false,
                                                            isActive: true
                                                      })
                                                      .populate('userId', 'type')
                                                      .exec()
                                                      .then(doubtData => {

                                                            console.log(doubtData);

                                                            if (doubtData && String(doubtData.userId._id) != String(studentId)) {

                                                                  MindBoxAnswerModel.findOne({
                                                                              questionId,
                                                                              answeredUserId: studentId,
                                                                              isActive: true
                                                                        })
                                                                        .exec()
                                                                        .then(answerFound => {

                                                                              if (!answerFound) {

                                                                                    const doubtBoxAnswer = new MindBoxAnswerModel({
                                                                                          _id: new mongoose.Types.ObjectId(),
                                                                                          subjectName: doubtData.subjectName, // For Report Purpose
                                                                                          questionId,
                                                                                          answeredUserId: studentId,
                                                                                          answer,
                                                                                          answerUrls,
                                                                                    })

                                                                                    doubtBoxAnswer.save()
                                                                                          .then(answerSaved => {

                                                                                                MindBoxQuestionModel.updateOne({
                                                                                                            _id: questionId
                                                                                                      }, {
                                                                                                            $set: {
                                                                                                                  answerCount: doubtData.answerCount + 1
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

                                                                                                                        correctAnswerStatus: answerSaved.correctAnswerStatus ? String(answerSaved.correctAnswerStatus) : "false",

                                                                                                                        answerDeletedStatus: "false",
                                                                                                                        answerEditedStatus: "false",
                                                                                                                        answerDeletedByUserId: "",
                                                                                                                        answerDeletedUserName: "",

                                                                                                                        answerDeletedMessage: "",
                                                                                                                        date: answerSaved.date

                                                                                                                  }

                                                                                                                  if (doubtData.userId.type == true) {

                                                                                                                        // TeacherNotification.sendAndSaveMindBoxNotification(doubtData.userId, groupId, questionId, 2) //2-messageType used for choosing notification
                                                                                                                        //       .then(notificationSentAndSaved => {

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

                                                                                                                  } else if (String(studentId) != String(doubtData.userId._id)) {

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
                                                                                          statusCode: "0",
                                                                                          message: "Already Answered...!!"
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

                                                                  if (doubtData && String(doubtData.userId._id) == String(studentId)) {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Cannot answer your own posted doubt..!!"
                                                                        })

                                                                  } else {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Access Denied..!!"
                                                                        })

                                                                  }

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