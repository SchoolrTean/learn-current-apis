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

      if (req.params.studentId && req.params.groupId && req.params.questionId && req.body.subjectName && (req.body.question || questionUrls.length > 0)) { //&& req.body.teacherIds && req.body.groupIds 

            let studentId = req.params.studentId;
            let classId = req.params.groupId;
            let questionId = req.params.questionId;
            let subjectName = req.body.subjectName;
            let question = req.body.question;
            let alreadySavedQuestionUrls = req.body.alreadySavedQuestionUrls;
            // let answer = req.body.answer;

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
                                                            groupId : classId,
                                                            userId: studentId,
                                                            // deletedUsers: {
                                                            //       $ne: studentId
                                                            // },                                         
                                                            questionType: 3,
                                                            isActive: true
                                                      })
                                                      .exec()
                                                      .then(QuestionData => {

                                                            if (QuestionData) {

                                                                  if (QuestionData.answerCount == 0 && QuestionData.reported == false && QuestionData.questionDeletedStatus == false) {

                                                                        MindBoxQuestionModel.updateOne({
                                                                                    _id: questionId
                                                                              }, {
                                                                                    $set: {
                                                                                          subjectName,
                                                                                          question,
                                                                                          questionUrls,
                                                                                          // answer,
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
                                                                        return res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: QuestionData.answerCount != 0 ? "Answered Question cannot be edited..!!" : QuestionData.reported == true ? "Question has been Reported..!!" : "Question has bee deleted"
                                                                        })

                                                                  }

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
                                                message: "Something went wrong. Please Try Later..!!"
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