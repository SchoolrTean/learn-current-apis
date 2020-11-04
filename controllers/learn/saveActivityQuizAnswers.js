const UserModel = require('../../models/user/authentication/userModel');


const ActivityQuizModel = require('../../models/admin/learn/academic/activityQuiz/activityQuizModel');
const ActivityQuizQuestionsModel = require('../../models/admin/learn/academic/activityQuiz/activityQuizQuestionModel');
const ActivityQuizResultModel = require('../../models/user/learn/academic/userActivityQuizResultModel');


const ChapterTests = (req, res) => {

      if (req.body.userId && req.body.activityQuizId && req.body.questionIds && req.body.answers && (req.body.questionIds.split('%-%').length == req.body.answers.split('%-%').length && req.body.questionIds.split('%-%').length > 0)) {

            let userId = req.body.userId;
            let activityQuizId = req.body.activityQuizId;
            let questionIdList = req.body.questionIds.split('%-%')
            let answersList = req.body.answers.split('%-%')

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              ActivityQuizQuestionsModel.find({
                                          activityQuizId,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(QuestionList => {

                                          if (QuestionList.length > 0) {

                                                let QuestionDataList = QuestionList.map(questionData => {

                                                      let checkAnsweredQuestionIndex = questionIdList.indexOf(String(questionData._id))
                                                      let userAnswered = "0"
                                                      let subQuestionList = [];

                                                      if (checkAnsweredQuestionIndex != -1) {
                                                            userAnswered = answersList[checkAnsweredQuestionIndex];
                                                      }

                                                      if (questionData.subQuestions.length > 0) {

                                                            subQuestionList = questionData.subQuestions.map(subQuestionData => {

                                                                  let checkAnsweredQuestionIndex = questionIdList.indexOf(String(subQuestionData._id))

                                                                  if (checkAnsweredQuestionIndex != -1) {
                                                                        userAnswered = answersList[checkAnsweredQuestionIndex];
                                                                  }

                                                                  return {
                                                                        questionId: subQuestionData._id,
                                                                        questionType: subQuestionData.questionType,
                                                                        questionNo: subQuestionData.questionNo ? subQuestionData.questionNo : "",
                                                                        question: subQuestionData.question ? subQuestionData.question : [],
                                                                        questionUrls: subQuestionData.questionUrls ? subQuestionData.questionUrls : [],
                                                                        options: subQuestionData.options ? subQuestionData.options : [],
                                                                        answer: subQuestionData.answer ? subQuestionData.answer : "",
                                                                        subQuestions: [],
                                                                        userAnswer: userAnswered
                                                                  }

                                                            });

                                                      }

                                                      return {
                                                            questionId: questionData._id,
                                                            questionType: questionData.questionType,
                                                            questionNo: questionData.questionNo ? questionData.questionNo : "",
                                                            question: questionData.question ? questionData.question : [],
                                                            questionUrls: questionData.questionUrls ? questionData.questionUrls : [],
                                                            options: questionData.options ? questionData.options : [],
                                                            answer: questionData.answer ? questionData.answer : "",
                                                            subQuestions: subQuestionList,
                                                            userAnswer: userAnswered
                                                      }

                                                });

                                                // ActivityQuizResultModel.

                                                ActivityQuizModel.findOne({
                                                            _id: activityQuizId,
                                                            attemptedUsers: userId
                                                      })
                                                      .exec()
                                                      .then(alreadyAttempted => {

                                                            if (!alreadyAttempted) {

                                                                  ActivityQuizModel.updateOne({
                                                                              _id: activityQuizId,
                                                                        }, {
                                                                              $push: {
                                                                                    attemptedUsers: userId
                                                                              }
                                                                        })
                                                                        .exec()
                                                                        .then(pushed => {

                                                                              console.log(pushed);

                                                                              if (pushed.ok == 1) {

                                                                                    return res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          questionList: QuestionDataList,
                                                                                          message: "No Record Found..!!"
                                                                                    });

                                                                              } else {

                                                                                    return res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something went wrong. Please try again..!!"
                                                                                    });

                                                                              }

                                                                        }).catch(err => {
                                                                              console.log(err);

                                                                              return res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something went wrong. Please try again..!!"
                                                                              });

                                                                        });

                                                            } else {
                                                                  return res.status(200).json({
                                                                        statusCode: "1",
                                                                        questionList: QuestionDataList,
                                                                        message: "No Record Found..!!"
                                                                  });
                                                            }
                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!"
                                                            });

                                                      });

                                          } else {
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Record Found..!!"
                                                });
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          });

                                    });

                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: !userRegistered ? "Access Denied..!!" : userRegistered && userRegistered.isConfirmed == false ? "Please Confirm your account..!!" : "Please Activate Your Account...!!"
                              });

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: err.name == "ValidationError" ? "Please fill all fields correctly..!!" : "Something went wrong. Please try again..!!"
                        });

                  });

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = ChapterTests