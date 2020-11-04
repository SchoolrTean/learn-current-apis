const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');



module.exports = (req, res, next) => {

      let answerUrls = new Array();

      if (req.file) {
            answerUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      if (req.params.teacherId && req.params.groupId && req.params.questionId) {

            let teacherId = req.params.teacherId;
            let classId = req.params.groupId;
            let questionId = req.params.questionId;

            VerifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0" && response.classData) {

                        /**
                         * Check wheather doubt has been deleted by student
                         */
                        MindBoxQuestionModel.findOne({
                                    _id: questionId,
                                    groupId : classId,
                                    // deletedUsers: {
                                    //       $ne: teacherId
                                    // },
                                    reported: true,
                                    isActive: true
                              }, {
                                    questionDeletedStatus: 1,
                              })
                              .exec()
                              .then(questionRecord => {

                                    console.log(questionRecord);

                                    if (questionRecord) {

                                          if (questionRecord.questionDeletedStatus == false) {

                                                MindBoxQuestionModel.updateOne({
                                                            _id: questionId
                                                      }, {
                                                            $set: {
                                                                  reported: false,
                                                                  teacherUnreported: true
                                                            }
                                                      })
                                                      .exec()
                                                      .then(questionUnreported => {

                                                            if (questionUnreported.nModified > 0) {

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
                                                      message: "Question has been deleted..!!"
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