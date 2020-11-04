const UserModel = require('../../models/user/authentication/userModel');
const ChapterModel = require('../../models/admin/learn/academic/chaptersModel');

const ExerciseModel = require('../../models/admin/learn/academic/exercise/exerciseModel');
const ExerciseQuestionAndAnswerModel = require('../../models/admin/learn/academic/exercise/exerciseQuestionsModel');

const RevisionExercises = (req, res) => {

      if (req.params.userId && req.params.bookId) {

            let userId = req.params.userId;
            let bookId = req.params.bookId;
            let chapterId = req.params.chapterId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              let Query = {
                                    bookId,
                                    isActive: true
                              }

                              if (chapterId) {
                                    Query._id = chapterId
                              }

                              ChapterModel.findOne(Query)
                                    .sort({
                                          '_id': 1
                                    })
                                    .exec()
                                    .then(chapterData => {

                                          if (chapterData) {

                                                chapterId = chapterData._id;

                                                ExerciseModel.find({
                                                            chapterId,
                                                            isActive: true
                                                      })
                                                      .sort({
                                                            _id: 1
                                                      })
                                                      .exec()
                                                      .then(async chapterExercises => {

                                                            console.log(chapterExercises);

                                                            if (chapterExercises.length > 0) {

                                                                  let exerciseWiseQuestionAndAnswerList = [];

                                                                  for (let index = 0; index < chapterExercises.length; index++) {

                                                                        const ExerciseDetails = ExerciseModel.findOne({
                                                                                    _id: chapterExercises[index],
                                                                                    isActive: true
                                                                              })
                                                                              .populate('chapterId')
                                                                              .populate('topicId')
                                                                              .exec()

                                                                        const ExerciseQuestions = ExerciseQuestionAndAnswerModel.find({
                                                                              exerciseId: chapterExercises[index],
                                                                              isActive: true
                                                                        }).exec()

                                                                        await Promise.all([ExerciseDetails, ExerciseQuestions])
                                                                              .then(promiseData => {

                                                                                    if (promiseData.length == 2) {

                                                                                          let QuestionAndAnswerList = promiseData[1].map(questionDetails => {


                                                                                                let subQuestionList = [];

                                                                                                if (questionDetails.subQuestions.length > 0) {

                                                                                                      subQuestionList = questionDetails.subQuestions.map(questionDataDetails => {

                                                                                                            return {
                                                                                                                  questionId: questionDataDetails._id,
                                                                                                                  questionType: questionDataDetails.questionType,
                                                                                                                  questionNo: questionDataDetails.questionNo ? questionDataDetails.questionNo : "",
                                                                                                                  question: questionDataDetails.question ? questionDataDetails.question : [],
                                                                                                                  questionUrls: questionDataDetails.questionUrls ? questionDataDetails.questionUrls : [],
                                                                                                                  options: questionDataDetails.options ? questionDataDetails.options : [],
                                                                                                                  answer: questionDataDetails.answer ? questionDataDetails.answer : "",
                                                                                                                  answerUrls: questionDataDetails.answerUrls ? questionDataDetails.answerUrls : [],
                                                                                                                  userAnswer: questionDataDetails.answer ? questionDataDetails.answer : "",
                                                                                                                  userAnswerUrls: questionDataDetails.answerUrls ? questionDataDetails.answerUrls : []

                                                                                                            }



                                                                                                      });

                                                                                                }


                                                                                                return {
                                                                                                      questionId: questionDetails._id,
                                                                                                      questionType: questionDetails.questionType,
                                                                                                      questionNo: questionDetails.questionNo ? questionDetails.questionNo : "",
                                                                                                      question: questionDetails.question ? questionDetails.question : [],
                                                                                                      questionUrls: questionDetails.questionUrls ? questionDetails.questionUrls : [],
                                                                                                      options: questionDetails.options ? questionDetails.options : [],
                                                                                                      answer: questionDetails.answer ? questionDetails.answer : "",
                                                                                                      answerUrls: questionDetails.answerUrls ? questionDetails.answerUrls : [],
                                                                                                      subQuestions: subQuestionList,
                                                                                                      userAnswer: questionDetails.answer ? questionDetails.answer : "",
                                                                                                      userAnswerUrls: questionDetails.answerUrls ? questionDetails.answerUrls : []
                                                                                                }


                                                                                          });

                                                                                          exerciseWiseQuestionAndAnswerList.push({
                                                                                                chapterName: promiseData[0].chapterId ? promiseData[0].chapterId.chapterName : "",
                                                                                                chapterNumber: promiseData[0].chapterId.chapterNumber ? promiseData[0].chapterId.chapterNumber : "",
                                                                                                topicName: promiseData[0].topicId ? promiseData[0].topicId.topicName : "",
                                                                                                exerciseName: promiseData[0].exerciseName ? promiseData[0].exerciseName : "",
                                                                                                QuestionAndAnswerList: QuestionAndAnswerList
                                                                                          })

                                                                                    } else {
                                                                                          // break;
                                                                                    }

                                                                              })

                                                                  }

                                                                  Promise.all(exerciseWiseQuestionAndAnswerList)
                                                                        .then(result => {

                                                                              return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    exerciseWiseQuestionAndAnswerList,
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

module.exports = RevisionExercises