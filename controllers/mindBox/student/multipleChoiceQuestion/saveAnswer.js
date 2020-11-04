const mongoose = require('mongoose');

const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../../models/mindBox/mindBoxAnswerModel');
const StudentModel = require('../../../../models/authentication/userModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')



module.exports = (req, res, next) => {

      if (req.body.studentId && req.body.groupId && req.body.questionId && req.body.answer && req.body.answer < 4) {

            let studentId = req.body.studentId;
            let classId = req.body.groupId;
            let questionId = req.body.questionId;
            let answer = req.body.answer;

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
                                                            userId: {
                                                                  $ne: studentId
                                                            },
                                                            questionType: 1,
                                                            isActive: true
                                                      })
                                                      .populate('userId', 'type')
                                                      .exec()
                                                      .then(questionRecord => {

                                                            if (questionRecord) {

                                                                  if (questionRecord.questionDeletedStatus == false && questionRecord.reported == false) {

                                                                        MindBoxAnswerModel.findOne({
                                                                                    questionId,
                                                                                    answeredUserId: studentId,
                                                                                    isActive: true
                                                                              })
                                                                              .exec()
                                                                              .then(alreadyAnswered => {

                                                                                    if (!alreadyAnswered) {

                                                                                          const doubtBoxAnswer = new MindBoxAnswerModel({
                                                                                                _id: new mongoose.Types.ObjectId(),
                                                                                                subjectName: questionRecord.subjectName, // For Report Purpose
                                                                                                questionId,
                                                                                                answeredUserId: studentId,
                                                                                                answer,
                                                                                                correctAnswerStatus: String(questionRecord.selectedCorrectAnswer) == String(answer) ? true : false,
                                                                                          })

                                                                                          doubtBoxAnswer.save()
                                                                                                .then(answerSaved => {

                                                                                                      MindBoxQuestionModel.updateOne({
                                                                                                                  _id: questionId
                                                                                                            }, {
                                                                                                                  $set: {
                                                                                                                        answerCount: questionRecord.answerCount + 1,
                                                                                                                        correctAnswerCount: String(questionRecord.selectedCorrectAnswer) == String(answer) ? questionRecord.correctAnswerCount + 1 : questionRecord.correctAnswerCount
                                                                                                                  }
                                                                                                            })
                                                                                                            .exec()
                                                                                                            .then(async questionUpdated => {

                                                                                                                  if (questionUpdated.nModified == 1) {

                                                                                                                        let answerDetails = {
                                                                                                                              _id: answerSaved._id,
                                                                                                                              userId: studentId,
                                                                                                                              userType: "Student",
                                                                                                                              name: success.studentData.firstName + " " + success.studentData.surName,
                                                                                                                              profilePic: success.studentData.profilePic ? success.studentData.profilePic : "",
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

                                                                                                                        if (String(questionRecord.selectedCorrectAnswer) == String(answer)) {

                                                                                                                              console.log("mindbox points-" + success.studentData.mindBoxCoins);

                                                                                                                              await StudentModel.updateOne({
                                                                                                                                    _id: studentId
                                                                                                                              }, {
                                                                                                                                    $set: {
                                                                                                                                          mindBoxCoins: parseInt(success.studentData.mindBoxCoins) + 10
                                                                                                                                    }
                                                                                                                              })

                                                                                                                        }



                                                                                                                        //Teacher Post is answered then teacher will get a notification regarding Answer
                                                                                                                        if (questionRecord.userId.type == 0) {

                                                                                                                              // TeacherNotification.sendAndSaveMindBoxNotification(result.userId, groupId, doubtId, 2) //2-messageType used for choosing notification
                                                                                                                              //       .then(notificationSentAndSaved => {

                                                                                                                              res.status(200).json({
                                                                                                                                    statusCode: "1",
                                                                                                                                    answer: answerDetails,
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

                                                                                                                        } else if (questionRecord.userId.type == 1 && String(studentId) != String(questionRecord.userId._id)) { //Student Post was answered then

                                                                                                                              // StudentNotification.sendAndSaveMindBoxNotification(studentId, groupId, doubtId, 2) //2-messageType used for choosing notification
                                                                                                                              //       .then(notificationsSentAndSaved => {

                                                                                                                              res.status(200).json({
                                                                                                                                    statusCode: "1",
                                                                                                                                    answer: answerDetails,
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
                                                                                                                                    answer: answerDetails,
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
                                                                                                                        message: "Something went wrong...!!"
                                                                                                                  })
                                                                                                            })

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
                                                                                                message: "Already Answered ...!!"
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
                                                                              statusCode: "20",
                                                                              message: questionRecord.reported == true ? "Question has been Reported" : "Question has been deleted...!!"
                                                                        })

                                                                  }

                                                            } else {
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Access Denied..!!!"
                                                                  })
                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err)
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please Try Later..!!"
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