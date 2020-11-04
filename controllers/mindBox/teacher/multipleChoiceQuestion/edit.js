const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')
const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const ClassStudentConnectionModel = require('../../../../models/classes/classStudentConnectionModel');



module.exports = (req, res, next) => {

      let questionUrls = new Array();

      if (req.file) {
            questionUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      console.log(req.params);
      console.log(req.body);

      if (req.params.teacherId && req.params.groupId && req.params.questionId && req.body.subjectName && req.body.multipleChoiceAnswers && req.body.multipleChoiceAnswers.split('%-%').length >= 2 && req.body.selectedCorrectAnswer && (req.body.question || questionUrls.length > 0)) {

            let teacherId = req.params.teacherId;
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


            VerifyTeacher(teacherId, classId, (error, response) => {

                  if (response && response.statusCode != "0" && response.classData) {

                        // ClassStudentConnectionModel.findOne({
                        //             classId: groupId,
                        //             teacherId,
                        //             connectionStatus: 1,
                        //             isActive: true
                        //       })
                        //       .exec()
                        //       .then(connection => {

                        //             if (connection) {

                        MindBoxQuestionModel.findOne({
                              _id: questionId,
                              userId: teacherId,
                              groupId : classId,
                              deletedUsers: {
                                    $ne: teacherId
                              },
                              questionType: 1,
                              questionDeletedStatus: false,
                              isActive: true
                        })
                              .populate('userId', 'type')
                              .exec()
                              .then(Question => {

                                    if (Question) {

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
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "No Record Found..!!"
                                          })
                                    }


                              })
                              .catch(err => {
                                    console.log(err);

                                    return res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. ..!!"
                                    })
                              })

                        //       } else {
                        //             res.status(200).json({
                        //                   statusCode: "0",
                        //                   message: "Please add students to send doubt..!!"
                        //             })
                        //       }

                        // })
                        // .catch(err => {
                        //       console.log(err);

                        //       return res.status(200).json({
                        //             statusCode: "0",
                        //             message: "Something Went Wrong. Please try Later.!!"
                        //       })
                        // });

                  } else {

                        return res.status(200).json({
                              statusCode: "0",
                              message: error.message
                        })

                  }

            })


      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}