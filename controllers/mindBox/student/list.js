const MindBoxQuestionModel = require('../../../models/mindBox/mindBoxQuestionModel');

const TimeStamp = require('../updateTimeStamp');
const StudentConnectedGroups = require('../../group/student/connectedGroups')

const VerifyStudent = require('../../../middleware/verifyStudent')
const ParseQuestionList = require('./parseQuestionList')



module.exports = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;
            let loadMoreId = req.params.loadMoreId;

            VerifyStudent(studentId, "")
                  .then(studentVerified => {

                        if (studentVerified.statusCode == "1") {

                              StudentConnectedGroups.list(studentId)
                                    .then(connectedGroupsList => {

                                          if (connectedGroupsList.length > 0) {

                                                let query = {
                                                      groupId: {
                                                            $in: connectedGroupsList
                                                      },
                                                      $or: [{
                                                            reported: false,
                                                      }, {
                                                            userId: studentId,
                                                            reported: true
                                                      }],
                                                      $or: [{
                                                            questionDeletedStatus: false,
                                                      }, {
                                                            userId: studentId,
                                                            questionDeletedByUserId: {
                                                                  $ne: studentId
                                                            },
                                                            questionDeletedStatus: true
                                                      }],
                                                      // deletedUsers: {
                                                      //       $ne: studentId
                                                      // },
                                                      isActive: true
                                                };

                                                if (loadMoreId) {
                                                      query['_id'] = {
                                                            $lt: loadMoreId
                                                      }
                                                }


                                                //Get all connection doubts eleminating deleted doubts
                                                      MindBoxQuestionModel.find(query, {
                                                            userId: 1,
                                                            groupId: 1,
                                                            subjectName: 1,

                                                            question: 1,
                                                            questionUrls: 1,
                                                            answer: 1,

                                                            multipleChoiceAnswers: 1,
                                                            selectedCorrectAnswer: 1,

                                                            selectedCorrectAnswerId: 1,
                                                            selectedCorrectAnswerUserId: 1,

                                                            questionType: 1,
                                                            questionDeletedStatus: 1,
                                                            questionDeletedByUserId: 1,

                                                            answerCount: 1,
                                                            correctAnswerCount: 1,

                                                            reported: 1,
                                                            teacherUnreported: 1,
                                                            likedUsers: 1,

                                                            date: 1
                                                      }, {
                                                            sort: {
                                                                  date: -1
                                                            }
                                                      })
                                                      .limit(10)
                                                      .populate('userId', 'firstName surName profilePic mindBoxCoins type')
                                                      .populate('groupId', 'grade section groupName')
                                                      .populate('selectedCorrectAnswerId', 'answer answerUrl groupName')
                                                      .populate('selectedCorrectAnswerUserId', 'firstName surName profilePic mindBoxCoins type')
                                                      .populate('questionDeletedByUserId', 'firstName surName')
                                                      .exec()
                                                      .then(records => {

                                                            console.log(records);

                                                            if (records.length > 0) {

                                                                  try {

                                                                        ParseQuestionList(records, studentId, studentVerified.studentData.mindBoxOpendTimestamp)
                                                                              .then(QuestionListData => {

                                                                                    TimeStamp(studentId)
                                                                                          .then(updated => {

                                                                                                res.status(200).json({
                                                                                                      statusCode: "1",
                                                                                                      QuestionList: QuestionListData,
                                                                                                      message: "Data Found..!!"
                                                                                                })

                                                                                          })
                                                                                          .catch(err => {
                                                                                                console.log(err);

                                                                                                res.status(200).json({
                                                                                                      statusCode: "0",
                                                                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                                                                })
                                                                                          })

                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something Went Wrong. Please Try Later..!!"
                                                                                    })
                                                                              })

                                                                  } catch (error) {

                                                                        console.log(error)

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something went wrong...!!2"
                                                                        })

                                                                  }

                                                            } else {
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        QuestionList: [],
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
                                                      message: "No Connections..!!!"
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
                                    message: studentVerified.message
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