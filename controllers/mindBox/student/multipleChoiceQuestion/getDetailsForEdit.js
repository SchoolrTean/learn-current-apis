const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')


module.exports = (req, res, next) => {

      if (req.params.studentId && req.params.groupId && req.params.questionId) {

            let studentId = req.params.studentId;
            let questionId = req.params.questionId;
            let classId = req.params.groupId;

            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.singleRecord(studentId, classId)
                                    .then(connection => {

                                          if (connection != 0) {

                                                MindBoxQuestionModel.findOne({
                                                            _id: questionId,
                                                            questionType: 1,
                                                            // deletedUsers: {
                                                            //       $ne: studentId
                                                            // },
                                                            reported: false,
                                                            questionDeletedStatus: false,
                                                            isActive: true
                                                      }, {
                                                            userId: 1,
                                                            groupId: 1,
                                                            subjectName: 1,

                                                            question: 1,
                                                            questionUrls: 1,
                                                            answer: 1,

                                                            multipleChoiceAnswers: 1,
                                                            selectedCorrectAnswer: 1,

                                                            questionType: 1,
                                                      })
                                                      .exec()
                                                      .then(mindBoxRecord => {

                                                            console.log(mindBoxRecord);

                                                            if (mindBoxRecord) {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        id: mindBoxRecord._id,
                                                                        groupId: mindBoxRecord.groupId._id,

                                                                        subjectName: mindBoxRecord.subjectName,

                                                                        question: mindBoxRecord.question,
                                                                        questionUrls: mindBoxRecord.questionUrls ? mindBoxRecord.questionUrls : [],

                                                                        questionType: "1",
                                                                        multipleChoiceAnswers: mindBoxRecord.multipleChoiceAnswers.split('%-%'),

                                                                        correctAnswer: String(mindBoxRecord.selectedCorrectAnswer),
                                                                        message: "Data Found..!!"
                                                                  })

                                                            } else {
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "No Records Found..!!"
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
                                                message: "Something Went Wrong. Please Try Later..!!"
                                          })
                                    });
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