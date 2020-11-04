const mongoose = require('mongoose');


const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');
const ClassTeacherConnectionModel = require('../../../../models/classes/classTeacherConnectionModel');
// const StudentNotification = require('../../notification/sendNotificationToConnectedStudents');
// const TeacherNotification = require('../../notification/sendNotificationToTeacher');
const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')




module.exports = (req, res, next) => {

      let questionUrls = new Array();

      if (req.file) {
            questionUrls.push(req.file.path.replace(/\\/g, '/'));
      }

      if (req.body.studentId && req.body.subjectName && (req.body.question || questionUrls.length > 0)) { //&& req.body.teacherIds && req.body.groupIds 

            let studentId = req.body.studentId;
            let subjectName = req.body.subjectName.toLowerCase();
            let question = req.body.question;
            // let answer = req.body.answer;


            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.list(studentId)
                                    .then(connectedGroupsList => {

                                          if (connectedGroupsList.length > 0) {

                                                ClassTeacherConnectionModel.find({
                                                      classId: {
                                                            $in: connectedGroupsList
                                                      },
                                                      $or: [{
                                                            subjects: {
                                                                  $in: subjectName
                                                            },
                                                      }, {
                                                            secondLanguages: subjectName,
                                                      }, {
                                                            thirdLanguages: subjectName,
                                                      }],
                                                      isActive: true
                                                })
                                                      .exec()
                                                      .then(TeacherGroupList => {

                                                            if (TeacherGroupList.length > 0) {

                                                                  let savedDoubts = new Array();

                                                                  for (let index = 0; index < TeacherGroupList.length; index++) {

                                                                        let saveNewDoubt = new MindBoxQuestionModel({
                                                                              _id: new mongoose.Types.ObjectId(),
                                                                              userId: studentId,
                                                                              groupId: TeacherGroupList[index].classId,
                                                                              subjectName,
                                                                              question,
                                                                              questionUrls,
                                                                              // answer,
                                                                              questionType: 3
                                                                        })

                                                                        savedDoubts.push(saveNewDoubt.save())
                                                                  }

                                                                  Promise.all(savedDoubts)
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
                                                                                    message: "Something went wrong. Please Try Later..!!"
                                                                              })
                                                                        })
                                                            } else {
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Access Denied..!!!"
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