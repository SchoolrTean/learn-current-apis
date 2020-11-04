const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')




module.exports = (req, res, next) => {

      if (req.params.studentId && req.params.questionId && req.params.groupId) {

            let studentId = req.params.studentId;
            let questionId = req.params.questionId;
            let classId = req.params.groupId;

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
                                                            userId: studentId,
                                                            groupId : classId,
                                                            questionDeletedByUserId: {
                                                                  $ne: studentId
                                                            },
                                                            // deletedUsers: {
                                                            //       $ne: studentId
                                                            // },
                                                            isActive: true
                                                      }, {
                                                            questionDeletedStatus: 1,
                                                            questionDeletedByUserId: 1,
                                                            correctAnswerCount: 1
                                                      })
                                                      .populate('questionDeletedByUserId', 'firstName surName')
                                                      .exec()
                                                      .then(questionData => {

                                                            console.log(questionData);

                                                            if (questionData) {

                                                                  if (questionData.questionDeletedStatus == false && questionData.correctAnswerCount == 0) {

                                                                        MindBoxQuestionModel.updateOne({
                                                                                    _id: questionId
                                                                              }, {

                                                                                    $set: {
                                                                                          questionDeletedStatus: true,
                                                                                          questionDeletedByUserId: studentId,
                                                                                          // questionDeletedUserName: success.studentData.firstName + " " + success.studentData.surName, //deleted user Name
                                                                                    }

                                                                              })
                                                                              .exec()
                                                                              .then(doubtDeleted => {

                                                                                    if (doubtDeleted.nModified > 0) {

                                                                                          res.status(200).json({
                                                                                                statusCode: "1",
                                                                                                message: "Doubt Deleted Successfully...!!"
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
                                                                                          message: "Something went wrong...!!"
                                                                                    })
                                                                              })

                                                                  } else if (questionData.questionDeletedStatus == true) {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: questionData.questionDeletedByUserId.firstName + " " + questionData.questionDeletedByUserId.surName + "deleted this Question..!!"
                                                                        })

                                                                  } else {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Cannot delete correct answer question..!!"
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