const UserModel = require('../../../../models/userModel');


const CourseTopicModel = require('../../../../models/admin/learn/non-academic/course/courseTopicModel');



const CourseTopics = (req, res) => {

      if (req.params.userId && req.params.courseId) {

            let userId = req.params.userId;
            let courseId = req.params.courseId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              CourseTopicModel.find({
                                          courseId,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(async courseTopicList => {

                                          console.log(courseTopicList);

                                          if (courseTopicList.length > 0) {

                                                let courseTopicDataList = [];

                                                for (let index = 0; index < courseTopicList.length; index++) {
                                                      const topic = courseTopicList[index];

                                                      courseTopicDataList.push({
                                                            topicId: topic._id,
                                                            topicName: topic.courseTopicName ? topic.courseTopicName : "",
                                                            topicColor: topic.courseTopicColor ? topic.courseTopicColor : "",
                                                            topicText: topic.courseTopicText ? topic.courseTopicText : "",
                                                            topicImageUrl: topic.courseTopicImageUrl ? topic.courseTopicImageUrl : "",
                                                            rating: 0
                                                      })
                                                }


                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      courseTopicList: courseTopicDataList,
                                                      message: "Data Found...!!"
                                                });

                                          } else {

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      courseTopicList: [],
                                                      message: "No Record Found...!!"
                                                });

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          })
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

module.exports = CourseTopics