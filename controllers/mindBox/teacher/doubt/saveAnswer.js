const mongoose = require('mongoose');

const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../../models/mindBox/mindBoxAnswerModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');



module.exports = (req, res, next) => {

      let answerUrls = new Array();

      if (req.file) {
            answerUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      if (req.body.teacherId && req.body.groupId && req.body.questionId && (req.body.answer || answerUrls.length > 0)) {

            let teacherId = req.body.teacherId;
            let classId = req.body.groupId;
            let questionId = req.body.questionId;
            let answer = req.body.answer;

            VerifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0" && response.classData) {

                        //check wheather user has deleted the doubt
                        MindBoxQuestionModel.findOne({
                              _id: questionId,
                              groupId: classId,
                              deletedUsers: {
                                    $ne: teacherId
                              },
                              questionType: 3, //Doubt
                              isActive: true
                        })
                              .populate('userId', 'type')
                              .exec()
                              .then(questionRecord => {

                                    if (questionRecord && String(questionRecord.userId._id) != String(teacherId) && questionRecord.questionDeletedStatus == false && questionRecord.reported == false) {

                                          MindBoxAnswerModel.findOne({
                                                questionId,
                                                answeredUserId: teacherId,
                                                isActive: true
                                          })
                                                .exec()
                                                .then(alreadyAnswered => {


                                                      if (!alreadyAnswered) {

                                                            const doubtBoxAnswer = new MindBoxAnswerModel({
                                                                  _id: new mongoose.Types.ObjectId(),
                                                                  subjectName: questionRecord.subjectName, // For Report Purpose
                                                                  questionId,
                                                                  answeredUserId: teacherId,
                                                                  answer,
                                                                  answerUrls,
                                                                  correctAnswerStatus: true,
                                                            })

                                                            doubtBoxAnswer.save()
                                                                  .then(answerSaved => {

                                                                        MindBoxQuestionModel.updateOne({
                                                                              _id: questionId
                                                                        }, {
                                                                              $set: {
                                                                                    answerCount: questionRecord.answerCount + 1,
                                                                                    correctAnswerCount: questionRecord.correctAnswerCount + 1,
                                                                                    selectedCorrectAnswerId: answerSaved._id,
                                                                                    selectedCorrectAnswerUserId: teacherId
                                                                              }
                                                                        })
                                                                              .exec()
                                                                              .then(questionUpdated => {

                                                                                    if (questionUpdated.nModified == 1) {

                                                                                          let answerDetails = {
                                                                                                _id: answerSaved._id,
                                                                                                userId: response.teacherData._id,
                                                                                                userType: "Teacher",
                                                                                                name: response.teacherData.firstName + " " + response.teacherData.surName,
                                                                                                profilePic: response.teacherData.profilePic ? response.teacherData.profilePic : "",
                                                                                                points: 0,

                                                                                                answer: answerSaved.answer ? answerSaved.answer : "",
                                                                                                answerUrls: answerSaved.answerUrls ? answerSaved.answerUrls : [],

                                                                                                correctAnswerStatus: answerSaved.correctAnswerStatus ? String(answerSaved.correctAnswerStatus) : "false",
                                                                                                answerEditedStatus: "false",

                                                                                                answerDeletedStatus: "false",
                                                                                                answerDeletedByUserId: "",
                                                                                                answerDeletedUserName: "",

                                                                                                answerDeletedMessage: "",
                                                                                                date: answerSaved.date

                                                                                          }

                                                                                          if (String(teacherId) != String(questionRecord.userId._id)) {

                                                                                                // StudentNotification.sendAndSaveMindBoxNotification(studentId, groupId, doubtId, 2) //2-messageType used for choosing notification
                                                                                                //       .then(notificationsSentAndSaved => {

                                                                                                res.status(200).json({
                                                                                                      statusCode: "1",
                                                                                                      answer: answerDetails,
                                                                                                      // String(questionRecord.selectedCorrectAnswer) == String(answer)
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

                                          if (questionRecord.questionDeletedStatus == true) {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Question has been reported ...!!"
                                                })
                                          } else if (questionRecord.questionDeletedStatus == true) {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Question has been deleted...!!"
                                                })
                                          } else if (questionRecord && String(questionRecord.userId._id) == String(teacherId)) {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Cannot answer your own question...!!"
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
                                          message: "Something went wrong. Please Try Later..!!"
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

            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}