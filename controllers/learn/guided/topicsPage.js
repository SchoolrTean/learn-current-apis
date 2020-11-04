const UserModel = require('../../../models/user/authentication/userModel');
const ChapterModel = require('../../../models/admin/learn/academic/chaptersModel');
const TopicModel = require('../../../models/admin/learn/academic/topicsModel');

const ExerciseModel = require('../../../models/admin/learn/academic/exercise/exerciseModel')
const ExcersiseUserAnswerModel = require('../../../models/user/learn/academic/exerciseUserAnswerModel');
const ExcersiseUserResultModel = require('../../../models/user/learn/academic/userExerciseResultModel');
const SelfAssessmentModel = require('../../../models/user/learn/academic/userTopicSelfAssessModel')

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

                                                TopicModel.find({
                                                            chapterId,
                                                            isActive: true
                                                      }).exec()
                                                      .then(async topics => {

                                                            console.log(topics);

                                                            if (topics.length > 0) {

                                                                  let topicDataList = [];

                                                                  //Get all topics of path
                                                                  for (let index = 0; index < topics.length; index++) {
                                                                        const topic = topics[index];

                                                                        //total exercises to get total exercise qution count
                                                                        let totalExercises = await ExerciseModel.find({
                                                                                    chapterId,
                                                                                    topicId: topic._id,
                                                                                    isActive: true
                                                                              })
                                                                              .exec()

                                                                        let completedPercentage = 0;

                                                                        if (totalExercises.length > 0) {

                                                                              let topicExcersiseIds = totalExercises.map(exercise => exercise._id)
                                                                              let totalQuestions = 0

                                                                              for (let index = 0; index < totalExercises.length; index++) {
                                                                                    const ex = totalExercises[index];
                                                                                    totalQuestions += ex.totalExerciseQuestionsCount
                                                                              }

                                                                              let totalAnswersCount = await ExcersiseUserAnswerModel.countDocuments({

                                                                                    exerciseId: {
                                                                                          $in: topicExcersiseIds
                                                                                    },
                                                                                    userId,
                                                                                    isActive: true

                                                                              }).exec()

                                                                              completedPercentage = totalAnswersCount != 0 ? Math.round((totalAnswersCount / totalQuestions) * 100) : 0
                                                                              

                                                                              console.log("completedPercentage" + completedPercentage);

                                                                        } else {
                                                                              let selfAssessmentRecord = await SelfAssessmentModel.findOne({
                                                                                    topicId: topic._id,
                                                                                    userId,
                                                                                    isActive: true
                                                                              })

                                                                              completedPercentage = selfAssessmentRecord ? selfAssessmentRecord.ratedPercentage : 0
                                                                        }

                                                                        topicDataList.push({
                                                                              topicId: topic._id,
                                                                              topicName: topic.topicName,
                                                                              completeStatus: String(completedPercentage),
                                                                              pageNo: topic.pageNo,
                                                                        })

                                                                  }


                                                                  // let topicList = topics.map(topic => {

                                                                  //       return {
                                                                  //             topicId: topic._id,
                                                                  //             topicName: topic.topicName,
                                                                  //             completeStatus: 0,
                                                                  //             pageNo: topic.pageNo,
                                                                  //       }

                                                                  // });

                                                                  //Chapter Exercises without topicId
                                                                  ExerciseModel.findOne({
                                                                              chapterId,
                                                                              isActive: true,
                                                                              topicId: {
                                                                                    $exists: false
                                                                              }
                                                                        }).exec()
                                                                        .then(chapterWiseExercisesExists => {

                                                                              // ExcersiseUserResultModel//

                                                                              return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    topicList: topicDataList ? topicDataList : [],
                                                                                    exercisesInPath: chapterWiseExercisesExists ? 1 : 0,
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
                                                                        statusCode: "1",
                                                                        topicList: [],
                                                                        exercisesInPath: "",
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