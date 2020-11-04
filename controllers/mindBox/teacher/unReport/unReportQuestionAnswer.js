const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../../models/mindBox/mindBoxAnswerModel');
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

                  if (response && response.statusCode != "0") {

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
                                    questionDeletedStatus: 1,
                                    reported: 1,
                              })
                              .populate('questionDeletedByUserId', 'firstName surName')
                              .exec()
                              .then(questionRecord => {

                                    if (questionRecord) {

                                          if (questionRecord.questionDeletedStatus == false && questionRecord.reported == false) {

                                                MindBoxAnswerModel.findOne({
                                                            _id: answerId,
                                                            questionId,
                                                            // deletedUsers: {
                                                            //       $ne: teacherId
                                                            // },
                                                            reported: true,
                                                            isActive: true
                                                      }).exec()
                                                      .then(answerRecord => {

                                                            console.log(answerRecord);

                                                            if (answerRecord) {

                                                                  //When answer was not deleted and not crowned or coined then you can delete his own answer
                                                                  if (answerRecord.answerDeletedStatus == false) {

                                                                        MindBoxAnswerModel.updateOne({
                                                                                    _id: answerId
                                                                              }, {
                                                                                    $set: {
                                                                                          reported: false,
                                                                                          teacherUnreported: true
                                                                                    }
                                                                              })
                                                                              .exec()
                                                                              .then(questionLiked => {

                                                                                    if (questionLiked.nModified > 0) {

                                                                                          res.status(200).json({
                                                                                                statusCode: "1",
                                                                                                message: "Successful..!!"
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
                                                                              statusCode: "0",
                                                                              message: "Answer has been deleted...!!"
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

                                                if (questionRecord.questionDeletedStatus == true) {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Question has been deleted...!!"
                                                      })

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Question has been reported...!!"
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