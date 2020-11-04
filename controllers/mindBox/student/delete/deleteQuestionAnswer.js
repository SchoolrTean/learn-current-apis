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
            let classId = req.params.groupId;
            let answerId = req.params.answerId;

            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.singleRecord(studentId, classId)
                                    .then(connection => {

                                          if (connection != 0) {

                                                /**
                                                 * Check wheather doubt has been deleted by student
                                                 */
                                                MindBoxQuestionModel.findOne({
                                                      _id: questionId,
                                                      groupId: classId,
                                                      // deletedUsers: {
                                                      //       $ne: studentId
                                                      // },
                                                      isActive: true
                                                }, {
                                                      _id: 1,
                                                      questionDeletedStatus: 1,
                                                      questionDeletedByUserId: 1,
                                                      reported: 1,
                                                      correctAnswerCount: 1,
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
                                                                              answeredUserId: studentId,
                                                                              answerDeletedByUserId: {
                                                                                    $ne: studentId
                                                                              },
                                                                              correctAnswerStatus: false,
                                                                              // deletedUsers: {
                                                                              //       $ne: studentId
                                                                              // },
                                                                              isActive: true
                                                                        }, {
                                                                              answerDeletedStatus: 1,
                                                                              answerDeletedByUserId: 1
                                                                        })
                                                                              .populate('answerDeletedByUserId', 'firstName surName')
                                                                              .exec()
                                                                              .then(answerRecord => {

                                                                                    console.log(answerRecord);

                                                                                    if (answerRecord) {

                                                                                          //When answer was not deleted and not crowned or coined then you can delete his own answer
                                                                                          if (answerRecord.answerDeletedStatus == false) {

                                                                                                MindBoxAnswerModel.updateOne({
                                                                                                      _id: answerId
                                                                                                }, {

                                                                                                      $set: {
                                                                                                            answerDeletedStatus: true,
                                                                                                            answerDeletedByUserId: studentId,
                                                                                                      }

                                                                                                })
                                                                                                      .exec()
                                                                                                      .then(answerRecordDeleted => {

                                                                                                            if (answerRecordDeleted.nModified > 0) {

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
                                                                                                                                          message: "Answer Deleted Successfully..!!"
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

                                                                                                res.status(200).json({
                                                                                                      statusCode: "20",
                                                                                                      message: answerRecord.answerDeletedByUserId.firstName + " " + answerRecord.answerDeletedByUserId.surName + " deleted this answer..!!"
                                                                                                })

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

                                                                        if (questionRecord.reported == true) {

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Question has been reported...!!"
                                                                              })

                                                                        } else if (questionRecord.questionDeletedStatus == true && String(questionRecord.questionDeletedByUserId._id) == String(studentId)) {

                                                                              res.status(200).json({
                                                                                    statusCode: "20",
                                                                                    message: "You deleted this Question ...!!"
                                                                              })

                                                                        } else {

                                                                              res.status(200).json({
                                                                                    statusCode: "20",
                                                                                    message: questionRecord.questionDeletedByUserId.firstName + " " + questionRecord.questionDeletedByUserId.surName + " deleted this Question..!!"
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