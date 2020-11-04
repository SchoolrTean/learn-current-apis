const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');



module.exports = (req, res, next) => {

      let answerUrls = new Array();

      if (req.file) {
            answerUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      if (req.params.teacherId && req.params.questionId && req.params.groupId) {

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
                                    groupId: classId,
                                    // deletedUsers: {
                                    //       $ne: teacherId
                                    // },
                                    isActive: true
                              }, {
                                    teacherId: 1,
                                    answerCount: 1,
                                    questionDeletedStatus: 1,
                                    reported: 1,
                                    likedUsers: 1,
                                    userId: 1
                              })
                              .exec()
                              .then(questionRecord => {

                                    console.log(questionRecord);

                                    if (questionRecord) {

                                          if (questionRecord.questionDeletedStatus == false && questionRecord.reported == false) {

                                                let likeQuery = "";

                                                if (!questionRecord.likedUsers || questionRecord.likedUsers && questionRecord.likedUsers.length == 0 || questionRecord.likedUsers.indexOf(String(teacherId)) == -1) {
                                                      likeQuery = {
                                                            $push: {
                                                                  likedUsers: teacherId
                                                            }
                                                      }
                                                } else {
                                                      likeQuery = {
                                                            $pull: {
                                                                  likedUsers: teacherId
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
                                                      statusCode: "20",
                                                      message: "Question has been deleted ..!!"
                                                })

                                          } else {

                                                res.status(200).json({
                                                      statusCode: "20",
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