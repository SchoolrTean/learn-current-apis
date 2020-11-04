const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../../models/mindBox/mindBoxAnswerModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const VerifyTeacher = require('../../../../middleware/verifyTeacher');


module.exports = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.questionId && req.params.answerId) {

            let teacherId = req.params.teacherId;
            let questionId = req.params.questionId;
            let classId = req.params.groupId;
            let answerId = req.params.answerId;

            VerifyTeacher(teacherId, classId, (error, response) => {

                  // console.log(error);
                  // console.log(response);

                  if (response && response.statusCode != "0" && response.classData) {

                        /**
                         * Check wheather doubt has been deleted by student
                         */
                        MindBoxQuestionModel.findOne({
                              _id: questionId,
                              groupId: classId,
                              // deletedUsers: {
                              //       $ne: teacherId
                              // },
                              isActive: true
                        }, {
                              _id: 1,
                              questionDeletedStatus: 1,
                              answerCount: 1,
                        })
                              .exec()
                              .then(QuestionRecord => {

                                    if (QuestionRecord) {

                                          if (QuestionRecord.questionDeletedStatus == false) {

                                                MindBoxAnswerModel.findOne({
                                                      _id: answerId,
                                                      questionId,
                                                      // deletedUsers: {
                                                      //       $ne: teacherId
                                                      // },
                                                      isActive: true
                                                }).exec()
                                                      .then(answerRecord => {

                                                            console.log(answerRecord);

                                                            if (answerRecord && answerRecord.correctAnswerStatus == false) {
                                                                  //When answer was not deleted and not crowned or coined then you can delete his own answer
                                                                  if (answerRecord.answerDeletedStatus == false) {

                                                                        MindBoxAnswerModel.updateOne({
                                                                              _id: answerId
                                                                        }, {

                                                                              $set: {
                                                                                    answerDeletedStatus: true,
                                                                                    answerDeletedByUserId: teacherId
                                                                              }

                                                                        })
                                                                              .exec()
                                                                              .then(doubtDeleted => {

                                                                                    if (doubtDeleted.nModified > 0) {

                                                                                          MindBoxQuestionModel.updateOne({
                                                                                                _id: questionId
                                                                                          }, {
                                                                                                $set: {
                                                                                                      answerCount: QuestionRecord.answerCount - 1
                                                                                                }
                                                                                          })
                                                                                                .exec()
                                                                                                .then(questionUpdated => {

                                                                                                      if (questionUpdated.nModified == 1) {

                                                                                                            res.status(200).json({
                                                                                                                  statusCode: "1",
                                                                                                                  message: "Answer Deleted Successfully...!!"
                                                                                                            })

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
                                                                              message: "Answer has already been deleted..!!"
                                                                        })
                                                                  }

                                                            } else {
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: answerRecord && answerRecord.correctAnswerStatus == true ? "Cannot Delete Correct Answer..!!" : "Access Denied...!!"
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

                                                res.status(200).json({
                                                      statusCode: "20",
                                                      message: "Question has already been deleted...!!"
                                                })

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