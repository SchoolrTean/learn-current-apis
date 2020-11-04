const mongoose = require('mongoose');

const UserModel = require('../../models/user/authentication/userModel');
const ChapterModel = require('../../models/admin/learn/academic/chaptersModel');

const TestModel = require('../../models/admin/learn/academic/test/testModel');
const TestQuestionModel = require('../../models/admin/learn/academic/test/testQuestionsModel');
const TestResultSavedModel = require('../../models/user/learn/academic/testResultUserAnswerModel');

const SaveTestResult = (req, res) => {

      if (req.body.userId && req.body.chapterId && req.body.testId && req.body.questionIds && req.body.answers && (req.body.questionIds.split('%-%').length == req.body.answers.split('%-%').length && req.body.questionIds.split('%-%').length > 0)) {

            let userId = req.body.userId;
            let chapterId = req.body.chapterId;
            let topicId = req.body.topicId;
            let testId = req.body.testId;

            let questionIdList = req.body.questionIds.split('%-%');
            let answersList = req.body.answers.split('%-%');

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
                                                let testModelQuery = {
                                                      chapterId,
                                                      isActive: true
                                                }

                                                if (topicId) {
                                                      testModelQuery.topicId = topicId;
                                                }

                                                TestModel.find(testModelQuery)
                                                      .sort({
                                                            _id: 1
                                                      })
                                                      .exec()
                                                      .then(chapterTests => {

                                                            //Will get all Chapter Test
                                                            console.log(chapterTests);

                                                            if (chapterTests.length > 0) {

                                                                  //Selected Test Questions
                                                                  let TestQuestions = TestQuestionModel.find({
                                                                        testId,
                                                                        isActive: true
                                                                  }).exec()

                                                                  //Chapter Test Last Submitted Results
                                                                  let TestResults = TestResultSavedModel.find({
                                                                        chapterId,
                                                                        userId,
                                                                        latestFlag: true,
                                                                        isActive: true
                                                                  }).exec()


                                                                  Promise.all([TestQuestions, TestResults])
                                                                        .then(async result => {

                                                                              console.log(result);

                                                                              let chapterWiseTestsListWithCompletedPercentage = [];
                                                                              let selectedTestQuestionList = [];
                                                                              let selectedTestTotalQuestionCount = 0;
                                                                              let selectedTestCorrectAnswerCount = 0;
                                                                              let selectedTestWrongAnswerCount = 0;
                                                                              let topicId = "";

                                                                              let totalTopicTestQuestionsCount = 0;

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
                                                                                          message: "Access Denied..!!"
                                                                                    });

                                                                              } else {

                                                                                    selectedTestQuestionList = result[0].map(questionData => {

                                                                                          selectedTestTotalQuestionCount = questionData.subQuestions && questionData.subQuestions.length == 0 ? selectedTestTotalQuestionCount + 1 : selectedTestTotalQuestionCount;

                                                                                          let checkAnsweredIndex = questionIdList.indexOf(String(questionData._id))
                                                                                          let userAnswered = "0"
                                                                                          let subQuestionList = [];

                                                                                          if (checkAnsweredIndex != -1) {
                                                                                                userAnswered = answersList[checkAnsweredIndex];
                                                                                                if (answersList[checkAnsweredIndex] == questionData.answer) {
                                                                                                      selectedTestCorrectAnswerCount += 1;
                                                                                                } else {
                                                                                                      selectedTestWrongAnswerCount += 1;
                                                                                                }
                                                                                          }

                                                                                          if (questionData.subQuestions.length > 0) {

                                                                                                subQuestionList = questionData.subQuestions.map(subQuestionData => {

                                                                                                      selectedTestTotalQuestionCount += 1;

                                                                                                      let checkAnsweredIndex = questionIdList.indexOf(String(subQuestionData._id))
                                                                                                      let userAnswered = "0"

                                                                                                      if (checkAnsweredIndex != -1) {
                                                                                                            userAnswered = answersList[checkAnsweredIndex];
                                                                                                            if (answersList[checkAnsweredIndex] == subQuestionData.answer) {
                                                                                                                  selectedTestCorrectAnswerCount += 1;
                                                                                                            } else {
                                                                                                                  selectedTestWrongAnswerCount += 1;
                                                                                                            }
                                                                                                      }


                                                                                                      return {
                                                                                                            questionId: subQuestionData._id,
                                                                                                            questionType: subQuestionData.questionType,
                                                                                                            questionNo: subQuestionData.questionNo ? subQuestionData.questionNo : "",
                                                                                                            question: subQuestionData.question ? subQuestionData.question : [],
                                                                                                            questionUrls: subQuestionData.questionUrls ? subQuestionData.questionUrls : [],
                                                                                                            options: subQuestionData.options ? subQuestionData.options : [],
                                                                                                            answer: subQuestionData.answer ? subQuestionData.answer : "",
                                                                                                            subQuestions: [],
                                                                                                            userAnswer: userAnswered
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
                                                                                                userAnswer: userAnswered
                                                                                          }

                                                                                    });

                                                                                    console.log("selectedTestQuestionList");

                                                                                    console.log(selectedTestQuestionList);

                                                                                    if (result[1].length == 0) {

                                                                                          for (let index = 0; index < chapterTests.length; index++) {
                                                                                                const test = chapterTests[index];

                                                                                                totalTopicTestQuestionsCount += test.totalTestQuestionsCount;

                                                                                                //If Test Id matches with selected TestId 
                                                                                                if (String(test._id) == String(testId)) {

                                                                                                      selectedTest.testId = test._id;
                                                                                                      selectedTest.testName = test.testName;
                                                                                                      topicId = test.topicId;

                                                                                                      if (selectedTestCorrectAnswerCount + selectedTestWrongAnswerCount == selectedTestTotalQuestionCount) {

                                                                                                            let correctAnswerPercentageCalculation = Math.round((selectedTestCorrectAnswerCount / selectedTestTotalQuestionCount) * 100);
                                                                                                            let wrongAnswerPercentageCalculation = 100 - correctAnswerPercentageCalculation;

                                                                                                            chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                                  testId: test._id,
                                                                                                                  testName: test.testName,
                                                                                                                  correctPercentage: correctAnswerPercentageCalculation,
                                                                                                                  wrongPercentage: wrongAnswerPercentageCalculation,
                                                                                                            })

                                                                                                            selectedTest.correctPercentage = String(correctAnswerPercentageCalculation);
                                                                                                            selectedTest.wrongPercentage = String(wrongAnswerPercentageCalculation);

                                                                                                      } else {

                                                                                                            let correctAnswerPercentageCalculation = Math.round((selectedTestCorrectAnswerCount / selectedTestTotalQuestionCount) * 100);
                                                                                                            let wrongAnswerPercentageCalculation = Math.round((selectedTestWrongAnswerCount / selectedTestTotalQuestionCount) * 100);

                                                                                                            chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                                  testId: test._id,
                                                                                                                  testName: test.testName,
                                                                                                                  correctPercentage: correctAnswerPercentageCalculation,
                                                                                                                  wrongPercentage: wrongAnswerPercentageCalculation,
                                                                                                            })

                                                                                                            selectedTest.correctPercentage = String(correctAnswerPercentageCalculation);
                                                                                                            selectedTest.wrongPercentage = String(wrongAnswerPercentageCalculation);

                                                                                                      }

                                                                                                } else {
                                                                                                      chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                            testId: test._id,
                                                                                                            testName: test.testName,
                                                                                                            correctPercentage: '0',
                                                                                                            wrongPercentage: '0',
                                                                                                      })
                                                                                                }
                                                                                          }

                                                                                    } else {

                                                                                          let TestResultIdListForComparison = result[1].map(testResult => String(testResult.testId))

                                                                                          for (let index = 0; index < chapterTests.length; index++) {
                                                                                                const test = chapterTests[index];

                                                                                                totalTopicTestQuestionsCount += test.totalTestQuestionsCount;

                                                                                                const findTestMatchedRecordIndex = TestResultIdListForComparison.indexOf(String(test._id))

                                                                                                if (String(testId) == String(test._id)) {

                                                                                                      console.log("In");
                                                                                                      selectedTest.testId = test._id;
                                                                                                      selectedTest.testName = test.testName;
                                                                                                      topicId = test.topicId;

                                                                                                      if (selectedTestCorrectAnswerCount + selectedTestWrongAnswerCount == selectedTestTotalQuestionCount) {

                                                                                                            let correctAnswerPercentageCalculation = Math.round((selectedTestCorrectAnswerCount / selectedTestTotalQuestionCount) * 100);
                                                                                                            let wrongAnswerPercentageCalculation = 100 - correctAnswerPercentageCalculation;

                                                                                                            chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                                  testId: test._id,
                                                                                                                  testName: test.testName,
                                                                                                                  correctPercentage: correctAnswerPercentageCalculation,
                                                                                                                  wrongPercentage: wrongAnswerPercentageCalculation,
                                                                                                            })

                                                                                                            selectedTest.correctPercentage = String(correctAnswerPercentageCalculation);
                                                                                                            selectedTest.wrongPercentage = String(wrongAnswerPercentageCalculation);

                                                                                                      } else {

                                                                                                            let correctAnswerPercentageCalculation = Math.round((selectedTestCorrectAnswerCount / selectedTestTotalQuestionCount) * 100);
                                                                                                            let wrongAnswerPercentageCalculation = Math.round((selectedTestWrongAnswerCount / selectedTestTotalQuestionCount) * 100);

                                                                                                            chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                                  testId: test._id,
                                                                                                                  testName: test.testName,
                                                                                                                  correctPercentage: correctAnswerPercentageCalculation,
                                                                                                                  wrongPercentage: wrongAnswerPercentageCalculation,
                                                                                                            })

                                                                                                            selectedTest.correctPercentage = String(correctAnswerPercentageCalculation);
                                                                                                            selectedTest.wrongPercentage = String(wrongAnswerPercentageCalculation);

                                                                                                      }

                                                                                                } else if (findTestMatchedRecordIndex == -1) {

                                                                                                      chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                            testId: test._id,
                                                                                                            testName: test.testName,
                                                                                                            correctPercentage: '0',
                                                                                                            wrongPercentage: '0',
                                                                                                      })

                                                                                                } else {

                                                                                                      chapterWiseTestsListWithCompletedPercentage.push({
                                                                                                            testId: test._id,
                                                                                                            testName: test.testName,
                                                                                                            correctPercentage: result[1][findTestMatchedRecordIndex].correctAnswerPercentage,
                                                                                                            wrongPercentage: result[1][findTestMatchedRecordIndex].wrongAnswersPercentage,
                                                                                                      })
                                                                                                }

                                                                                          }

                                                                                    }

                                                                              }

                                                                              console.log("selectedTestTotalQuestionCount");
                                                                              console.log(selectedTestTotalQuestionCount);
                                                                              console.log("selectedTestCorrectAnswerCount");
                                                                              console.log(selectedTestCorrectAnswerCount);
                                                                              console.log("selectedTestWrongAnswerCount");
                                                                              console.log(selectedTestWrongAnswerCount);

                                                                              const SaveNewTestResult = new TestResultSavedModel({
                                                                                    _id: new mongoose.Types.ObjectId(),
                                                                                    subjectId: chapterData.subjectId,
                                                                                    bookId: chapterData.bookId,
                                                                                    chapterId,
                                                                                    testId,
                                                                                    userId,
                                                                                    correctAnswerPercentage: selectedTest.correctPercentage,
                                                                                    wrongAnswersPercentage: selectedTest.wrongPercentage,
                                                                                    latestFlag: true
                                                                              })

                                                                              if (topicId) {
                                                                                    SaveNewTestResult.topicId = topicId;
                                                                              }

                                                                              await TestResultSavedModel.updateOne({
                                                                                          testId,
                                                                                          userId,
                                                                                          latestFlag: true
                                                                                    }, {
                                                                                          $set: {
                                                                                                latestFlag: false
                                                                                          }
                                                                                    }).exec()
                                                                                    .then(testResult => {
                                                                                          
                                                                                          if (testResult.ok == 1) {

                                                                                                SaveNewTestResult.save()
                                                                                                      .then(testresultSavedData => {

                                                                                                            if (testresultSavedData) {
                                                                                                                  
                                                                                                                  selectedTest.lastSavedDate = testresultSavedData.date

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
                                                                                                                  
                                                                                                            } else {

                                                                                                                  return res.status(200).json({
                                                                                                                        statusCode: "0",
                                                                                                                        message: "Something went wrong. Please try again..!!"
                                                                                                                  });
                                                                                                                  
                                                                                                            }

                                                                                                      })

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

                                                                                    })

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
                                                                        message: "No Tests..!!"
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

module.exports = SaveTestResult