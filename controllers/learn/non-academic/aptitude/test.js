const mongoose = require('mongoose')

const UserModel = require('../../../../models/user/authentication/userModel');

const CourseTopicModel = require('../../../../models/admin/learn/non-academic/course/courseTopicModel');
const QuestionModel = require('../../../../models/admin/learn/non-academic/course/test/questionsModel');




const AptitudeTestQuestionList = (req, res) => {

      if (req.params.userId && req.params.courseTopicId) {

            let userId = req.params.userId;
            let courseTopicId = req.params.courseTopicId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              CourseTopicModel.findOne({
                                          _id: courseTopicId,
                                          isPublished: true,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(courseTopic => {

                                          if (courseTopic) {

                                                //Selected Test Questions
                                                QuestionModel.aggregate([{
                                                            $match: {
                                                                  courseTopicId: new mongoose.Types.ObjectId(courseTopicId),
                                                                  isActive: true
                                                            }

                                                      }, {
                                                            $sample: {
                                                                  size: 10
                                                            }
                                                      }, {
                                                            $sort: {
                                                                  _id: 1
                                                            }
                                                      }]).exec()
                                                      .then(TestQuestionList => {

                                                            console.log(TestQuestionList);

                                                            let testDurationInSeconds = "150000";

                                                            if (TestQuestionList.length == 0) {

                                                                  return res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "No Questions..!!"
                                                                  });

                                                            } else {

                                                                  let questionNo = 0;

                                                                  let TestQuestionDataList = TestQuestionList.map(questionData => {

                                                                        let subQuestionList = [];

                                                                        if (questionData.subQuestions.length > 0) {

                                                                              subQuestionList = questionData.subQuestions.map(subQuestionData => {

                                                                                    return {
                                                                                          questionId: subQuestionData._id,
                                                                                          questionType: subQuestionData.questionType,
                                                                                          questionNo: ++questionNo,
                                                                                          // questionNo: subQuestionData.questionNo ? subQuestionData.questionNo : "",
                                                                                          question: subQuestionData.question ? subQuestionData.question : [],
                                                                                          questionUrls: subQuestionData.questionUrls ? subQuestionData.questionUrls : [],
                                                                                          options: subQuestionData.options ? subQuestionData.options : [],
                                                                                          answer: subQuestionData.answer ? subQuestionData.answer : "",
                                                                                          // subQuestions: [],
                                                                                          userAnswer: ""
                                                                                    }

                                                                              });

                                                                        }

                                                                        return {
                                                                              questionId: questionData._id,
                                                                              questionType: questionData.questionType,
                                                                              questionNo: ++questionNo,
                                                                              // questionNo: questionData.questionNo ? questionData.questionNo : "",
                                                                              question: questionData.question ? questionData.question : [],
                                                                              questionUrls: questionData.questionUrls ? questionData.questionUrls : [],
                                                                              options: questionData.options ? questionData.options : [],
                                                                              answer: questionData.answer ? questionData.answer : "",
                                                                              subQuestions: subQuestionList,
                                                                              userAnswer: ""
                                                                        }

                                                                  });

                                                                  return res.status(200).json({
                                                                        statusCode: "1",
                                                                        testDuration: testDurationInSeconds,
                                                                        questionList: TestQuestionDataList,
                                                                        message: "Data Found..!!"
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

module.exports = AptitudeTestQuestionList