const UserModel = require('../../models/user/authentication/userModel');

const ActivityQuizQuestionsModel = require('../../models/admin/learn/academic/activityQuiz/activityQuizQuestionModel');


const activityQuiz = (req, res) => {

      if (req.params.userId && req.params.activityQuizId) {

            let userId = req.params.userId;
            let activityQuizId = req.params.activityQuizId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              //Selected Test Questions
                              ActivityQuizQuestionsModel.find({
                                          activityQuizId,
                                          isActive: true
                                    }).exec()
                                    .then(QuestionList => {

                                          if (QuestionList.length == 0) {

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Question Records..!!"
                                                });

                                          } else {

                                                let questionCount = 0;

                                                let QuestionDataList = QuestionList.map(questionData => {

                                                      let subQuestionList = [];

                                                      if (questionData.subQuestions.length > 0) {

                                                            subQuestionList = questionData.subQuestions.map(subQuestionData => {

                                                                  return {
                                                                        questionId: subQuestionData._id,
                                                                        questionType: subQuestionData.questionType,
                                                                        questionNo: ++questionCount,
                                                                        question: subQuestionData.question ? subQuestionData.question : [],
                                                                        questionUrls: subQuestionData.questionUrls ? subQuestionData.questionUrls : [],
                                                                        options: subQuestionData.options ? subQuestionData.options : [],
                                                                        answer: subQuestionData.answer ? subQuestionData.answer : "",
                                                                        subQuestions: [],
                                                                        userAnswer: ""
                                                                  }

                                                            });

                                                      }

                                                      return {
                                                            questionId: questionData._id,
                                                            questionType: questionData.questionType,
                                                            questionNo: ++questionCount,
                                                            question: questionData.question ? questionData.question : [],
                                                            questionUrls: questionData.questionUrls ? questionData.questionUrls : [],
                                                            options: questionData.options ? questionData.options : [],
                                                            answer: questionData.answer ? questionData.answer : "",
                                                            subQuestions: subQuestionList,
                                                            userAnswer: ""
                                                      }

                                                });

                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      questionList: QuestionDataList,
                                                      message: "Data Found..!!"
                                                });

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          });

                                    })

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

module.exports = activityQuiz