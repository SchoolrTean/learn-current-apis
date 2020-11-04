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

      if (req.body.studentId && req.body.groupId && req.body.questionId && req.body.answerId) {

            let studentId = req.body.studentId;
            let classId = req.body.groupId;
            let questionId = req.body.questionId;
            let answerId = req.body.answerId;

            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.singleRecord(studentId, classId)
                                    .then(connection => {

                                          if (connection != 0) {

                                                //check wheather user has deleted the doubt
                                                MindBoxQuestionModel.findOne({
                                                            _id: questionId,
                                                            // deletedUsers: {
                                                            //       $ne: studentId
                                                            // },
                                                            questionType: 3,
                                                            isActive: true
                                                      })
                                                      .populate('userId', 'type')
                                                      .exec()
                                                      .then(QuestionRecord => {

                                                            console.log(QuestionRecord);

                                                            if (QuestionRecord) {

                                                                  if (QuestionRecord.reported == false && QuestionRecord.questionDeletedStatus == false) {

                                                                        MindBoxAnswerModel.findOne({
                                                                                    _id: answerId,
                                                                                    questionId,
                                                                                    // deletedUsers: {
                                                                                    //       $ne: studentId
                                                                                    // },
                                                                                    answeredUserId: studentId,
                                                                                    isActive: true
                                                                              })
                                                                              .exec()
                                                                              .then(answerFound => {

                                                                                    if (answerFound) {

                                                                                          if (answerFound.correctAnswerStatus == false && answerFound.reported == false && answerFound.answerDeletedStatus == false) {

                                                                                                res.status(200).json({
                                                                                                      statusCode: "1",
                                                                                                      answer: answerFound.answer,
                                                                                                      answerUrls: answerFound.answerUrls,
                                                                                                      message: "Data Found...!!"
                                                                                                })

                                                                                          } else {
                                                                                                res.status(200).json({
                                                                                                      statusCode: "0",
                                                                                                      message: answerFound.correctAnswerStatus == true ? "Cannot edit correct answer..!!" : answerFound.reported == true ? "Cannot edit reported answer..!!" : "Cannot edit deleted answer..!!"
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
                                                                                    console.log(err);

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something went wrong. Please Try Later...!!"
                                                                                    })
                                                                              })

                                                                  } else {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: QuestionRecord.reported == true ? "Question has been reported..!!" : "Question has been deleted..!!"
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