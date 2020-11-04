const NewAnswers = require('../newAnswersExistsController');
const UserAnswer = require('../getUserAnswer');

//Customize each record as per the data that need to be sent
module.exports = (questionList, teacherId, MindBoxOpendTimestamp) => {

      return new Promise(async (resolve, reject) => {

            try {

                  let questionListArray = new Array();

                  if (questionList.length > 0) {

                        for (let index = 0; index < questionList.length; index++) {

                              const Question = questionList[index];

                              let groupName = Question.groupId.grade ? Question.groupId.grade + ' - ' + Question.groupId.section : Question.groupId.groupName;

                              let QuestionObj = {};

                              if (Question.questionDeletedStatus && Question.questionDeletedStatus == true) {

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

                                          hasReported: "false",
                                          canReport: "false",
                                          likeCount: 0,

                                          questionDeletedStatus: String(Question.questionDeletedStatus),
                                          questionDeletedMessage: "You deleted this question ",
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

                                          userAnswer: "",
                                          userAnswerUrls: [],
                                          userAnswerCorrectStatus: "",

                                          correctAnswer: Question.multipleChoiceAnswers ? String(Question.selectedCorrectAnswer) : Question.answer ? String(Question.answer) : "",
                                          correctAnswerUrls: [],
                                          correctAnswerUserName: "",
                                          correctAnswerProfilePic: "",

                                          answerCount: Question.answerCount,
                                          correctAnswerCount: Question.correctAnswerCount,
                                          newAnswersDot: await NewAnswers.count(Question._id, MindBoxOpendTimestamp) > 0 ? "true" : "false",

                                          hasReported: String(Question.reported),
                                          canReport: "false",
                                          likeCount: Question.likedUsers ? Question.likedUsers.length : 0,
                                          hasLiked: Question.likedUsers ? Question.likedUsers.indexOf(String(teacherId)) != -1 ? "true" : "false" : "false",

                                          questionDeletedStatus: "false",
                                          questionDeletedMessage: "",
                                          type: "MSG",
                                          date: Question.date

                                    };

                                    //same user question then mcq will have user answer as correct answer
                                    if (String(Question.userId._id) == String(teacherId) && Question.questionType == '1') {

                                          QuestionObj.userAnswer = String(Question.selectedCorrectAnswer)
                                          QuestionObj.userAnswerUrls = []
                                          QuestionObj.userAnswerCorrectStatus = "true"
                                          
                                    } else {

                                          let UserAnswerData = await UserAnswer(Question._id, teacherId);

                                          if (UserAnswerData) {
                                                if (Question.questionType == '1') {
                                                      QuestionObj.userAnswer = UserAnswerData.answer
                                                      QuestionObj.userAnswerCorrectStatus = String(UserAnswerData.correctAnswerStatus)
                                                } else {
                                                      QuestionObj.userAnswer = UserAnswerData.answer
                                                      QuestionObj.userAnswerUrls = UserAnswerData.answerUrls
                                                      QuestionObj.userAnswerCorrectStatus = String(UserAnswerData.correctAnswerStatus)
                                                }
                                          }



                                    }


                                    console.log(QuestionObj)

                              }

                              questionListArray.push(QuestionObj);

                        }

                        resolve(questionListArray);

                  } else {

                        resolve(questionListArray);

                  }

            } catch (error) {

                  reject(0);

            }

      })

}