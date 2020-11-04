const MindBoxQuestionModel = require('../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../models/mindBox/mindBoxAnswerModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');

const StudentConnectedGroups = require('../../group/student/connectedGroups')

const VerifyStudent = require('../../../middleware/verifyStudent')


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
                                                            groupId: classId,
                                                            deletedUsers: {
                                                                  $ne: studentId
                                                            },
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
                                                      .populate('userId', 'firstName surName profilePic type mindBoxCoins')
                                                      .populate('groupId', 'grade section groupName')
                                                      .exec()
                                                      .then(mindBoxRecord => {

                                                            console.log(mindBoxRecord);

                                                            if (mindBoxRecord) {

                                                                  //Get Answers for the respective doubt which were not deleted and his answers deleted by teacher 
                                                                  MindBoxAnswerModel.find({
                                                                              questionId,
                                                                              // $or: [{
                                                                              //       answeredUserId: studentId
                                                                              // }, {
                                                                              //       answeredUserId: {
                                                                              //             $ne: studentId
                                                                              //       },
                                                                              //       correctAnswerStatus: true
                                                                              // }],
                                                                              $or: [{
                                                                                    answeredUserId: {
                                                                                          $ne: studentId
                                                                                    },
                                                                                    correctAnswerStatus: true,
                                                                                    answerDeletedStatus: false
                                                                              }, {
                                                                                    $or:[{
                                                                                          answeredUserId: studentId
                                                                                    },{
                                                                                          answeredUserId: studentId,
                                                                                          answerDeletedStatus: true,
                                                                                          answerDeletedByUserId: {
                                                                                                $ne: studentId
                                                                                          },
                                                                                    }]
                                                                              }],
                                                                              isActive: true
                                                                        }).sort({
                                                                              date: -1
                                                                        })
                                                                        .populate('answeredUserId', 'firstName surName profilePic type mindBoxCoins')
                                                                        .populate('answerDeletedByUserId', 'firstName surName profilePic type mindBoxCoins')
                                                                        .then(async answers => {

                                                                              console.log("answers");
                                                                              console.log(answers);

                                                                              let answerListData = new Array();
                                                                              let userAnswer = "";
                                                                              let userAnswerUrls = [];
                                                                              let userAnswerCorrectStatus = "false";

                                                                              if (answers.length > 0) {

                                                                                    for (let index = 0; index < answers.length; index++) {
                                                                                          const answer = answers[index];

                                                                                          if ((answer.answerDeletedStatus == true && answer.answerDeletedByUserId != studentId && answer.answeredUserId._id == studentId) || answer.answerDeletedStatus == false) {

                                                                                                let answerObj = {};

                                                                                                answerObj._id = answer._id;
                                                                                                answerObj.userId = answer.answeredUserId._id;
                                                                                                answerObj.userType = answer.answeredUserId.type == 0 ? "Teacher" : "Student";
                                                                                                answerObj.name = answer.answeredUserId.firstName + " " + answer.answeredUserId.surName;
                                                                                                answerObj.profilePic = answer.answeredUserId.profilePic ? answer.answeredUserId.profilePic : "";
                                                                                                answerObj.points = answer.answeredUserId.mindBoxCoins ? answer.answeredUserId.mindBoxCoins : 0;

                                                                                                answerObj.answer = answer.answer ? answer.answer : "";
                                                                                                answerObj.answerUrls = answer.answerUrls ? answer.answerUrls : [];

                                                                                                answerObj.correctAnswerStatus = answer.correctAnswerStatus ? String(answer.correctAnswerStatus) : "false";
                                                                                                answerObj.answerEditedStatus = answer.answerEditedStatus ? String(answer.answerEditedStatus) : "false";

                                                                                                answerObj.hasReported = String(answer.reported);
                                                                                                answerObj.canReport = (answer.teacherUnreported || answer.reported || answer.correctAnswerCount != 0 || String(answer.userId._id) == String(studentId)) ? "false" : "true"
                                                                                                answerObj.likeCount = answer.likedUsers ? answer.likedUsers.length : 0
                                                                                                answerObj.hasLiked = answer.likedUsers ? answer.likedUsers.indexOf(String(studentId)) != -1 ? "true" : "false" : "false"

                                                                                                answerObj.answerDeletedStatus = answer.answerDeletedStatus ? String(answer.answerDeletedStatus) : "false";

                                                                                                answerObj.answerDeletedMessage = answer.answerDeletedStatus == false ? "" : String(answer.answerDeletedByUserId._id) == String(studentId) ? "You deleted this answer" : answer.answerDeletedByUserId.firstName + " " + answer.answerDeletedByUserId.firstName + " has deleted this answer"
                                                                                                answerObj.type = "MSG";
                                                                                                answerObj.date = answer.date;

                                                                                                if (String(answer.answeredUserId._id) == String(studentId)) {
                                                                                                      userAnswer = answer.answer;
                                                                                                      userAnswerUrls = answer.answerUrls
                                                                                                      userAnswerCorrectStatus = String(answer.correctAnswerStatus)
                                                                                                }

                                                                                                answerListData.push(answerObj)
                                                                                          }

                                                                                    }

                                                                              }

                                                                              let _groupName = mindBoxRecord.groupId.grade ? mindBoxRecord.groupId.grade + "-" + mindBoxRecord.groupId.section : mindBoxRecord.groupId.groupName;

                                                                              res.status(200).json({
                                                                                    statusCode: "1",

                                                                                    id: mindBoxRecord._id,
                                                                                    groupId: mindBoxRecord.groupId._id,
                                                                                    groupName: _groupName,

                                                                                    userId: mindBoxRecord.userId._id,
                                                                                    userName: mindBoxRecord.userId.firstName + " " + mindBoxRecord.userId.surName,
                                                                                    profilePic: mindBoxRecord.userId.profilePic ? mindBoxRecord.userId.profilePic : "",
                                                                                    userType: mindBoxRecord.userId.type == 0 ? "Teacher" : "Student",

                                                                                    subjectName: mindBoxRecord.subjectName,
                                                                                    mindBoxCoins: mindBoxRecord.userId.mindBoxCoins,

                                                                                    question: mindBoxRecord.question,
                                                                                    questionUrls: mindBoxRecord.questionUrls ? mindBoxRecord.questionUrls : "",

                                                                                    questionType: String(mindBoxRecord.questionType),
                                                                                    multipleChoiceAnswers: mindBoxRecord.questionType == 1 ? mindBoxRecord.multipleChoiceAnswers.split('%-%') : [],

                                                                                    userAnswer,
                                                                                    userAnswerUrls,
                                                                                    userAnswerCorrectStatus,

                                                                                    correctAnswer: mindBoxRecord.questionType == 1 ? String(mindBoxRecord.selectedCorrectAnswer) : "0", //mindBoxRecord.answer,
                                                                                    correctAnswerUrls: [],
                                                                                    correctAnswerUserName: "",
                                                                                    correctAnswerProfilePic: "",

                                                                                    answerCount: mindBoxRecord.answerCount,
                                                                                    correctAnswerCount: mindBoxRecord.correctAnswerCount,

                                                                                    hasReported: String(mindBoxRecord.reported),
                                                                                    canReport: (mindBoxRecord.teacherUnreported || mindBoxRecord.reported || mindBoxRecord.correctAnswerCount != 0 || String(mindBoxRecord.userId._id) == String(studentId)) ? "false" : "true",
                                                                                    likeCount: mindBoxRecord.likedUsers ? mindBoxRecord.likedUsers.length : 0,
                                                                                    hasLiked: mindBoxRecord.likedUsers ? mindBoxRecord.likedUsers.indexOf(String(studentId)) != -1 ? "true" : "false" : "false",

                                                                                    questionDeletedStatus: "false",
                                                                                    questionDeletedMessage: "",

                                                                                    date: mindBoxRecord.date,

                                                                                    answered: answerListData,

                                                                                    message: "Data Found..!!"
                                                                              })

                                                                        }).catch(err => {

                                                                              console.log(err)
                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something went wrong. Please Try Later..!!"
                                                                              })

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