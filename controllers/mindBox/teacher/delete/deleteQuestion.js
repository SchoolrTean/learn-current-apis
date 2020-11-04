const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const VerifyTeacher = require('../../../../middleware/verifyTeacher');




module.exports = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.questionId) {

            let teacherId = req.params.teacherId;
            let questionId = req.params.questionId;
            let classId = req.params.groupId;

            VerifyTeacher(teacherId, classId, (error, response) => {

                  // console.log(error);
                  // console.log(response);

                  if (response && response.statusCode != "0" && response.classData) {

                        /**
                         * Check wheather doubt has been deleted by student
                         */
                        MindBoxQuestionModel.findOne({
                                    _id: questionId,
                                    groupId : classId,
                                    correctAnswerCount: 0,
                                    // deletedUsers: {
                                    //       $ne: teacherId
                                    // },
                                    isActive: true
                              }, {
                                    questionDeletedStatus: 1
                              })
                              .exec()
                              .then(questionData => {

                                    console.log(questionData);

                                    if (questionData) {

                                          if (questionData.questionDeletedStatus == false) {

                                                MindBoxQuestionModel.updateOne({
                                                            _id: questionId
                                                      }, {

                                                            $set: {
                                                                  questionDeletedStatus: true,
                                                                  questionDeletedByUserId: teacherId,
                                                            }

                                                      })
                                                      .exec()
                                                      .then(questionDeleted => {

                                                            if (questionDeleted.nModified > 0) {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "Successfull...!!"
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

                                          } else {

                                                res.status(200).json({
                                                      statusCode: "20",
                                                      message: "Question has already deleted..!!"
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