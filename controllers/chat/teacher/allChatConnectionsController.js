const VerifyTeacher = require('../../../middleware/verifyTeacher');
const ChatConnectionModel = require('../../../models/chat/chatConnectionModel');
const ClassStudentConnectinoModel = require('../../../models/classes/classStudentConnectionModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');


/**
 * Get all messages thta teacher received based on group.
 * These messages may contain broadcast, individual, reply and join Messages
 */
module.exports = (req, res, next) => { //, upload.any('messageDocument')

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            // mongoose.set('debug', true);


            //Verify Teacher and Grade
            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        let TeacherClasses = ClassTeacherConnectionModel.find({
                              teacherId,
                              isActive: true
                        })
                              .exec()

                        let ChatClassGroups = ChatConnectionModel.find({
                              initiatorUserId: teacherId,
                              connectionType: 3,
                              deleteStatus: false,
                              isActive: true
                        })
                              .sort({
                                    'date': -1
                              })
                              .exec()

                        Promise.all([TeacherClasses, ChatClassGroups])
                              .then(async promiseData => {

                                    console.log(promiseData)

                                    let ClassChatGroups = []; //new Array();
                                    let TeacherList = [] //new Array();
                                    let StudentList = []//new Array();

                                    if (promiseData.length == 2) {

                                          if (promiseData[0].length != 0 || promiseData[1].length != 0) {

                                                if (promiseData[1].length > 0) {

                                                      for (let index = 0; index < promiseData[1].length; index++) {

                                                            const ChatClassGroup = promiseData[1][index];

                                                            ClassChatGroups.push({
                                                                  conversationId: ChatClassGroup._id,
                                                                  roomId: ChatClassGroup.roomId,
                                                                  groupName: ChatClassGroup.groupName,
                                                                  groupPic: ChatClassGroup.groupPic ? ChatClassGroup.groupPic : "",
                                                                  studentLength: ChatClassGroup.groupUserIds.length
                                                            });

                                                      }
                                                }


                                                if (promiseData[0].length > 0) {

                                                      let PromiseInputData = [];

                                                      let TeacherClassesList = promiseData[0].map(teacherclass => teacherclass.classId);

                                                      for (let index = 0; index < promiseData[0].length; index++) {
                                                            const teacherclass = promiseData[0][index];

                                                            let StudentListData = await ClassStudentConnectinoModel.find({
                                                                  classId: teacherclass.classId,
                                                                  $or: [
                                                                        {
                                                                              subjects: {
                                                                                    $in: teacherclass.subjects
                                                                              }
                                                                        }, {
                                                                              secondLanguage: teacherclass.secondLanguages
                                                                        }, {
                                                                              thirdLanguage: teacherclass.thirdLanguages
                                                                        }
                                                                  ],
                                                                  connectionStatus: 1,
                                                                  isActive: true
                                                            })
                                                                  .populate('studentId')
                                                                  .populate('classId')
                                                                  .exec()

                                                            PromiseInputData.push(StudentListData)

                                                      }


                                                      let OtherTeacherList = ClassTeacherConnectionModel.find({
                                                            classId: {
                                                                  $in: TeacherClassesList
                                                            },
                                                            teacherId: {
                                                                  $ne: teacherId
                                                            },
                                                            isActive: true
                                                      })
                                                            .populate('classId')
                                                            .populate('teacherId')
                                                            .exec()

                                                      Promise.all([OtherTeacherList, PromiseInputData])
                                                            .then(NewPromiseData => {

                                                                  console.log(NewPromiseData)

                                                                  if (NewPromiseData[0].length > 0) {

                                                                        let PushedTeacherList = [];

                                                                        for (let index = 0; index < NewPromiseData[0].length; index++) {
                                                                              const OtherTeacher = NewPromiseData[0][index];
                                                                              console.log(OtherTeacher)

                                                                              let checkTeacherExists = PushedTeacherList.indexOf(String(OtherTeacher.teacherId._id))

                                                                              let subjectDataList = OtherTeacher.subjects.concat(OtherTeacher.secondLanguages).concat(OtherTeacher.thirdLanguages)

                                                                              if (checkTeacherExists == -1) {
                                                                                    TeacherList.push({
                                                                                          receiverId: OtherTeacher.teacherId._id,
                                                                                          receiverFirstName: OtherTeacher.teacherId.firstName,
                                                                                          receiverSurName: OtherTeacher.teacherId.surName,
                                                                                          receiverProfilePic: OtherTeacher.teacherId.profilePic ? OtherTeacher.teacherId.profilePic : "",
                                                                                          recieverStatus: OtherTeacher.classId.grade + "-" + OtherTeacher.classId.section + " " + subjectDataList.join(','),
                                                                                          isSelected: "false"
                                                                                    })
                                                                              } else {
                                                                                    TeacherList[checkTeacherExists].recieverStatus += OtherTeacher.classId.grade + " " + OtherTeacher.classId.section + subjectDataList.join(',')
                                                                              }

                                                                        }

                                                                  }

                                                                  console.log(NewPromiseData[1])

                                                                  if (NewPromiseData[1].length > 0) {

                                                                        for (let index = 0; index < NewPromiseData[1].length; index++) {
                                                                              const StudetListData = NewPromiseData[1][index];

                                                                              if (StudetListData.length > 0) {

                                                                                    for (let index1 = 0; index1 < StudetListData.length; index1++) {
                                                                                          const StudetConnection = StudetListData[index1];

                                                                                          StudentList.push({
                                                                                                receiverId: StudetConnection.studentId._id,
                                                                                                receiverFirstName: StudetConnection.studentId.firstName,
                                                                                                receiverSurName: StudetConnection.studentId.surName,
                                                                                                receiverProfilePic: StudetConnection.studentId.profilePic ? StudetConnection.studentId.profilePic : "",
                                                                                                recieverStatus: StudetConnection.classId.grade + " " + StudetConnection.classId.section,
                                                                                                isSelected: "false"
                                                                                          })

                                                                                    }

                                                                              }


                                                                        }

                                                                  }

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        ClassChatGroups,
                                                                        TeacherList,
                                                                        StudentList,
                                                                        message: "Data Found...!!"
                                                                  })

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something Went Wrong. Please Try Later..!!"
                                                                  })

                                                            })

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            ClassChatGroups,
                                                            TeacherList,
                                                            StudentList,
                                                            message: "No Records Found...!!"
                                                      })

                                                }

                                          } else {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      ClassChatGroups,
                                                      TeacherList,
                                                      StudentList,
                                                      message: "No Records Found...!!"
                                                })
                                          }

                                    } else {
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later..!!"
                                          })
                                    }

                              })
                              .catch(err => {
                                    console.log(err);

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something Went Wrong. Please Try Later..!!"
                                    })

                              })

                  } else {

                        res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied.....!!"
                        })

                  }

            })

      } else {
            res.status(200).json({
                  "statusCode": "0",
                  "message": "All Fields are mandatory...!!"
            })

      }

}




                        // .then(async ChatClassGroups => {

                        //       console.log(ChatClassGroups);

                        //       if (ChatClassGroups.length > 0) {

                        //             let ClassChatGroups = new Array();

                        //             for (let index = 0; index < ChatClassGroups.length; index++) {

                        //                   const ChatClassGroup = ChatClassGroups[index];

                        //                   ClassChatGroups.push({
                        //                         conversationId: ChatClassGroup._id,
                        //                         roomId: ChatClassGroup.roomId,
                        //                         groupName: ChatClassGroup.groupName,
                        //                         groupPic: ChatClassGroup.groupPic ? ChatClassGroup.groupPic : "",
                        //                         studentLength: ChatClassGroup.groupUserIds.length
                        //                   });

                        //             }

                        //             ClassTeacherConnectionModel.find({
                        //                   teacherId,
                        //                   isActive: true
                        //             })
                        //                   .exec()
                        //                   .then(async TeacherClasses => {

                        //                         if (TeacherClasses.length > 0) {

                        //                               let TeacherClassesList = TeacherClasses.map(teacherclass => teacherclass.classId);

                        //                               ClassTeacherConnectionModel.find({
                        //                                     classId: {
                        //                                           $in: TeacherClassesList
                        //                                     },
                        //                                     teacherId: {
                        //                                           $ne: teacherId
                        //                                     },
                        //                                     isActive: true
                        //                               })
                        //                                     .exec()
                        //                                     .then(async OtherTeachersOfClasses => {

                        //                                           if (OtherTeachersOfClasses.length > 0) {

                        //                                                 let StudentList = new Array();

                        //                                                 for (let index = 0; index < ChatStudents.length; index++) {

                        //                                                       const ChatStudent = ChatStudents[index];

                        //                                                       StudentList.push({
                        //                                                             receiverId: ChatStudent.studentId._id,
                        //                                                             name: ChatStudent.studentId.firstName + ChatStudent.studentId.surName,
                        //                                                             profilePic: ChatStudent.profilePic ? ChatStudent.profilePic : "",
                        //                                                             groupName: ChatStudent.groupId.grade + " " + ChatStudent.groupId.section
                        //                                                       });

                        //                                                 }


                        //                                                 res.status(200).json({
                        //                                                       statusCode: "1",
                        //                                                       ClassChatGroupList: ClassChatGroups,
                        //                                                       StudentList,
                        //                                                       message: "Data Found...!!"
                        //                                                 })

                        //                                           }
                        //                                           else {

                        //                                           }


                        //                                     })
                        //                                     .catch(err => {

                        //                                           console.log(err);

                        //                                           res.status(200).json({
                        //                                                 statusCode: "0",
                        //                                                 message: "Something Went Wrong. Please Try Later..!!"
                        //                                           })

                        //                                     })





                        //                         } else {
                        //                               res.status(200).json({
                        //                                     statusCode: "1",
                        //                                     ClassChatGroupList: ClassChatGroups,
                        //                                     StudentList: [],
                        //                                     message: "Data Found...!!"
                        //                               })
                        //                         }

                        //                   })
                        //                   .catch(err => {

                        //                         console.log(err);

                        //                         res.status(200).json({
                        //                               statusCode: "0",
                        //                               message: "Something Went Wrong. Please Try Later..!!"
                        //                         })

                        //                   })

                        //       } else {
                        //             res.status(200).json({
                        //                   statusCode: "0",
                        //                   ClassChatGroupList: [],
                        //                   StudentList: [],
                        //                   message: "No Records Found...!!"
                        //             })
                        //       }

                        // })
                        // .catch(err => {

                        //       console.log(err);

                        //       res.status(200).json({
                        //             statusCode: "0",
                        //             message: "Something Went Wrong. Please Try Later..!!"
                        //       })

                        // })
