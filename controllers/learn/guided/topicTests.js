const UserModel = require('../../../models/user/authentication/userModel');
const ChapterModel = require('../../../models/admin/learn/academic/chaptersModel');

const TestModel = require('../../../models/admin/learn/academic/test/testModel');
const TestQuestionModel = require('../../../models/admin/learn/academic/test/testQuestionsModel');
const TestResultSavedModel = require('../../../models/user/learn/academic/testResultUserAnswerModel');

const ChapterTests = (req, res) => {

      if (req.params.userId && req.params.chapterId && req.params.topicId) {

            let userId = req.params.userId;
            let chapterId = req.params.chapterId;
            let topicId = req.params.topicId;
            let testId = req.params.testId;

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

                                                TestModel.find({
                                                            chapterId,
                                                            topicId,
                                                            totalTestQuestionsCount: {
                                                                  $gt :0
                                                            },
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

                                                                  if (!testId) {
                                                                        testId = chapterTests[0]._id;
                                                                  }

                                                                  console.log(testId + " - testId");

                                                                  //Selected Test Questions
                                                                  let TestQuestions = TestQuestionModel.find({
                                                                        testId,
                                                                        isActive: true
                                                                  }).exec()

                                                                  //Chapter Test Results
                                                                  let TestResults = TestResultSavedModel.find({
                                                                        chapterId,
                                                                        userId,
                                                                        latestFlag: true,
                                                                        isActive: true
                                                                  }).exec()


                                                                  Promise.all([TestQuestions, TestResults])
                                                                        .then(result => {

                                                                              console.log(result);

                                                                              let chapterWiseTestsListWithCompletedPercentage = [];
                                                                              let selectedTestQuestionList = [];
                                                                              let selectedTestTotalQuestionCount = 0;

                                                                              let totalTopicTestQuestionsCount = 0

                                                                              let selectedTest = {
                                                                                    testId: '',
                                                                                    testName: '',
                                                                                    correctPercentage: '0',
                                                                                    wrongPercentage: '0',
                                                                                    lastSavedDate: ""
                                                                              }



                                                                              if (result[0].length == 0) {

                                                                                    return res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "No Test Questions..!!"
                                                                                    });

                                                                              } else {

                                                                                    //No Test Results Found
                                                                                    if (result[1].length == 0) {

                                                                                          for (let index = 0; index < chapterTests.length; index++) {
                                                                                                const test = chapterTests[index];

                                                                                                totalTopicTestQuestionsCount += test.totalTestQuestionsCount;

                                                                                                if (testId == test._id) {
                                                                                                      selectedTest.testId = test._id;
                                                                                                      selectedTest.testName = test.testName;
                                                                                                }

                                                                                                chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                      testId: test._id,
                                                                                                      testName: test.testName,
                                                                                                      correctPercentage: '0',
                                                                                                      wrongPercentage: '0',
                                                                                                })

                                                                                          }

                                                                                    } else {

                                                                                          //Convert Result Test to array of Ids
                                                                                          let resultTestIdList = result[1].map(testResult => String(testResult.testId))

                                                                                          for (let index = 0; index < chapterTests.length; index++) {
                                                                                                const test = chapterTests[index];

                                                                                                totalTopicTestQuestionsCount += test.totalTestQuestionsCount;

                                                                                                //Check Result for this test exists
                                                                                                const findTestSavedMatchedRecordIndex = resultTestIdList.indexOf(String(test._id))

                                                                                                console.log(findTestSavedMatchedRecordIndex + "- findTestSavedMatchedRecordIndex" + test._id)
                                                                                                console.log(resultTestIdList)

                                                                                                //Test Not Saved
                                                                                                if (findTestSavedMatchedRecordIndex == -1) {

                                                                                                      if (testId == test._id) {
                                                                                                            selectedTest.testId = test._id;
                                                                                                            selectedTest.testName = test.testName;
                                                                                                      }

                                                                                                      chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                            testId: test._id,
                                                                                                            testName: test.testName,
                                                                                                            correctPercentage: '0',
                                                                                                            wrongPercentage: '0',
                                                                                                      })

                                                                                                } else {

                                                                                                      if (testId == test._id) {
                                                                                                            selectedTest.testId = test._id;
                                                                                                            selectedTest.testName = test.testName;
                                                                                                            selectedTest.correctPercentage = result[1][findTestSavedMatchedRecordIndex].correctAnswerPercentage;
                                                                                                            selectedTest.wrongPercentage = result[1][findTestSavedMatchedRecordIndex].wrongAnswersPercentage;
                                                                                                            selectedTest.lastSavedDate = result[1][findTestSavedMatchedRecordIndex].date;
                                                                                                      }

                                                                                                      chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                            testId: test._id,
                                                                                                            testName: test.testName,
                                                                                                            correctPercentage: result[1][findTestSavedMatchedRecordIndex].correctAnswerPercentage,
                                                                                                            wrongPercentage: result[1][findTestSavedMatchedRecordIndex].wrongAnswersPercentage,
                                                                                                      })
                                                                                                }

                                                                                          }

                                                                                    }

                                                                                    selectedTestQuestionList = result[0].map(questionData => {

                                                                                          let subQuestionList = [];
                                                                                          // selectedTestTotalQuestionCount += 1;
                                                                                          selectedTestTotalQuestionCount = questionData.subQuestions && questionData.subQuestions.length == 0 ? selectedTestTotalQuestionCount + 1 : selectedTestTotalQuestionCount;

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
                                                                                                            userAnswer: ""
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
                                                                                                userAnswer: ""
                                                                                          }

                                                                                    });



                                                                              }

                                                                              return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    chapterDetails: {
                                                                                          chapterName: chapterData.chapterName,
                                                                                          chapterNumber: chapterData.chapterNumber ? chapterData.chapterNumber : "",
                                                                                          chapterExercisesCount: chapterTests.length,
                                                                                          totalChapterQuestionCount: totalTopicTestQuestionsCount
                                                                                    },
                                                                                    selectedTestDeatils: selectedTest,
                                                                                    testListWithCompletedPercentage: chapterWiseTestsListWithCompletedPercentage,
                                                                                    questionList: selectedTestQuestionList,
                                                                                    message: "Data Found..!!"
                                                                              });

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

module.exports = ChapterTests