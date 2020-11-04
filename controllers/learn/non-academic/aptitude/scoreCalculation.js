const CourseTopicModel = require('../../../../models/admin/learn/non-academic/course/courseTopicModel');
const UserTestResultModel = require('../../../../models/user/learn/non-academic/aptitude/userTestResultModel');


exports.courseTopicScore = (topicId, userId) => {

      return new Promise((resolve, reject) => {

            try {

                  UserTestResultModel.findOne({
                              courseTopicId: topicId,
                              userId,
                              latestFlag: true,
                              isActive: true
                        })
                        .then(lastAttemptedScore => {
                              resolve(lastAttemptedScore ? Math.round(lastAttemptedScore.correctAnswerPercentage) : 0);
                        })
                        .catch(err => {
                              console.log(err);
                              reject(0)
                        })

            } catch (error) {
                  console.log(error);
                  reject(0)
            }

      })

}


exports.courseScore = (courseId, userId) => {

      return new Promise((resolve, reject) => {

            try {

                  CourseTopicModel.find({
                              courseId,
                              isPublished: true,
                              isActive: true
                        })
                        .exec()
                        .then(async courseTopicList => {

                              if (courseTopicList.length > 0) {

                                    let coursePercentage = 0;

                                    for (let index = 0; index < courseTopicList.length; index++) {
                                          const topic = courseTopicList[index];

                                          let lastAttemptedScore = await UserTestResultModel.findOne({
                                                courseTopicId: topic._id,
                                                userId,
                                                latestFlag: true,
                                                isActive: true
                                          })

                                          console.log(lastAttemptedScore);

                                          coursePercentage += parseInt(lastAttemptedScore ? lastAttemptedScore.correctAnswerPercentage ? lastAttemptedScore.correctAnswerPercentage : 0 : 0)

                                    }

                                    resolve(courseTopicList.length > 0 ? coursePercentage != 0 ? Math.round(coursePercentage / courseTopicList.length) : 0 : 0)

                              } else {
                                    resolve(0)
                              }

                        })
                        .catch(err => {
                              console.log(err);
                              reject(0)
                        })

            } catch (error) {
                  console.log(error);
                  reject(0)
            }
      })

}