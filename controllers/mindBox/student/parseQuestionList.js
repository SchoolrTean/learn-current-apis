const UserAnswer = require('../getUserAnswer');
const NewAnswers = require('../newAnswersExistsController');

module.exports = (QuestionList, StudentId, MindBoxOpendTimestamp) => {

      return new Promise(async (resolve, reject) => {

            try {

                  let questionListArray = new Array();

                  //Customize each Question as per the data that need to be sent
                  for (let index = 0; index < QuestionList.length; index++) {

                        const Question = QuestionList[index];

                        let groupName = Question.groupId.grade ? Question.groupId.grade + ' - ' + Question.groupId.section : Question.groupId.groupName;

                        let QuestionObj = "";

                        if ((Question.questionDeletedStatus && Question.questionDeletedStatus == true) || (Question.reported && Question.reported == true)) {

                              QuestionObj = {

                                    id: Question._id,
                                    groupId: Question.groupId._id,
                                    groupName: groupName,

                                    userId: Question.userId._id,
                                    userName: Question.userId.firstName + " " + Question.userId.surName,
                                    profilePic: Question.userId.profilePic ? Question.userId.profilePic : "",
                                    userType: Question.userId.type == 0 ? "Teacher" : "Student",

                                    subjectName: Question.subjectName,
                                    mindBoxCoins: Question.userId.mindBoxCoins,

                                    question: "",
                                    questionUrls: [],

                                    questionType: String(Question.questionType),
                                    multipleChoiceAnswers: [],

                                    userAnswer: "",
                                    userAnswerUrls: [],
                                    userAnswerCorrectStatus: "",

                                    correctAnswer: "",
                                    correctAnswerUrls: [],
                                    correctAnswerUserName: "",
                                    correctAnswerProfilePic: "",

                                    answerCount: 0,
                                    correctAnswerCount: 0,
                                    newAnswersDot: "false",

                                    hasReported: String(Question.reported),
                                    canReport: "false",
                                    likeCount: 0,
                                    hasLiked: "false",

                                    questionDeletedStatus: Question.questionDeletedStatus ? String(Question.questionDeletedStatus) : "false",
                                    questionDeletedMessage: Question.questionDeletedStatus ? Question.questionDeletedByUserId.firstName + " " + Question.questionDeletedByUserId.surName + " has deleted this question" : "",
                                    type: "MSG",
                                    date: Question.date

                              };

                        } else {

                              QuestionObj = {

                                    id: Question._id,
                                    groupId: Question.groupId._id,
                                    groupName: groupName,

                                    userId: Question.userId._id,
                                    userName: Question.userId.firstName + " " + Question.userId.surName,
                                    profilePic: Question.userId.profilePic ? Question.userId.profilePic : "",
                                    userType: Question.userId.type == 0 ? "Teacher" : "Student",

                                    subjectName: Question.subjectName,
                                    mindBoxCoins: Question.userId.mindBoxCoins,

                                    question: Question.question,
                                    questionUrls: Question.questionUrls ? Question.questionUrls : [],

                                    questionType: String(Question.questionType),
                                    multipleChoiceAnswers: Question.multipleChoiceAnswers ? Question.multipleChoiceAnswers.split('%-%') : [],

                                    answerCount: Question.answerCount,
                                    correctAnswerCount: Question.correctAnswerCount,
                                    newAnswersDot: await NewAnswers.count(Question._id, MindBoxOpendTimestamp) > 0 ? "true" : "false",

                                    hasReported: "false",
                                    canReport: (Question.teacherUnreported || Question.reported || Question.correctAnswerCount != 0 || String(Question.userId._id) == String(StudentId)) ? "false" : "true",

                                    likeCount: Question.likedUsers ? Question.likedUsers.length : 0,
                                    hasLiked: Question.likedUsers ? Question.likedUsers.indexOf(String(StudentId)) != -1 ? "true" : "false" : "false",

                                    questionDeletedStatus: "false",
                                    questionDeletedMessage: "",
                                    type: "MSG",
                                    date: Question.date

                              };

                              if (Question.questionType == 1) {

                                    QuestionObj.correctAnswer = String(Question.selectedCorrectAnswer)

                                    QuestionObj.correctAnswerUrls = []
                                    QuestionObj.userAnswerUrls = []

                                    QuestionObj.correctAnswerUserName = "";
                                    QuestionObj.correctAnswerprofilePic = "";

                                    if (String(Question.userId._id) == String(StudentId)) {

                                          QuestionObj.userAnswer = String(Question.selectedCorrectAnswer);
                                          QuestionObj.userAnswerCorrectStatus = "true";

                                    } else {
                                          let userAnswer = await UserAnswer(Question._id, StudentId)

                                          if (userAnswer && typeof userAnswer == "object") {
                                                QuestionObj.userAnswer = String(userAnswer.answer);
                                                QuestionObj.userAnswerCorrectStatus = String(userAnswer.correctAnswerStatus);
                                          } else {
                                                QuestionObj.userAnswer = "";
                                                QuestionObj.userAnswerCorrectStatus = "";
                                          }

                                    }

                              } else {

                                    let userAnswer = await UserAnswer(Question._id, StudentId)

                                    if (userAnswer && typeof userAnswer == "object") {

                                          QuestionObj.userAnswer = userAnswer.answer;
                                          QuestionObj.userAnswerUrls = userAnswer.answerUrls
                                          QuestionObj.userAnswerCorrectStatus = String(userAnswer.correctAnswerStatus);

                                          QuestionObj.correctAnswer = Question.selectedCorrectAnswerId ? Question.selectedCorrectAnswerId.answer : "";
                                          QuestionObj.correctAnswerUrls = Question.selectedCorrectAnswerId ? Question.selectedCorrectAnswerId.answerUrls : [];

                                          QuestionObj.correctAnswerUserName = Question.selectedCorrectAnswerUserId ? Question.selectedCorrectAnswerUserId.firstName + " " + Question.selectedCorrectAnswerUserId.surName : "";
                                          QuestionObj.correctAnswerprofilePic = Question.selectedCorrectAnswerUserId ? Question.selectedCorrectAnswerUserId.profilePic : "";

                                    } else {

                                          QuestionObj.userAnswer = "";
                                          QuestionObj.userAnswerUrls = [];
                                          QuestionObj.userAnswerCorrectStatus = "";

                                          QuestionObj.correctAnswer = Question.selectedCorrectAnswerId ? Question.selectedCorrectAnswerId.answer : "";
                                          QuestionObj.correctAnswerUrls = Question.selectedCorrectAnswerId ? Question.selectedCorrectAnswerId.answerUrls : [];

                                          QuestionObj.correctAnswerUserName = Question.selectedCorrectAnswerUserId ? Question.selectedCorrectAnswerUserId.firstName + " " + Question.selectedCorrectAnswerUserId.surName : "";
                                          QuestionObj.correctAnswerprofilePic = Question.selectedCorrectAnswerUserId ? Question.selectedCorrectAnswerUserId.profilePic : "";

                                    }

                              }

                        }

                        questionListArray.push(QuestionObj);
                  }

                  resolve(questionListArray);

            } catch (error) {
                  reject(0);
            }

      })

}