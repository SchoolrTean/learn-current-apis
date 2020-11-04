const mongoose = require('mongoose');

const UserModel = require('../../../models/user/authentication/userModel');
const ChapterModel = require('../../../models/admin/learn/academic/chaptersModel');
const TopicModel = require('../../../models/admin/learn/academic/topicsModel');

const UserTopicRatingModel = require('../../../models/user/learn/academic/userTopicSelfAssessModel');


const SaveTopicRating = (req, res) => {

      if (req.body.userId && req.body.topicId && req.body.ratings.split('%-%').length == 4) {

            let userId = req.body.userId;
            let topicId = req.body.topicId;
            let ratings = req.body.ratings;

            let splitedRatings = ratings.split('%-%')

            let percentageCalculation = 0;
            splitedRatings.forEach(ratingData => {
                  percentageCalculation += ratingData != 0 ? Math.round((ratingData / 20) * 100) : 0;
            });

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              TopicModel.findOne({
                                          _id: topicId,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(topicData => {

                                          if (topicData) {

                                                UserTopicRatingModel.findOne({
                                                            topicId,
                                                            userId,
                                                            isActive: true
                                                      })
                                                      .exec()
                                                      .then(selfAssessmentTaken => {

                                                            if (selfAssessmentTaken) {

                                                                  UserTopicRatingModel.updateOne({
                                                                              topicId,
                                                                              userId,
                                                                              isActive: true
                                                                        }, {
                                                                              $set: {
                                                                                    selfAssessmentRating: splitedRatings,
                                                                                    ratedPercentage: percentageCalculation,
                                                                              }

                                                                        })
                                                                        .then(saved => {

                                                                              if (saved) {
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

                                                                  const SaveSelfAssessment = new UserTopicRatingModel({
                                                                        _id: new mongoose.Types.ObjectId(),
                                                                        bookId: topicData.bookId,
                                                                        chapterId: topicData.chapterId,
                                                                        topicId,
                                                                        userId,
                                                                        selfAssessmentRating: splitedRatings,
                                                                        ratedPercentage: percentageCalculation,
                                                                  });

                                                                  SaveSelfAssessment.save()
                                                                        .then(saved => {

                                                                              if (saved) {
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

module.exports = SaveTopicRating