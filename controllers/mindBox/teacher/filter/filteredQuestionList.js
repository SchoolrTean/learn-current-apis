const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const ClassTeacherConnectionModel = require('../../../../models/classes/classTeacherConnectionModel');
const ParseQuestionList = require('.././parseQuestionList')


module.exports = (req, res, next) => {

      if (req.body.teacherId && req.body.filterType && req.body.filterValue) {

            let teacherId = req.body.teacherId;

            //filte type - 1 =>  subject filter 2 => single group Data 3 => own doubts
            let filterType = req.body.filterType;

            //filte type - 1 :  filter value => **subject || filter type 2 : filter value => GroupId ||  filter type 3 : filter value => NULL
            let filterValue = req.body.filterValue;
            let loadMoreId = req.body.loadMoreId;

            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        ClassTeacherConnectionModel.find({
                                    teacherId,
                                    isActive: true
                              })
                              .exec()
                              .then(groups => {

                                    //Query Building
                                    let query = {
                                          // $or: [{
                                          //       deletedUsers: {
                                          //             $exists: true,
                                          //             $ne: teacherId
                                          //       }
                                          // }, {
                                          //       deletedUsers: {
                                          //             $exists: false
                                          //       }
                                          // }],
                                          reported: false,
                                          questionDeletedStatus: false,
                                          isActive: true
                                    }

                                    if (groups.length > 0 && filterType != 2) {

                                          let groupArray = new Array();

                                          for (let index = 0; index < groups.length; index++) {
                                                groupArray.push(groups[index].classId);
                                          }

                                          query.groupId = {
                                                $in: groupArray
                                          };

                                          if (filterType == '1') {
                                                query.subjectName = filterValue;
                                          } else {
                                                query.userId = teacherId;
                                          }

                                    } else {
                                          query.groupId = filterValue;
                                    }

                                    if (loadMoreId) {
                                          query._id = {
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
                                          .then(async filteredQuestionList => {

                                                console.log(filteredQuestionList)

                                                if (filteredQuestionList.length > 0) {

                                                      ParseQuestionList(filteredQuestionList, teacherId, response.teacherData.mindBoxOpendTimestamp)
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
            res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}