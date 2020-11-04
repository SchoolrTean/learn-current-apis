const mongoose = require('mongoose');


const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const ClassTeacherConectionModel = require('../../../../models/classes/classTeacherConnectionModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')




module.exports = (req, res, next) => {

      let questionUrls = new Array();

      if (req.file) {
            questionUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      if (req.body.studentId && req.body.subjectName && req.body.multipleChoiceAnswers && req.body.multipleChoiceAnswers.split('%-%').length >= 2 && req.body.selectedCorrectAnswer && req.body.selectedCorrectAnswer < 4 && (req.body.question || questionUrls.length > 0)) {

            let studentId = req.body.studentId;
            let subjectName = req.body.subjectName.toLowerCase();
            let question = req.body.question;
            let multipleChoiceAnswers = req.body.multipleChoiceAnswers // %-%
            let selectedCorrectAnswer = req.body.selectedCorrectAnswer; //number


            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.list(studentId)
                                    .then(connectedGroupsList => {

                                          if (connectedGroupsList.length > 0) {

                                                ClassTeacherConectionModel.find({
                                                            classId: {
                                                                  $in: connectedGroupsList
                                                            },
                                                            $or: [{
                                                                  subjects: {
                                                                        $in :subjectName
                                                                  },
                                                            }, {
                                                                  secondLanguages: subjectName,
                                                            }, {
                                                                  thirdLanguages: subjectName,
                                                            }],
                                                            isActive: true
                                                      })
                                                      .exec()
                                                      .then(ClassList => {

                                                            if (ClassList.length > 0) {

                                                                  let saveNewQuestions = new Array();

                                                                  for (let index = 0; index < ClassList.length; index++) {

                                                                        let saveNewQuestion = new MindBoxQuestionModel({
                                                                              _id: new mongoose.Types.ObjectId(),
                                                                              userId: studentId,
                                                                              groupId: ClassList[index].classId,
                                                                              subjectName,
                                                                              question,
                                                                              questionUrls,
                                                                              multipleChoiceAnswers,
                                                                              selectedCorrectAnswer,
                                                                              questionType: 1
                                                                        })

                                                                        saveNewQuestions.push(saveNewQuestion.save())
                                                                  }

                                                                  Promise.all(saveNewQuestions)
                                                                        .then(sucess => {

                                                                              // TeacherNotification.sendAndSaveMindBoxNotification(teacherId, groupId, sucess._id, 1) // 1-messageType used for selection of notification message
                                                                              //       .then(notificationSentAndSaved => {

                                                                              //             StudentNotification.sendAndSaveMindBoxNotification(studentId, groupId, sucess._id, 1) // 1-messageType used for selection of notification message
                                                                              //                   .then(notificationsSentAndSaved => {

                                                                              return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    message: "Doubt published successfully..!!"
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
                                                                                    message: "Something Went Wrong. Please try Later..!!"
                                                                              })
                                                                        })

                                                            } else {

                                                                  return res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Access Denied..!!"
                                                                  })

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Please try Later..!!"
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
                                                message: "Something Went Wrong. Please try Later..!!"
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