const mongoose = require('mongoose');

const UserModel = require('../../../../models/user/authentication/userModel');

const CourseTopicModel = require('../../../../models/admin/learn/non-academic/course/courseTopicModel');
const QuestionModel = require('../../../../models/admin/learn/non-academic/course/test/questionsModel');
const UserTestResultModel = require('../../../../models/user/learn/non-academic/aptitude/userTestResultModel');



const SaveTestResult = (req, res) => {

      if (req.body.userId && req.body.topicId && req.body.allQuestionIds && req.body.questionIds && req.body.answers && (req.body.questionIds.split('%-%').length == req.body.answers.split('%-%').length && req.body.questionIds.split('%-%').length > 0)) {

            let userId = req.body.userId;
            let courseTopicId = req.body.topicId;

            let questionIdList = req.body.questionIds.split('%-%');
            let answersList = req.body.answers.split('%-%');
            let allQuestionIdList = req.body.allQuestionIds.split('%-%');

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              CourseTopicModel.findOne({
                                          _id: courseTopicId,
                                          isPublished: true,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(courseTopicRecord => {

                                          if (courseTopicRecord) {

                                                QuestionModel.find({
                                                            _id: {
                                                                  $in: allQuestionIdList
                                                            },
                                                            courseTopicId,
                                                            isActive: true
                                                      })
                                                      .sort({
                                                            _id: 1
                                                      })
                                                      .exec()
                                                      .then(QuestionList => {

                                                            //Will get all Chapter Test
                                                            console.log(QuestionList);

                                                            if (QuestionList.length > 0) {

                                                                  let QuestionDataList = [];
                                                                  let totalQuestionsCount = 0;
                                                                  let correctAnswerCount = 0;
                                                                  let wrongAnswerCount = 0;


                                                                  QuestionDataList = QuestionList.map(questionData => {

                                                                        totalQuestionsCount = (!questionData.subQuestions || (questionData.subQuestions && questionData.subQuestions.length == 0)) ? totalQuestionsCount + 1 : totalQuestionsCount;

                                                                        let questionSubmittedIndex = questionIdList.indexOf(String(questionData._id))
                                                                        let userAnswered = "0"
                                                                        let subQuestionList = [];

                                                                        if (questionSubmittedIndex != -1 && answersList[questionSubmittedIndex] && answersList[questionSubmittedIndex].trim() != "") {

                                                                              userAnswered = answersList[questionSubmittedIndex];

                                                                              if (answersList[questionSubmittedIndex] == questionData.answer) {
                                                                                    correctAnswerCount += 1;
                                                                              } else {
                                                                                    wrongAnswerCount += 1;
                                                                              }
                                                                        }

                                                                        if (questionData.subQuestions && questionData.subQuestions.length > 0) {

                                                                              subQuestionList = questionData.subQuestions.map(subQuestionData => {

                                                                                    totalQuestionsCount += 1;

                                                                                    let questionSubmittedIndex = questionIdList.indexOf(String(subQuestionData._id))
                                                                                    let userAnswered = "0"

                                                                                    if (questionSubmittedIndex != -1 && answersList[questionSubmittedIndex] && answersList[questionSubmittedIndex].trim() != "") {

                                                                                          userAnswered = answersList[questionSubmittedIndex];

                                                                                          if (answersList[questionSubmittedIndex] == subQuestionData.answer) {
                                                                                                correctAnswerCount += 1;
                                                                                          } else {
                                                                                                wrongAnswerCount += 1;
                                                                                          }
                                                                                    }


                                                                                    return {
                                                                                          questionId: subQuestionData._id,
                                                                                          questionType: subQuestionData.questionType,
                                                                                          questionNo: totalQuestionsCount,
                                                                                          question: subQuestionData.question ? subQuestionData.question : [],
                                                                                          questionUrls: subQuestionData.questionUrls ? subQuestionData.questionUrls : [],
                                                                                          options: subQuestionData.options ? subQuestionData.options : [],
                                                                                          answer: subQuestionData.answer ? subQuestionData.answer : "",
                                                                                          explanation: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
                                                                                          explanationUrl: "",
                                                                                          subQuestions: [],
                                                                                          userAnswer: userAnswered
                                                                                    }

                                                                              });

                                                                        }


                                                                        return {
                                                                              questionId: questionData._id,
                                                                              questionType: questionData.questionType,
                                                                              questionNo: totalQuestionsCount,
                                                                              question: questionData.question ? questionData.question : [],
                                                                              questionUrls: questionData.questionUrls ? questionData.questionUrls : [],
                                                                              options: questionData.options ? questionData.options : [],
                                                                              answer: questionData.answer ? questionData.answer : "",
                                                                              subQuestions: subQuestionList,
                                                                              explanation: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
                                                                              explanationUrl: "",
                                                                              userAnswer: userAnswered
                                                                        }

                                                                  });

                                                                  console.log("totalQuestionsCount");
                                                                  console.log(totalQuestionsCount);
                                                                  console.log("correctAnswerCount");
                                                                  console.log(correctAnswerCount);
                                                                  console.log("wrongAnswerCount");
                                                                  console.log(wrongAnswerCount);

                                                                  let correctAnswerPercentage = correctAnswerCount != 0 ? Math.round((correctAnswerCount / totalQuestionsCount) * 100) : 0
                                                                  let wrongAnswersPercentage = wrongAnswerCount != 0 ? Math.round((wrongAnswerCount / totalQuestionsCount) * 100) : 0

                                                                  const SaveNewTestResult = new UserTestResultModel({
                                                                        _id: new mongoose.Types.ObjectId(),
                                                                        courseId: courseTopicRecord.courseId,
                                                                        courseTopicId,
                                                                        userId,
                                                                        correctAnswerPercentage,
                                                                        wrongAnswersPercentage,
                                                                        latestFlag: true
                                                                  })

                                                                  UserTestResultModel.updateOne({
                                                                              courseTopicId,
                                                                              userId,
                                                                              latestFlag: true
                                                                        }, {
                                                                              $set: {
                                                                                    latestFlag: false
                                                                              }
                                                                        }).exec()
                                                                        .then(testResult => {

                                                                              if (testResult.ok == 1) {

                                                                                    SaveNewTestResult.save()
                                                                                          .then(testresultSavedData => {

                                                                                                if (testresultSavedData) {

                                                                                                      return res.status(200).json({
                                                                                                            statusCode: "1",
                                                                                                            questionCount: totalQuestionsCount,
                                                                                                            correctAnswerPercentage,
                                                                                                            wrongAnswersPercentage,
                                                                                                            questionList: QuestionDataList,
                                                                                                            message: "Data Found..!!"
                                                                                                      });

                                                                                                } else {

                                                                                                      return res.status(200).json({
                                                                                                            statusCode: "0",
                                                                                                            message: "Something went wrong. Please try again..!!"
                                                                                                      });

                                                                                                }

                                                                                          })

                                                                              } else {
                                                                                    return res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something went wrong. Please try again..!!"
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
                                                                        message: "No Records..!!"
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

module.exports = SaveTestResult