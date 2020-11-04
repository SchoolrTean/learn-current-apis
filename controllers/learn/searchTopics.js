const UserModel = require('../../models/user/authentication/userModel');
const TopicModel = require('../../models/admin/learn/academic/topicsModel');


const searchTopics = (req, res) => {

      if (req.body.userId && req.body.searchQuery) {

            let userId = req.body.userId;
            let searchQuery = req.body.searchQuery.toLowerCase();

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              TopicModel.find({
                                          syllabusId: userRegistered.syllabusId,
                                          mediumId: userRegistered.mediumId,
                                          gradeId: userRegistered.gradeId,
                                          searchableTopicName: {
                                                $regex: '.*' + searchQuery + '.*'
                                          },
                                          isActive: true
                                    }).exec()
                                    .then(topics => {

                                          if (topics.length > 0) {

                                                let topicList = topics.map(topic => {
                                                      return {
                                                            topicId: topic._id,
                                                            chapterId: topic.chapterId,
                                                            topicName: topic.topicName
                                                      }
                                                });

                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      topicList,
                                                      message: "Successful..!!"
                                                });


                                          } else {
                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      topicList: [],
                                                      chapterUrl: "",
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

module.exports = searchTopics