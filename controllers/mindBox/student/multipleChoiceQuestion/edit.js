const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')



module.exports = (req, res, next) => {

      let questionUrls = new Array();

      if (req.file) {
            questionUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      if (req.params.studentId && req.params.groupId && req.params.questionId && req.body.subjectName && req.body.multipleChoiceAnswers && req.body.multipleChoiceAnswers.split('%-%').length >= 2 && req.body.selectedCorrectAnswer && (req.body.question || questionUrls.length > 0)) {

            let studentId = req.params.studentId;
            let questionId = req.params.questionId;
            let classId = req.params.groupId;
            let subjectName = req.body.subjectName;
            let question = req.body.question;
            let alreadySavedQuestionUrls = req.body.alreadySavedQuestionUrls; // splited with Kamma ,
            let multipleChoiceAnswers = req.body.multipleChoiceAnswers // %-%
            let selectedCorrectAnswer = req.body.selectedCorrectAnswer; //number

            if (alreadySavedQuestionUrls) {
                  let splittedUrls = alreadySavedQuestionUrls.split(',');
                  splittedUrls.forEach(savedUrl => {
                        questionUrls.push(savedUrl);
                  });
            }


            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.list(studentId)
                                    .then(connectedGroupsList => {

                                          if (connectedGroupsList.length > 0) {

                                                MindBoxQuestionModel.findOne({
                                                            _id: questionId,
                                                            userId: studentId,
                                                            groupId : classId,
                                                            // deletedUsers: {
                                                            //       $ne: studentId
                                                            // },
                                                            questionType: 1,
                                                            isActive: true
                                                      })
                                                      .populate('userId', 'type')
                                                      .exec()
                                                      .then(Question => {

                                                            if (Question && Question.questionDeletedStatus == false && Question.reported == false) {

                                                                  MindBoxQuestionModel.updateOne({
                                                                              _id: questionId,
                                                                        }, {
                                                                              $set: {
                                                                                    subjectName,
                                                                                    question,
                                                                                    questionUrls,
                                                                                    multipleChoiceAnswers,
                                                                                    selectedCorrectAnswer
                                                                              }
                                                                        })
                                                                        .then(sucess => {

                                                                              // TeacherNotification.sendAndSaveMindBoxNotification(teacherId, groupId, sucess._id, 1) // 1-messageType used for selection of notification message
                                                                              //       .then(notificationSentAndSaved => {

                                                                              //             StudentNotification.sendAndSaveMindBoxNotification(studentId, groupId, sucess._id, 1) // 1-messageType used for selection of notification message
                                                                              //                   .then(notificationsSentAndSaved => {

                                                                              return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    message: "Doubt Updated successfully..!!"
                                                                              })

                                                                              //             })
                                                                              //             .catch(err => {
                                                                              //                   console.log(err);
                                                                              //                   res.status(200).json({
                                                                              //                         statusCode: "0",
                                                                              //                         message: "Something went wrong..!!"
                                                                              //                   })
                                                                              //             })

                                                                              // })
                                                                              // .catch(err => {
                                                                              //       console.log(err);
                                                                              //       res.status(200).json({
                                                                              //             statusCode: "0",
                                                                              //             message: "Something went wrong..!!"
                                                                              //       })
                                                                              // })
                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err);

                                                                              return res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something went wrong. Please Try Later..!!"
                                                                              })
                                                                        })

                                                            } else {

                                                                  if (Question && Question.reported == true) {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Question has been reported..!!"
                                                                        })

                                                                  } else if (Question && Question.questionDeletedStatus == true) {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Question has been reported..!!"
                                                                        })

                                                                  } else {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "No Record Found..!!"
                                                                        })

                                                                  }

                                                            }


                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. ..!!"
                                                            })
                                                      })

                                          } else {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Connections..!!!"
                                                })
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please try Later.!!"
                                          })
                                    });

                        } else {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: success.message
                              })

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please Try Later..!!"
                        })
                  })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}