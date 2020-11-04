const UserModel = require('../../models/user/authentication/userModel');
const ChapterModel = require('../../models/admin/learn/academic/chaptersModel');

const TestModel = require('../../models/admin/learn/academic/test/testModel');
const TestQuestionModel = require('../../models/admin/learn/academic/test/testQuestionsModel');
// const TestResultSavedModel = require('../../models/testResultUserAnswerModel');



const TestRevision = (req, res) => {

      if (req.params.userId && req.params.bookId) {

            let userId = req.params.userId;
            let bookId = req.params.bookId;
            let chapterId = req.params.chapterId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              let Query = {
                                    bookId,
                                    isActive: true
                              }

                              if (chapterId) {
                                    Query.chapterId = chapterId;
                              }

                              ChapterModel.findOne(Query)
                                    .exec()
                                    .then(chapterData => {

                                          if (chapterData) {

                                                chapterId = chapterData._id;

                                                TestModel.find({
                                                            chapterId,
                                                            isActive: true
                                                      })
                                                      .sort({
                                                            _id: 1
                                                      })
                                                      .exec()
                                                      .then(chapterTests => {

                                                            console.log(chapterTests);

                                                            //Will get all Chapter Test
                                                            if (chapterTests.length > 0) {

                                                                  let TestWiseQuestions = [];
                                                                  let TestNames = [];

                                                                  for (let index = 0; index < chapterTests.length; index++) {
                                                                        const chapterTest = chapterTests[index];

                                                                        TestNames.push(chapterTest.testName)

                                                                        let TestQuestions = TestQuestionModel.find({
                                                                              testId: chapterTest._id,
                                                                              isActive: true
                                                                        }).exec()

                                                                        TestWiseQuestions.push(TestQuestions);
                                                                  }

                                                                  Promise.all(TestWiseQuestions)
                                                                        .then(TestWiseQuestionPromiseData => {

                                                                              if (TestWiseQuestionPromiseData.length > 0) {

                                                                                    let TestWiseQuestionDataList = [];

                                                                                    for (let index = 0; index < TestWiseQuestionPromiseData.length; index++) {
                                                                                          const testQuestionList = TestWiseQuestionPromiseData[index];

                                                                                          if (testQuestionList.length > 0) {

                                                                                                let QuestionList = testQuestionList.map(questionData => {

                                                                                                      let subQuestionList = [];
                                                                                                   
                                                                                                      if (questionData.subQuestions.length > 0) {

                                                                                                            subQuestionList = questionData.subQuestions.map(subQuestionData => {

                                                                                                                  selectedTestTotalQuestionCount += 1;

                                                                                                                  return {
                                                                                                                        questionId: subQuestionData._id,
                                                                                                                        questionType: subQuestionData.questionType,
                                                                                                                        questionNo: subQuestionData.questionNo ? subQuestionData.questionNo : "",
                                                                                                                        question: subQuestionData.question ? subQuestionData.question : [],
                                                                                                                        questionUrls: subQuestionData.questionUrls ? subQuestionData.questionUrls : [],
                                                                                                                        options: subQuestionData.options ? subQuestionData.options : [],
                                                                                                                        answer: subQuestionData.answer ? subQuestionData.answer : "",
                                                                                                                        subQuestions: [],
                                                                                                                  }

                                                                                                            });

                                                                                                      }

                                                                                                      return {
                                                                                                            questionId: questionData._id,
                                                                                                            questionType: questionData.questionType,
                                                                                                            questionNo: questionData.questionNo ? questionData.questionNo : "",
                                                                                                            question: questionData.question ? questionData.question : [],
                                                                                                            questionUrls: questionData.questionUrls ? questionData.questionUrls : [],
                                                                                                            options: questionData.options ? questionData.options : [],
                                                                                                            answer: questionData.answer ? questionData.answer : "",
                                                                                                            subQuestions: subQuestionList,
                                                                                                      }

                                                                                                });

                                                                                                TestWiseQuestionDataList.push({
                                                                                                      testName: TestNames[index],
                                                                                                      questions: QuestionList
                                                                                                })

                                                                                          }

                                                                                    }

                                                                                    return res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          testQuestions: TestWiseQuestionDataList,
                                                                                          message: "No Exercises..!!"
                                                                                    });

                                                                              } else {
                                                                                    return res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "No Test Questions..!!"
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
                                                                        message: "No Exercises..!!"
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

module.exports = TestRevision