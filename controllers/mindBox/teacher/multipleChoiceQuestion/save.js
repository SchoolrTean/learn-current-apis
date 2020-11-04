const mongoose = require('mongoose');


const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');
// const ClassStudentConnectionModel = require('../../../../models/classes/classStudentConnectionModel');



module.exports = (req, res, next) => {

      let questionUrls = new Array();

      if (req.file) {
            questionUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      if (req.body.teacherId && req.body.groupId && req.body.subjectName && req.body.multipleChoiceAnswers && req.body.multipleChoiceAnswers.split('%-%').length >= 2 && req.body.selectedCorrectAnswer && (req.body.question || questionUrls.length > 0)) {

            let teacherId = req.body.teacherId;
            let classId = req.body.groupId;
            let subjectName = req.body.subjectName;
            let question = req.body.question;
            let multipleChoiceAnswers = req.body.multipleChoiceAnswers // %-%
            let selectedCorrectAnswer = req.body.selectedCorrectAnswer; //number


            VerifyTeacher(teacherId, classId, (error, response) => {

                  // console.log(error);
                  // console.log(response);

                  if (response && response.statusCode != "0" && response.classData) {

                        // ClassStudentConnectionModel.findOne({
                        //       classId: groupId,
                        //       // groupId,
                        //       connectionStatus: 1,
                        //       isActive: true
                        // })
                        //       .exec()
                        //       .then(connection => {

                        //             if (connection) {

                        let saveNewDoubt = new MindBoxQuestionModel({
                              _id: new mongoose.Types.ObjectId(),
                              userId: teacherId,
                              groupId: classId,
                              subjectName,
                              question,
                              questionUrls,
                              multipleChoiceAnswers,
                              selectedCorrectAnswer,
                              questionType: 1
                        })

                        // console.log(saveNewDoubt);

                        saveNewDoubt.save()
                              .then(saved => {

                                    // console.log(saved);

                                    // TeacherNotification.sendAndSaveMindBoxNotification(teacherId, groupId, sucess._id, 1) // 1-messageType used for selection of notification message
                                    //       .then(notificationSentAndSaved => {

                                    //             StudentNotification.sendAndSaveMindBoxNotification(studentId, groupId, sucess._id, 1) // 1-messageType used for selection of notification message
                                    //                   .then(notificationsSentAndSaved => {

                                    return res.status(200).json({
                                          statusCode: "1",
                                          message: "Question published successfully..!!"
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