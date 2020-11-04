const UserModel = require('../../../models/user/authentication/userModel');
const ChapterModel = require('../../../models/admin/learn/academic/chaptersModel');
const TopicModel = require('../../../models/admin/learn/academic/topicsModel');
const ExerciseModel = require('../../../models/admin/learn/academic/exercise/exerciseModel');
const ActivityQuizModel = require('../../../models/admin/learn/academic/activityQuiz/activityQuizModel');
const ActivityQuizResultModel = require('../../../models/user/learn/academic/userActivityQuizResultModel');


const SubjectBookChapterList = (req, res) => {

      if (req.params.userId && req.params.chapterId) {

            let userId = req.params.userId;
            let chapterId = req.params.chapterId;

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

                                                let topics = TopicModel.find({
                                                      chapterId,
                                                      isActive: true
                                                }).exec()

                                                let exercisesExists = ExerciseModel.findOne({
                                                            chapterId,
                                                            totalExerciseQuestionsCount: {
                                                                  $gt: 0
                                                            },
                                                            isActive: true
                                                      })
                                                      .exec()

                                                let activityQuizList = ActivityQuizModel.find({
                                                            bookId: chapterData.bookId,
                                                            chapterId,
                                                            isPublished: true,
                                                            isActive: true
                                                      })
                                                      .exec()

                                                Promise.all([topics, exercisesExists, activityQuizList])
                                                      .then(promiseData => {

                                                            console.log(promiseData);

                                                            let topicDataList = [];
                                                            let quizDataList = [];

                                                            if (promiseData[0].length > 0) {

                                                                  topicDataList = promiseData[0].map(topic => {
                                                                        return {
                                                                              topicId: topic._id,
                                                                              topicName: topic.topicName,
                                                                              pageNo: topic.pageNo,
                                                                              activityCompletedStauts: "false"
                                                                        }
                                                                  });
                                                            }

                                                            if (promiseData[2]) {

                                                                  quizDataList = promiseData[2].map(quiz => {

                                                                        return {
                                                                              quizId: quiz._id,
                                                                              pageNo: quiz.pageNo,
                                                                              activityCompletedStauts: quiz.attemptedUsers ? quiz.attemptedUsers.indexOf(String(userId)) == -1 ? "false" : "true" : "false"
                                                                        }

                                                                  })
                                                            }

                                                            return res.status(200).json({
                                                                  statusCode: "1",
                                                                  topicList: topicDataList,
                                                                  quizList: quizDataList,
                                                                  chapterUrl: promiseData[0][0].ncertChapterUrl,
                                                                  exercisesExists: promiseData[1] ? true : false,
                                                                  message: "Successful..!!"
                                                            });

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

module.exports = SubjectBookChapterList