const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../../models/mindBox/mindBoxAnswerModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')


module.exports = (req, res, next) => {

      if (req.params.studentId && req.params.questionId && req.params.groupId && req.params.answerId) {

            let studentId = req.params.studentId;
            let questionId = req.params.questionId;
            let groupId = req.params.groupId;
            let answerId = req.params.answerId;

            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.singleRecord(studentId, groupId)
                                    .then(connection => {

                                          if (connection != 0) {

                                                /**
                                                 * Check wheather doubt has been deleted by student
                                                 */
                                                MindBoxQuestionModel.findOne({
                                                            _id: questionId,
                                                            groupId : classId,
                                                            // deletedUsers: {
                                                            //       $ne: studentId
                                                            // },
                                                            isActive: true
                                                      }, {
                                                            questionDeletedStatus: 1,
                                                            reported: 1,
                                                      })
                                                      .exec()
                                                      .then(questionRecord => {

                                                            if (questionRecord) {

                                                                  if (questionRecord.questionDeletedStatus == false && questionRecord.reported == false) {

                                                                        MindBoxAnswerModel.findOne({
                                                                                    _id: answerId,
                                                                                    questionId,
                                                                                    // deletedUsers: {
                                                                                    //       $ne: studentId
                                                                                    // },
                                                                                    isActive: true
                                                                              }, {
                                                                                    correctAnswerStatus: 1,
                                                                                    answerDeletedStatus: 1,
                                                                                    reported: 1,
                                                                                    teacherUnreported: 1
                                                                              })
                                                                              .exec()
                                                                              .then(answerRecord => {

                                                                                    console.log(answerRecord);

                                                                                    if (answerRecord) {

                                                                                          //When answer was not deleted and not crowned or coined then you can delete his own answer
                                                                                          if (answerRecord.correctAnswerStatus == false && answerRecord.answerDeletedStatus == false && answerRecord.reported == false && answerRecord.teacherUnreported == false) {

                                                                                                MindBoxAnswerModel.updateOne({
                                                                                                            _id: answerId
                                                                                                      }, {

                                                                                                            $set: {
                                                                                                                  reported: true
                                                                                                            }

                                                                                                      })
                                                                                                      .exec()
                                                                                                      .then(doubtDeleted => {

                                                                                                            if (doubtDeleted.nModified > 0) {

                                                                                                                  MindBoxQuestionModel.updateOne({
                                                                                                                              _id: questionId
                                                                                                                        }, {
                                                                                                                              $set: {
                                                                                                                                    answerCount: questionRecord.answerCount - 1
                                                                                                                              }
                                                                                                                        })
                                                                                                                        .exec()
                                                                                                                        .then(questionUpdated => {

                                                                                                                              if (questionUpdated.nModified == 1) {

                                                                                                                                    res.status(200).json({
                                                                                                                                          statusCode: "1",
                                                                                                                                          message: "Successfull..!!"
                                                                                                                                    })

                                                                                                                              } else {

                                                                                                                                    res.status(200).json({
                                                                                                                                          statusCode: "0",
                                                                                                                                          message: "Something Went Wrong. Please Try Later..!!"
                                                                                                                                    })

                                                                                                                              }

                                                                                                                        })
                                                                                                                        .catch(err => {
                                                                                                                              console.log(err)
                                                                                                                              res.status(200).json({
                                                                                                                                    statusCode: "0",
                                                                                                                                    message: "Something Went Wrong. Please Try Later..!!"
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

                                                                                                if (answerRecord.reported == true) {

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "20",
                                                                                                            message: "Answer has already been reported..!!"
                                                                                                      })

                                                                                                } else if (questionRecord.correctAnswerStatus == true || answerRecord.teacherUnreported == true) {

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "0",
                                                                                                            message: "Cannot report this answer..!!"
                                                                                                      })

                                                                                                } else {

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "20",
                                                                                                            message: "Answer has been deleted..!!"
                                                                                                      })

                                                                                                }

                                                                                          }

                                                                                    } else {
                                                                                          res.status(200).json({
                                                                                                statusCode: "0",
                                                                                                message: "Access Denied..!!"
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

                                                                        if (questionRecord.reported == true) {

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Question has been reported...!!"
                                                                              })

                                                                        } else {

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Question has been deleted...!!"
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