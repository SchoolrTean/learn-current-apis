const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');

const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')

const ParseQuestionList = require('../parseQuestionList');


module.exports = (req, res, next) => {

      if (req.body.studentId && req.body.filterType) {

            let studentId = req.body.studentId;
            // 1-subject filtering, 2- My Doubts 3 - Group Wise
            let filterType = req.body.filterType;

            // filterType = 1 the filter value is subject name filterType = 3 and filter value is group Id
            let filterValue = req.body.filterValue;
            let loadMoreId = req.body.loadMoreId;

            //Check if filter type is 1 or 3 and filter value exists or not
            let error = (filterType == '1' || filterType == '3') ? filterValue ? 0 : 1 : 0;

            if (error == 0) {

                  //Check student and active
                  VerifyStudent(studentId, "")
                        .then(success => {

                              if (success.statusCode == "1") {

                                    //Get All connections
                                    StudentConnectedGroups.list(studentId)
                                          .then(connectedGroupsList => {

                                                if (connectedGroupsList.length > 0) {

                                                      let groupArray = new Array();

                                                      if (filterType == '3') {
                                                            groupArray.push(filterValue);
                                                      } else {
                                                            groupArray = connectedGroupsList;
                                                      }

                                                      // connections.forEach(connection => {
                                                      //      groupArray.push(connection.groupId);
                                                      // });

                                                      //Query Building
                                                      let query = {
                                                            groupId: {
                                                                  $in: groupArray
                                                            },
                                                            reported: false,
                                                            questionDeletedStatus: false,
                                                            // $or: [{
                                                            //       deletedUsers: {
                                                            //             $exists: true,
                                                            //             $ne: studentId
                                                            //       }
                                                            // }, {
                                                            //       deletedUsers: {
                                                            //             $exists: false
                                                            //       }
                                                            // }],
                                                            isActive: true
                                                      }


                                                      if (filterType == '1') {
                                                            query['subjectName'] = filterValue;
                                                      } else if (filterType == '2') {
                                                            query['userId'] = studentId;
                                                      }

                                                      if (loadMoreId) {
                                                            query['_id'] = {
                                                                  $lt: loadMoreId
                                                            }

                                                      }

                                                      //Filter Data using query of top
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
                                                            .populate('questionDeletedByUserId', 'firstName surName')
                                                            .populate('selectedCorrectAnswerId', 'answer answerUrl groupName')
                                                            .populate('selectedCorrectAnswerUserId', 'firstName surName profilePic mindBoxCoins type')
                                                            .exec()
                                                            .then(async filteredQuestionList => {

                                                                  console.log(filteredQuestionList)

                                                                  if (filteredQuestionList.length > 0) {

                                                                        ParseQuestionList(filteredQuestionList, studentId, success.studentData.mindBoxOpendTimestamp)
                                                                              .then(QuestionListData => {

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
                                                            message: "Please check connection with teacher..!!!"
                                                      })
                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Access Denied..!!"
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
                  res.status(200).json({
                        statusCode: "0",
                        message: "Something Went Wrong please try later..!!"
                  });
            }
      } else {
            res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}