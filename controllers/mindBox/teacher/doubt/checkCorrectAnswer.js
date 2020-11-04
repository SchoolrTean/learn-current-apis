const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../../models/mindBox/mindBoxAnswerModel');
const StudentModel = require('../../../../models/user/authentication/userModel')
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');


module.exports = (req, res, next) => {

      if (req.params.teacherId && req.params.questionId && req.params.groupId && req.params.answerId) {

            let teacherId = req.params.teacherId;
            let questionId = req.params.questionId;
            let classId = req.params.groupId;
            let answerId = req.params.answerId;


            VerifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0" && response.classData) {

                        /**
                         * Check wheather doubt has been deleted by student
                         */
                        MindBoxQuestionModel.findOne({
                              _id: questionId,
                              deletedUsers: {
                                    $ne: teacherId
                              },
                              isActive: true
                        }, {
                              _id: 1,
                              questionDeletedStatus: 1,
                              questionDeletedByUserId: 1,
                              reported: 1,
                              answerCount: 1
                        })
                              .populate('questionDeletedByUserId', 'firstName surName')
                              .exec()
                              .then(questionRecord => {

                                    if (questionRecord) {

                                          if (questionRecord.questionDeletedStatus == false && questionRecord.reported == false) {

                                                MindBoxAnswerModel.findOne({
                                                      _id: answerId,
                                                      questionId,
                                                      deletedUsers: {
                                                            $ne: teacherId
                                                      },
                                                      answeredUserId: {
                                                            $ne: teacherId
                                                      },
                                                      isActive: true
                                                }).exec()
                                                      .then(answerRecord => {

                                                            console.log(answerRecord);

                                                            if (answerRecord) {

                                                                  //When answer was not deleted and not crowned or coined then you can delete his own answer
                                                                  if (answerRecord.answerDeletedStatus == false && answerRecord.reported == false) {

                                                                        let correctAnswerStatus = true
                                                                        let correctAnswerCount = questionRecord.correctAnswerCount + 1

                                                                        if (answerRecord.correctAnswerStatus == true) {
                                                                              correctAnswerStatus = false
                                                                              correctAnswerCount = questionRecord.correctAnswerCount - 1
                                                                        }

                                                                        MindBoxAnswerModel.updateOne({
                                                                              _id: answerId
                                                                        }, {
                                                                              $set: {
                                                                                    correctAnswerStatus,
                                                                                    correctAnswerCount
                                                                              }
                                                                        })
                                                                              .exec()
                                                                              .then(async answerCorrected => {

                                                                                    if (answerCorrected.nModified > 0) {

                                                                                          if (correctAnswerStatus == false && String(questionRecord.selectedCorrectAnswerId) == String(answerId)) {

                                                                                                let selectedCorrectAnswerId = "";
                                                                                                let selectedCorrectAnswerUserId = "";

                                                                                                if (questionRecord.correctAnswerCount > 1) {

                                                                                                      let nextCorrectAnswer = await MindBoxAnswerModel.findOne({
                                                                                                            questionId,
                                                                                                            reported: false,
                                                                                                            answerDeletedStatus: false,
                                                                                                            correctAnswerStatus: true,
                                                                                                            isActive: true
                                                                                                      })
                                                                                                            .exec()

                                                                                                      if (nextCorrectAnswer) {
                                                                                                            selectedCorrectAnswerId = nextCorrectAnswer._id
                                                                                                            selectedCorrectAnswerUserId = nextCorrectAnswer.answeredUserId
                                                                                                      }

                                                                                                }

                                                                                                MindBoxQuestionModel.updateOne({
                                                                                                      _id: questionId
                                                                                                }, {
                                                                                                      $set: {
                                                                                                            selectedCorrectAnswerId,
                                                                                                            selectedCorrectAnswerUserId
                                                                                                      }
                                                                                                })
                                                                                                      .exec()
                                                                                                      .then(QuestionUpdated => {

                                                                                                            if (QuestionUpdated) {

                                                                                                                  StudentModel.updateOne({
                                                                                                                        _id: answerRecord.answeredUserId
                                                                                                                  }, {
                                                                                                                        $inc: {
                                                                                                                              mindBoxCoins: -10
                                                                                                                        }
                                                                                                                  })
                                                                                                                        .exec()
                                                                                                                        .then(async pointsUpdated => {

                                                                                                                              if (pointsUpdated.ok == 1) {

                                                                                                                                    let coins = await StudentModel.findOne({
                                                                                                                                          _id: answerRecord.answeredUserId
                                                                                                                                    })
                                                                                                                                    res.status(200).json({
                                                                                                                                          statusCode: "1",
                                                                                                                                          mindBoxCoins: coins.mindBoxCoins,
                                                                                                                                          message: "Successful..!!"
                                                                                                                                    })

                                                                                                                              } else {
                                                                                                                                    res.status(200).json({
                                                                                                                                          statusCode: "0",
                                                                                                                                          message: "Something went wrong. Please try after some time..!!"
                                                                                                                                    })
                                                                                                                              }


                                                                                                                        })
                                                                                                                        .catch(err => {
                                                                                                                              console.log(err);
                                                                                                                              res.status(200).json({
                                                                                                                                    statusCode: "0",
                                                                                                                                    message: "Something went wrong. Please try after some time..!!"
                                                                                                                              })
                                                                                                                        })
                                                                                                            } else {
                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "0",
                                                                                                                        message: "Something Went Wrong. Please Try Later..!!"
                                                                                                                  })
                                                                                                            }

                                                                                                      })
                                                                                                      .catch(err => {

                                                                                                            console.log(err);

                                                                                                            res.status(200).json({
                                                                                                                  statusCode: "0",
                                                                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                                                                            })
                                                                                                      })

                                                                                          } else {

                                                                                                StudentModel.updateOne({
                                                                                                      _id: answerRecord.answeredUserId
                                                                                                }, {
                                                                                                      $inc: {
                                                                                                            mindBoxPoints: points
                                                                                                      }
                                                                                                })
                                                                                                      .exec()
                                                                                                      .then(async pointsUpdated => {

                                                                                                            if (pointsUpdated.ok == 1) {

                                                                                                                  let coins = await StudentModel.findOne({
                                                                                                                        _id: answerRecord.answeredUserId
                                                                                                                  })

                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "1",
                                                                                                                        mindBoxCoins: coins.mindBoxCoins,
                                                                                                                        message: "Successful..!!"
                                                                                                                  })

                                                                                                            } else {
                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "0",
                                                                                                                        message: "Something went wrong. Please try after some time..!!"
                                                                                                                  })
                                                                                                            }


                                                                                                      })
                                                                                                      .catch(err => {
                                                                                                            console.log(err);
                                                                                                            res.status(200).json({
                                                                                                                  statusCode: "0",
                                                                                                                  message: "Something went wrong. Please try after some time..!!"
                                                                                                            })
                                                                                                      })

                                                                                          }

                                                                                    } else {

                                                                                          res.status(200).json({
                                                                                                statusCode: "0",
                                                                                                message: "Something Went Wrong. Please Try Later..!!"
                                                                                          })

                                                                                    }

                                                                              })
                                                                              .catch(err => {

                                                                                    console.log(err);

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something Went Wrong. Please Try Later..!!"
                                                                                    })
                                                                              })
                                                                  } else {

                                                                        if (answerRecord.reported == true) {

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Unreport and Check Correct Answer...!!"
                                                                              })

                                                                        } else {

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Cannot like Deleted Answer...!!"
                                                                              })

                                                                        }

                                                                  }

                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Access Denied...!!"
                                                                  })

                                                            }

                                                      }).catch(err => {

                                                            console.log(err);

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                            })

                                                      })

                                          } else {

                                                if (questionRecord.questionDeletedStatus == true) {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Question Deleted...!!"
                                                      })

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "UnReport Question to check Correct Answer...!!"
                                                      })

                                                }

                                          }

                                    } else {
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied...!!"
                                          })
                                    }

                              })
                              .catch(err => {
                                    console.log(err)

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. Please try later..!!"
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