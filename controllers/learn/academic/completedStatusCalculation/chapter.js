const TopicModel = require('../../../../models/admin/learn/academic/topicsModel');

const ExerciseModel = require('../../../../models/admin/learn/academic/exercise/exerciseModel')
const ExcersiseUserAnswerModel = require('../../../../models/user/learn/academic/exerciseUserAnswerModel');
const SelfAssessmentModel = require('../../../../models/user/learn/academic/userTopicSelfAssessModel');


const ChapterCalculation = (userId, chapterId) => {

      return new Promise((resolve, reject) => {

            try {

                  if (userId && chapterId) {

                        TopicModel.find({
                                    chapterId,
                                    isActive: true
                              }).exec()
                              .then(async topics => {

                                    let ChapterCompletedPercentage = 0;

                                    if (topics.length > 0) {

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

                                                      completedPercentage = totalAnswersCount != 0 ? Math.round((totalAnswersCount / totalQuestions) * 100) : 0;

                                                } else {
                                                      let selfAssessmentRecord = await SelfAssessmentModel.findOne({
                                                            topicId: topic._id,
                                                            userId,
                                                            isActive: true
                                                      })

                                                      completedPercentage = selfAssessmentRecord ? selfAssessmentRecord.ratedPercentage : 0
                                                }

                                                ChapterCompletedPercentage += parseInt(completedPercentage);

                                          }

                                          console.log("ChapterCompletedPercentage")
                                          console.log(ChapterCompletedPercentage)

                                          resolve(ChapterCompletedPercentage != 0 ? Math.round((ChapterCompletedPercentage / (100 * topics.length)) * 100) : 0);

                                    } else {
                                          resolve(ChapterCompletedPercentage);
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    reject(0)
                              });


                  } else {
                        reject(0)
                  }

            } catch (error) {
                  console.log(error);
                  reject(0)
            }

      })

}

module.exports = ChapterCalculation