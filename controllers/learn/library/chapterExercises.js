const mongoose = require('mongoose');

const UserModel = require('../../../models/user/authentication/userModel');
const ChapterModel = require('../../../models/admin/learn/academic/chaptersModel');

const ExerciseModel = require('../../../models/admin/learn/academic/exercise/exerciseModel');
const ExerciseQuestionAndAnswerModel = require('../../../models/admin/learn/academic/exercise/exerciseQuestionsModel');
const ExerciseUserAnswerModel = require('../../../models/user/learn/academic/exerciseUserAnswerModel');

const ChapterExercises = (req, res) => {

      if (req.params.userId && req.params.chapterId) {

            let userId = req.params.userId;
            let chapterId = req.params.chapterId;
            let selectedExercise = req.params.exerciseId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              ChapterModel.findOne({
                                          _id: chapterId,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(chapterData => {

                                          if (chapterData) {

                                                ExerciseModel.find({
                                                            chapterId,
                                                            isActive: true
                                                      })
                                                      .sort({
                                                            _id: 1
                                                      })
                                                      .exec()
                                                      .then(chapterExercises => {

                                                            console.log(chapterExercises);

                                                            if (chapterExercises.length > 0) {

                                                                  if (!selectedExercise) {
                                                                        selectedExercise = chapterExercises[0]._id;
                                                                  }

                                                                  let SelectedExerciseQuestions = ExerciseQuestionAndAnswerModel.find({
                                                                        exerciseId: selectedExercise,
                                                                        isActive: true
                                                                  }).exec()

                                                                  let SelectedExerciseUserAnswers = ExerciseUserAnswerModel.find({
                                                                        exerciseId: selectedExercise,
                                                                        userId,
                                                                        isActive: true
                                                                  }).exec()

                                                                  let exerciseWiseQuestionCount = ExerciseQuestionAndAnswerModel.aggregate([{
                                                                              $match: {
                                                                                    chapterId: new mongoose.Types.ObjectId(chapterId),
                                                                                    isActive: true
                                                                              }
                                                                        },
                                                                        {
                                                                              $group: {
                                                                                    _id: "$exerciseId",
                                                                                    questionCount: {
                                                                                          $sum: 1
                                                                                    }
                                                                              }
                                                                        },
                                                                        {
                                                                              $sort: {
                                                                                    _id: 1
                                                                              }
                                                                        }
                                                                  ])


                                                                  let exerciseWiseQuestionsUserAnsweredCount = ExerciseUserAnswerModel.aggregate([{
                                                                        $match: {
                                                                              chapterId: new mongoose.Types.ObjectId(chapterId),
                                                                              userId: new mongoose.Types.ObjectId(userId),
                                                                              isActive: true
                                                                        }
                                                                  }, {
                                                                        $group: {
                                                                              _id: "$exerciseId",
                                                                              answeredCount: {
                                                                                    $sum: 1
                                                                              }
                                                                        }
                                                                  }, {
                                                                        $sort: {
                                                                              _id: 1
                                                                        }
                                                                  }])


                                                                  Promise.all([exerciseWiseQuestionCount, exerciseWiseQuestionsUserAnsweredCount, SelectedExerciseQuestions, SelectedExerciseUserAnswers])
                                                                        .then(result => {

                                                                              console.log(result);

                                                                              let topicListData = [];
                                                                              let QuestionAnswerList = [];
                                                                              let totalQuestionCount = 0;
                                                                              let totalAnswerCount = 0;

                                                                              let totalChapterQuestionCount = 0;

                                                                              if (result[0].length == 0) {

                                                                                    return res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "No Exercises..!!"
                                                                                    });

                                                                              } else {

                                                                                    if (result[1].length == 0) {

                                                                                          for (let index = 0; index < chapterExercises.length; index++) {
                                                                                                const exercise = chapterExercises[index];
                                                                                                totalChapterQuestionCount += exercise.totalExerciseQuestionsCount;

                                                                                                topicListData.push({
                                                                                                      exercise_id: exercise._id,
                                                                                                      exerciseName: exercise.exerciseName,
                                                                                                      completionStatus: '0',
                                                                                                })

                                                                                          }

                                                                                    } else {

                                                                                          // let exerciseIdsListForQuestionCount = result[0].map(exercise=> exercise._id)

                                                                                          let exerciseIdsListForUserAnswers = result[1].map(exercise => String(exercise._id))


                                                                                          for (let index = 0; index < chapterExercises.length; index++) {
                                                                                                const exercise = chapterExercises[index];
                                                                                                totalChapterQuestionCount += exercise.totalExerciseQuestionsCount;

                                                                                                // const exerciseQuestionsCountIndex = exerciseIdsListForQuestionCount.indexOf(exercise._id)
                                                                                                const exerciseQuestionUserAnswerCountIndex = exerciseIdsListForUserAnswers.indexOf(String(exercise._id))

                                                                                                //Questions Exists 
                                                                                                if (exercise.totalExerciseQuestionsCount != 0) {

                                                                                                      if (exerciseQuestionUserAnswerCountIndex == -1) {

                                                                                                            topicListData.push({
                                                                                                                  exercise_id: exercise._id,
                                                                                                                  exerciseName: exercise.exerciseName,
                                                                                                                  completionStatus: '0',
                                                                                                            })

                                                                                                      } else {

                                                                                                            topicListData.push({
                                                                                                                  exercise_id: exercise._id,
                                                                                                                  exerciseName: exercise.exerciseName,
                                                                                                                  completionStatus: String(Math.round(((result[1][exerciseQuestionUserAnswerCountIndex].answeredCount / exercise.totalExerciseQuestionsCount) * 100))),
                                                                                                            })
                                                                                                      }

                                                                                                }
                                                                                          }

                                                                                    }

                                                                                    let questionList = result[2].map(questionData => {

                                                                                          return {
                                                                                                // questionId: questionData._id,
                                                                                                // question: questionData.question,
                                                                                                // questionUrls: questionData.questionUrls,
                                                                                                // answer: questionData.answer,
                                                                                                // answerUrls: questionData.answerUrls

                                                                                                questionId: questionData._id,
                                                                                                questionType: questionData.questionType,
                                                                                                questionNo: questionData.questionNo ? questionData.questionNo : "",
                                                                                                question: questionData.question ? questionData.question : [],
                                                                                                questionUrls: questionData.questionUrls ? questionData.questionUrls : [],
                                                                                                options: questionData.options ? questionData.options : [],
                                                                                                answer: questionData.answer ? questionData.answer : "",
                                                                                                answerUrls: questionData.answerUrls ? questionData.answerUrls : [],
                                                                                                subQuestions: questionData.subQuestions ? questionData.subQuestions : "",
                                                                                          }

                                                                                    });

                                                                                    let answerList = [];
                                                                                    let answeredQuestionIdList = [];

                                                                                    result[3].forEach(answerData => {

                                                                                          answeredQuestionIdList.push(String(answerData.exerciseQuestionId));

                                                                                          answerList.push({
                                                                                                userAnswerId: answerData._id,
                                                                                                userAnswer: answerData.answer,
                                                                                                userAnswerUrls: answerData.answerUrls
                                                                                          })

                                                                                    });

                                                                                    questionList.forEach(questionDetails => {

                                                                                          totalQuestionCount = questionDetails.subQuestions && questionDetails.subQuestions.length > 0 ? totalQuestionCount : totalQuestionCount + 1;

                                                                                          let checkAnswered = answeredQuestionIdList.indexOf(String(questionDetails.questionId))

                                                                                          let subQuestionList = [];

                                                                                          if (questionDetails.subQuestions.length > 0) {

                                                                                                subQuestionList = questionDetails.subQuestions.map(questionDataDetails => {

                                                                                                      let checkAnswered = answeredQuestionIdList.indexOf(String(questionDataDetails._id))

                                                                                                      totalQuestionCount += 1;

                                                                                                      if (checkAnswered == -1) {

                                                                                                            return {
                                                                                                                  questionId: questionDataDetails._id,
                                                                                                                  questionType: questionDataDetails.questionType,
                                                                                                                  questionNo: questionDataDetails.questionNo ? questionDataDetails.questionNo : "",
                                                                                                                  question: questionDataDetails.question ? questionDataDetails.question : [],
                                                                                                                  questionUrls: questionDataDetails.questionUrls ? questionDataDetails.questionUrls : [],
                                                                                                                  options: questionDataDetails.options ? questionDataDetails.options : [],
                                                                                                                  answer: questionDataDetails.answer ? questionDataDetails.answer : "",
                                                                                                                  answerUrls: questionDataDetails.answerUrls ? questionDataDetails.answerUrls : [],

                                                                                                                  userAnswerId: "",
                                                                                                                  userAnswer: "",
                                                                                                                  userAnswerUrls: []
                                                                                                            }

                                                                                                      } else {

                                                                                                            totalAnswerCount = totalAnswerCount + 1

                                                                                                            return {
                                                                                                                  questionId: questionDataDetails._id,
                                                                                                                  questionType: questionDataDetails.questionType,
                                                                                                                  questionNo: questionDataDetails.questionNo ? questionDataDetails.questionNo : "",
                                                                                                                  question: questionDataDetails.question ? questionDataDetails.question : [],
                                                                                                                  questionUrls: questionDataDetails.questionUrls ? questionDataDetails.questionUrls : [],
                                                                                                                  options: questionDataDetails.options ? questionDataDetails.options : [],
                                                                                                                  answer: questionDataDetails.answer ? questionDataDetails.answer : "",
                                                                                                                  answerUrls: questionDataDetails.answerUrls ? questionDataDetails.answerUrls : [],

                                                                                                                  userAnswerId: answerList[checkAnswered].userAnswerId,
                                                                                                                  userAnswer: answerList[checkAnswered].userAnswer,
                                                                                                                  userAnswerUrls: answerList[checkAnswered].userAnswerUrls
                                                                                                            }

                                                                                                      }

                                                                                                });

                                                                                          }

                                                                                          if (checkAnswered == -1) {

                                                                                                QuestionAnswerList.push({
                                                                                                      questionId: questionDetails.questionId,
                                                                                                      questionType: questionDetails.questionType,
                                                                                                      questionNo: questionDetails.questionNo ? questionDetails.questionNo : "",
                                                                                                      question: questionDetails.question ? questionDetails.question : [],
                                                                                                      questionUrls: questionDetails.questionUrls ? questionDetails.questionUrls : [],
                                                                                                      options: questionDetails.options ? questionDetails.options : [],
                                                                                                      answer: questionDetails.answer ? questionDetails.answer : "",
                                                                                                      answerUrls: questionDetails.answerUrls ? questionDetails.answerUrls : [],
                                                                                                      subQuestions: subQuestionList,

                                                                                                      userAnswerId: "",
                                                                                                      userAnswer: "",
                                                                                                      userAnswerUrls: []
                                                                                                })

                                                                                          } else {

                                                                                                totalAnswerCount = totalAnswerCount + 1

                                                                                                QuestionAnswerList.push({
                                                                                                      questionId: questionDetails.questionId,
                                                                                                      questionType: questionDetails.questionType,
                                                                                                      questionNo: questionDetails.questionNo ? questionDetails.questionNo : "",
                                                                                                      question: questionDetails.question ? questionDetails.question : [],
                                                                                                      questionUrls: questionDetails.questionUrls ? questionDetails.questionUrls : [],
                                                                                                      options: questionDetails.options ? questionDetails.options : [],
                                                                                                      answer: questionDetails.answer ? questionDetails.answer : "",
                                                                                                      answerUrls: questionDetails.answerUrls ? questionDetails.answerUrls : [],
                                                                                                      subQuestions: subQuestionList,

                                                                                                      userAnswerId: answerList[checkAnswered].userAnswerId,
                                                                                                      userAnswer: answerList[checkAnswered].userAnswer,
                                                                                                      userAnswerUrls: answerList[checkAnswered].userAnswerUrls
                                                                                                })

                                                                                          }

                                                                                    });

                                                                              }

                                                                              return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    chapterDetails: {
                                                                                          chapterName: chapterData.chapterName,
                                                                                          chapterNumber: chapterData.chapterNumber ? chapterData.chapterNumber : "",
                                                                                          chapterExercisesCount: chapterExercises.length,
                                                                                          totalChapterQuestionCount
                                                                                    },
                                                                                    selectedTopicDetails: {
                                                                                          totalAnswerCount,
                                                                                          totalQuestionCount,
                                                                                    },
                                                                                    exerciseList: topicListData,
                                                                                    questionAndAnswerList: QuestionAnswerList,
                                                                                    message: "Data Found..!!"
                                                                              });

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
                                                                        message: "No Exercises..!!"
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

module.exports = ChapterExercises