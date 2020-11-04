const UserModel = require('../../../models/user/authentication/userModel');
const ChapterModel = require('../../../models/admin/learn/academic/chaptersModel');
const TopicModel = require('../../../models/admin/learn/academic/topicsModel');

const ExerciseModel = require('../../../models/admin/learn/academic/exercise/exerciseModel')
const ActivityQuizModel = require('../../../models/admin/learn/academic/activityQuiz/activityQuizModel')
const UserTopicSelfAssessModel = require('../../../models/user/learn/academic/userTopicSelfAssessModel')
const TestModel = require('../../../models/admin/learn/academic/test/testModel')



const TopicDetails = (req, res) => {

      if (req.params.userId && req.params.chapterId && req.params.topicId) {

            let userId = req.params.userId;
            let chapterId = req.params.chapterId;
            let topicId = req.params.topicId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  })
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              ChapterModel.findOne({
                                          _id: chapterId,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(chapterData => {

                                          if (chapterData) {

                                                TopicModel.findOne({
                                                            _id: topicId,
                                                            chapterId,
                                                            isActive: true
                                                      }).exec()
                                                      .then(topicData => {

                                                            if (topicData) {

                                                                  let ExerciseData = ExerciseModel.findOne({
                                                                        topicId,
                                                                        chapterId,
                                                                        isActive: true
                                                                  }).exec()

                                                                  let TestData = TestModel.findOne({
                                                                        topicId,
                                                                        chapterId,
                                                                        isActive: true
                                                                  }).exec()

                                                                  let SelfAssessmentData = UserTopicSelfAssessModel.findOne({
                                                                        chapterId,
                                                                        topicId,
                                                                        userId,
                                                                        isActive: true
                                                                  }).exec()

                                                                  Promise.all([ExerciseData, TestData, SelfAssessmentData])
                                                                        .then(promiseData => {

                                                                              let topicPath = [];

                                                                              topicPath.push({
                                                                                    pathImage: "",
                                                                                    pathName: "Concept",
                                                                                    chapterUrl: topicData.ncertChapterUrl,
                                                                                    pageNo: topicData.pageNo,
                                                                                    exists: "true"
                                                                              })

                                                                              topicPath.push({
                                                                                    pathImage: "",
                                                                                    pathName: "Videos",
                                                                                    chapterUrl: "",
                                                                                    pageNo: "",
                                                                                    exists: "false"
                                                                              })

                                                                              if (promiseData[0]) {
                                                                                    topicPath.push({
                                                                                          pathImage: "",
                                                                                          pathName: "Exercises",
                                                                                          chapterUrl: "",
                                                                                          pageNo: "",
                                                                                          exists: "true"
                                                                                    })
                                                                              }

                                                                              if (promiseData[1]) {
                                                                                    topicPath.push({
                                                                                          pathImage: "",
                                                                                          pathName: "Tests",
                                                                                          chapterUrl: "",
                                                                                          pageNo: "",
                                                                                          exists: "true"
                                                                                    })
                                                                              }

                                                                              ActivityQuizModel.find({
                                                                                          bookId: chapterData.bookId,
                                                                                          chapterId: chapterId,
                                                                                          isPublished: true,
                                                                                          isActive: true
                                                                                    })
                                                                                    .exec()
                                                                                    .then(activityQuizList => {

                                                                                          if (activityQuizList.length > 0) {

                                                                                                let activityQuizDataList = activityQuizList.map(quiz => {

                                                                                                      return {
                                                                                                            quizId: quiz._id,
                                                                                                            pageNo: quiz.pageNo,
                                                                                                            activityCompletedStauts: quiz.attemptedUsers ? quiz.attemptedUsers.indexOf(String(userId)) == -1 ? "false" : "true" : "false"
                                                                                                      }

                                                                                                })

                                                                                                return res.status(200).json({
                                                                                                      statusCode: "1",
                                                                                                      topicPath,
                                                                                                      quizList: activityQuizDataList,
                                                                                                      selfAssessment: promiseData[2] ? promiseData[2].selfAssessmentRating : [0, 0, 0, 0],
                                                                                                      message: "Successful..!!"
                                                                                                });

                                                                                          } else {

                                                                                                return res.status(200).json({
                                                                                                      statusCode: "1",
                                                                                                      topicPath,
                                                                                                      quizList: [],
                                                                                                      selfAssessment: promiseData[2] ? promiseData[2].selfAssessmentRating : [0, 0, 0, 0],
                                                                                                      message: "Successful..!!"
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
                                                                        message: "Access Denied..!!"
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
                                                res.status(200).json({
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

                              res.status(200).json({
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

module.exports = TopicDetails