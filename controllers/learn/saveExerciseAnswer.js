const mongoose = require('mongoose');


const UserModel = require('../../models/user/authentication/userModel');

const ExerciseModel = require('../../models/admin/learn/academic/exercise/exerciseModel');
const ExerciseQuestionAndAnswerModel = require('../../models/admin/learn/academic/exercise/exerciseQuestionsModel');
const ExerciseUserAnswerModel = require('../../models/user/learn/academic/exerciseUserAnswerModel');
const UserExerciseResultModel = require('../../models/user/learn/academic/userExerciseResultModel');



const SaveExerciseAnswer = (req, res) => {

      let answerUrls = new Array();

      if (req.files) {
            let filesArray = req.files;

            filesArray.forEach(file => {
                  let correctPath = file.path.replace(/\\/g, '/');
                  answerUrls.push(correctPath);
            });
      }

      console.log(req.body);

      if (req.body.userId && req.body.bookId && req.body.chapterId && req.body.exerciseId && req.body.exerciseQuestionId && (req.body.answer || answerUrls.length > 0 || req.body.savedUrls)) {

            let userId = req.body.userId;
            let bookId = req.body.bookId;
            let chapterId = req.body.chapterId;
            let topicId = req.body.topicId;
            let exerciseId = req.body.exerciseId;
            let exerciseQuestionId = req.body.exerciseQuestionId;
            let answer = req.body.answer;
            let savedUrls = req.body.savedUrls;

            if (savedUrls && savedUrls.trim()) {
                  savedUrls.split(',').forEach(url => {
                        answerUrls.push(url);
                  });
            }


            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              ExerciseModel.findOne({
                                          _id: exerciseId,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(exerciseFound => {

                                          if (exerciseFound) {

                                                ExerciseQuestionAndAnswerModel.findOne({
                                                            $or: [{
                                                                  _id: exerciseQuestionId
                                                            }, {
                                                                  "subQuestions._id": exerciseQuestionId
                                                            }],
                                                            exerciseId,
                                                            isActive: true
                                                      })
                                                      .exec()
                                                      .then(ExerciseQuestion => {

                                                            if (ExerciseQuestion) {

                                                                  ExerciseUserAnswerModel.updateOne({
                                                                              userId,
                                                                              exerciseQuestionId,
                                                                              isActive: true
                                                                        }, {
                                                                              $set: {
                                                                                    isActive: false
                                                                              }
                                                                        })
                                                                        .exec()
                                                                        .then(previousAnswerRemoved => {

                                                                              if (previousAnswerRemoved.ok == 1) {

                                                                                    const SaveExerciseAnswer = new ExerciseUserAnswerModel({
                                                                                          _id: new mongoose.Types.ObjectId(),
                                                                                          userId,
                                                                                          bookId,
                                                                                          chapterId,
                                                                                          exerciseId,
                                                                                          exerciseQuestionId,
                                                                                          answer,
                                                                                          answerUrls
                                                                                    })

                                                                                    if (topicId) {
                                                                                          SaveExerciseAnswer.topicId = topicId
                                                                                    }

                                                                                    SaveExerciseAnswer.save()
                                                                                          .then(AnswerSaved => {

                                                                                                if (AnswerSaved) {

                                                                                                      //If updated record then will not add answers
                                                                                                      if (previousAnswerRemoved.nModified == 1) {

                                                                                                            return res.status(200).json({
                                                                                                                  statusCode: "1",
                                                                                                                  message: "Successful..!!"
                                                                                                            });

                                                                                                      } else {

                                                                                                            UserExerciseResultModel.findOne({
                                                                                                                        userId,
                                                                                                                        exerciseId,
                                                                                                                        isActive: true
                                                                                                                  })
                                                                                                                  .exec()
                                                                                                                  .then(resultFound => {

                                                                                                                        if (resultFound) {

                                                                                                                              UserExerciseResultModel.updateOne({
                                                                                                                                          _id: resultFound._id,
                                                                                                                                          isActive: true
                                                                                                                                    }, {
                                                                                                                                          $set: {
                                                                                                                                                attemptedQuestions: resultFound.attemptedQuestions + 1,
                                                                                                                                                attemptedPercentage: Math.round(((resultFound + 1) / exerciseFound.totalExerciseQuestionsCount) * 100)
                                                                                                                                          }
                                                                                                                                    })
                                                                                                                                    .exec()
                                                                                                                                    .then(exerciseSaved => {
                                                                                                                                          if (exerciseSaved) {
                                                                                                                                                return res.status(200).json({
                                                                                                                                                      statusCode: "1",
                                                                                                                                                      message: "Successful..!!"
                                                                                                                                                });
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

                                                                                                                                    });


                                                                                                                        } else {

                                                                                                                              const SaveExerciseResult = new UserExerciseResultModel({
                                                                                                                                    _id: new mongoose.Types.ObjectId(),
                                                                                                                                    bookId,
                                                                                                                                    chapterId,
                                                                                                                                    exerciseId,
                                                                                                                                    userId,
                                                                                                                                    attemptedQuestions: 1,
                                                                                                                                    attemptedPercentage: Math.round((1 / exerciseFound.totalExerciseQuestionsCount) * 100)
                                                                                                                              })

                                                                                                                              if (topicId) {
                                                                                                                                    SaveExerciseResult.topicId = topicId
                                                                                                                              }

                                                                                                                              SaveExerciseResult.save()
                                                                                                                                    .then(exerciseSaved => {
                                                                                                                                          if (exerciseSaved) {
                                                                                                                                                return res.status(200).json({
                                                                                                                                                      statusCode: "1",
                                                                                                                                                      message: "Successful..!!"
                                                                                                                                                });
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

                                                                                                      }

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

                                                                                          });

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

module.exports = SaveExerciseAnswer