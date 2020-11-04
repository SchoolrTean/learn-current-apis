const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')




module.exports = (req, res, next) => {

      if (req.params.studentId && req.params.groupId && req.params.questionId) {

            let studentId = req.params.studentId;
            let classId = req.params.groupId;
            let questionId = req.params.questionId;

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
                                                            groupId : classId,
                                                            // deletedUsers: {
                                                            //       $ne: studentId
                                                            // },
                                                            isActive: true
                                                      }, {

                                                            questionDeletedStatus: 1,
                                                            reported: 1,
                                                            likedUsers: 1
                                                      })
                                                      .exec()
                                                      .then(questionRecord => {

                                                            console.log(questionRecord);

                                                            if (questionRecord) {

                                                                  if (questionRecord.questionDeletedStatus == false && questionRecord.reported == false) {

                                                                        let likeQuery = "";

                                                                        if (!questionRecord.likedUsers || questionRecord.likedUsers && questionRecord.likedUsers.length == 0 || questionRecord.likedUsers.indexOf(String(studentId)) == -1) {
                                                                              likeQuery = {
                                                                                    $push: {
                                                                                          likedUsers: studentId
                                                                                    }
                                                                              }
                                                                        } else {
                                                                              likeQuery = {
                                                                                    $pull: {
                                                                                          likedUsers: studentId
                                                                                    }
                                                                              }
                                                                        }

                                                                        MindBoxQuestionModel.updateOne({
                                                                                    _id: questionId
                                                                              }, likeQuery)
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

                                                                  } else if (questionRecord.questionDeletedStatus == true) {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Question has been deleted..!!"
                                                                        })

                                                                  } else {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Question has been reported..!!"
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