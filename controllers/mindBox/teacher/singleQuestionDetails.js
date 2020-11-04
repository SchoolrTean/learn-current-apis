const MindBoxQuestionModel = require('../../../models/mindBox/mindBoxQuestionModel');
const MindBoxAnswerModel = require('../../../models/mindBox/mindBoxAnswerModel');

const VerifyTeacher = require('../../../middleware/verifyTeacher');
const ClassTeacherModel = require('../../../models/classes/classTeacherConnectionModel');

module.exports = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.questionId) {

            let teacherId = req.params.teacherId;
            let classId = req.params.groupId;
            let questionId = req.params.questionId;

            //Verify Teacher is active
            VerifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        // //Check teacher has created group and is in active state
                        // ClassTeacherModel.findOne({
                        //             classId: groupId,
                        //             teacherId,
                        //             isActive: true
                        //       })
                        //       .exec()
                        //       .then(group => {

                        //             if (group) {

                                          //Get doubt details using doubt id
                                          MindBoxQuestionModel.findOne({
                                                      _id: questionId,
                                                      groupId :classId,
                                                      // deletedUsers: {
                                                      //       $ne: teacherId
                                                      // },
                                                      questionDeletedStatus: false,
                                                      isActive: true
                                                })
                                                .populate('userId', 'firstName surName profilePic')
                                                .populate('groupId', 'grade section groupName')
                                                .exec()
                                                .then(async QuestionRecord => {

                                                      console.log(QuestionRecord);

                                                      if (QuestionRecord) {

                                                            //Get Answers for the respective doubt which were not deleted and students answers deleted by teacher 
                                                            MindBoxAnswerModel.find({
                                                                        questionId,
                                                                        $or: [{
                                                                              answerDeletedStatus: false
                                                                        }, {
                                                                              answerDeletedStatus: true,
                                                                              answerDeletedByUserId: teacherId,
                                                                              answeredUserId: {
                                                                                    $ne: teacherId
                                                                              }
                                                                        }],
                                                                        isActive: true
                                                                  }).sort({
                                                                        date: -1
                                                                  })
                                                                  .populate('answeredUserId', 'firstName surName profilePic type mindBoxCoins')
                                                                  .populate('answerDeletedByUserId', 'firstName surName profilePic type mindBoxCoins')
                                                                  .then(async answers => {

                                                                        console.log("answers" + answers);

                                                                        let answerListData = new Array();
                                                                        let userAnswer = "";
                                                                        let userAnswerUrls = [];
                                                                        let userAnswerCorrectStatus = "false";

                                                                        let error = 0;

                                                                        if (answers.length > 0) {

                                                                              await MindBoxAnswerModel.updateMany({
                                                                                          questionId,
                                                                                          teacherSeenStatus: false,
                                                                                          isActive: true
                                                                                    }, {
                                                                                          $set: {
                                                                                                teacherSeenStatus: true
                                                                                          }
                                                                                    })
                                                                                    .exec()
                                                                                    .then(answersUpdated => {

                                                                                          for (let index = 0; index < answers.length; index++) {

                                                                                                const answer = answers[index];

                                                                                                let answerObj = {};

                                                                                                answerObj._id = answer._id;
                                                                                                answerObj.userId = answer.answeredUserId._id;
                                                                                                answerObj.userType = answer.answeredUserId.type == 0 ? "Teacher" : "Student";
                                                                                                answerObj.name = answer.answeredUserId.firstName + " " + answer.answeredUserId.surName;
                                                                                                answerObj.profilePic = answer.answeredUserId.profilePic ? answer.answeredUserId.profilePic : "";
                                                                                                answerObj.points = answer.answeredUserId.mindBoxPoints ? answer.answeredUserId.mindBoxPoints : 0;

                                                                                                answerObj.answer = answer.answer ? answer.answer : "";
                                                                                                answerObj.answerUrls = answer.answerUrls ? answer.answerUrls : [];

                                                                                                answerObj.correctAnswerStatus = answer.correctAnswerStatus ? String(answer.correctAnswerStatus) : "false";
                                                                                                answerObj.answerEditedStatus = answer.answerEditedStatus ? String(answer.answerEditedStatus) : "false";

                                                                                                answerObj.answerDeletedStatus = answer.answerDeletedStatus ? String(answer.answerDeletedStatus) : "false";
                                                                                      
                                                                                                answerObj.hasReported = answer.reported ? String(answer.reported) : "false"
                                                                                                answerObj.canReport = "false"
                                                                                                answerObj.likeCount = answer.likedUsers ? answer.likedUsers.length : 0
                                                                                                answerObj.hasLiked = answer.likedUsers ? answer.likedUsers.indexOf(String(teacherId)) != -1 ? "true" : "false" : "false"

                                                                                                answerObj.answerDeletedMessage = answer.answerDeletedStatus == false ? "" : "You have Deleted this answer"
                                                                                                answerObj.date = answer.date;

                                                                                                console.log(answerObj);

                                                                                                if (String(answer.answeredUserId._id) == String(teacherId)) {
                                                                                                      userAnswer = answer.answer ? answer.answer : "";
                                                                                                      userAnswerUrls = answer.answerUrls ? answer.answerUrls : [];
                                                                                                      userAnswerCorrectStatus = answer.correctAnswerStatus ? String(answer.correctAnswerStatus) : "false";
                                                                                                }

                                                                                                answerListData.push(answerObj)

                                                                                          }
                                                                                    }).catch(err => {

                                                                                          console.log(err);

                                                                                          error = 1;
                                                                                    })

                                                                        }

                                                                        if (error == 0) {

                                                                              let _groupName = QuestionRecord.groupId.grade ? QuestionRecord.groupId.grade + "-" + QuestionRecord.groupId.section : QuestionRecord.groupId.groupName;

                                                                              res.status(200).json({
                                                                                    statusCode: "1",

                                                                                    id: QuestionRecord._id,
                                                                                    groupId: QuestionRecord.groupId._id,
                                                                                    groupName: _groupName,

                                                                                    userId: QuestionRecord.userId._id,
                                                                                    userName: QuestionRecord.userId.firstName + " " + QuestionRecord.userId.surName,
                                                                                    profilePic: QuestionRecord.userId.profilePic ? QuestionRecord.userId.profilePic : "",
                                                                                    userType: QuestionRecord.userId.type == 0 ? "Teacher" : "Student",

                                                                                    subjectName: QuestionRecord.subjectName ? QuestionRecord.subjectName : "",
                                                                                    mindBoxCoins: QuestionRecord.userId.mindBoxCoins ? QuestionRecord.userId.mindBoxCoins : 0,

                                                                                    question: QuestionRecord.question ? QuestionRecord.question : "",
                                                                                    questionUrls: QuestionRecord.questionUrls ? QuestionRecord.questionUrls : [],

                                                                                    questionType: String(QuestionRecord.questionType),
                                                                                    multipleChoiceAnswers: QuestionRecord.multipleChoiceAnswers ? QuestionRecord.multipleChoiceAnswers.split('%-%') : [],

                                                                                    userAnswer,
                                                                                    userAnswerUrls,
                                                                                    userAnswerCorrectStatus,

                                                                                    correctAnswer: QuestionRecord.questionType == 1 ? String(QuestionRecord.selectedCorrectAnswer) : "0",
                                                                                    correctAnswerUrls: [],
                                                                                    correctAnswerUserName: "",
                                                                                    correctAnswerProfilePic: "",

                                                                                    hasReported: String(QuestionRecord.reported),
                                                                                    canReport: "false",
                                                                                    likeCount: QuestionRecord.likedUsers ? QuestionRecord.likedUsers.length : 0,
                                                                                    hasLiked: QuestionRecord.likedUsers ? QuestionRecord.likedUsers.indexOf(String(teacherId)) != -1 ? "true" : "false" : "false",

                                                                                    questionDeletedStatus: "false",
                                                                                    questionDeletedMessage: "",
                                                                                    date: QuestionRecord.date,

                                                                                    answered: answerListData,

                                                                                    message: "Data Found..!!"
                                                                              })

                                                                        } else {

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Some thing went wrong. Please try later..!!"
                                                                              })

                                                                        }

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

                              //       } else {
                              //             res.status(200).json({
                              //                   statusCode: "0",
                              //                   message: "No Grades or Group Names ...!!"
                              //             })
                              //       }
                              // })
                              // .catch(err => {
                              //       console.log(err);
                              //       res.status(200).json({
                              //             statusCode: "0",
                              //             message: "Something went wrong...!!"
                              //       })
                              // })

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