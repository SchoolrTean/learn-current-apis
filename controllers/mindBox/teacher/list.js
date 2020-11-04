const MindBoxQuestionModel = require('../../../models/mindBox/mindBoxQuestionModel');

const VerifyTeacher = require('../../../middleware/verifyTeacher');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');

const ParseQuestionList = require('./parseQuestionList');

module.exports = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;
            let loadMoreId = req.params.loadMoreId;


            //Verify Teacher is active
            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        //Check this groupId is created by teacher and has not deleted
                        ClassTeacherConnectionModel.find({
                                    teacherId,
                                    isActive: true
                              })
                              .exec()
                              .then(groups => {

                                    if (groups.length > 0) {

                                          let groupArray = new Array();

                                          groups.forEach(connection => {
                                                groupArray.push(connection.classId);
                                          });

                                          //Custom query builder to get result from collection
                                          let query = {
                                                groupId: {
                                                      $in: groupArray
                                                },
                                                // deletedUsers: {
                                                //       $ne: teacherId
                                                // },
                                                $or: [{
                                                      questionDeletedStatus: false,
                                                }, {
                                                      userId: {
                                                            $ne: teacherId
                                                      },
                                                      questionDeletedStatus: true,
                                                      questionDeletedByUserId: teacherId
                                                }],
                                                isActive: true
                                          };

                                          //last recored id sent will be sent to get next 10 records from that doubt id
                                          if (loadMoreId) {
                                                query['_id'] = {
                                                      $lt: loadMoreId
                                                }
                                          }

                                          //Get all groups doubts eleminating deleted doubts
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
                                                      questionDeletedUserName: 1,

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
                                                .populate('userId', 'firstName surName profilePic mindBoxCoins type mindBoxOpendTimestamp')
                                                .populate('groupId', 'grade section groupName')
                                                .populate('selectedCorrectAnswerId', 'answer answerUrl groupName')
                                                .populate('selectedCorrectAnswerUserId', 'firstName surName profilePic mindBoxCoins type')
                                                // .populate('questionDeletedByUserId', 'firstName surName')
                                                .exec()
                                                .then(async questionList => {

                                                      console.log(questionList);

                                                      if (questionList.length > 0) {

                                                            ParseQuestionList(questionList, teacherId, response.teacherData.mindBoxOpendTimestamp)
                                                                  .then(questionListResponse => {

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              QuestionList: questionListResponse,
                                                                              message: "Data Found..!!"
                                                                        })

                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something went wrong. Please try later..!!"
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
                                                message: "No Grades or Group Names ...!!"
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

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied.....!!"
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