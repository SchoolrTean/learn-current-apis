const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const randomize = require('randomatic');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const StudentModel = require('../../../../models/authentication/userModel');
const ClassStudentConnectionModel = require('../../../../models/classes/classStudentConnectionModel');
const ChatConnectionModel = require('../../../../models/chat/chatConnectionModel');

const Sms = require('../../../../third-party/sms/sendSms')
const SendJoinedNotification = require('../../../../third-party/notification/teacher/sendJoinedNotification')
const createOneOnOneChatConnections = require('../../../chat/shared/createOneOnOneChatController')


const checkStudentAlreadyConnectedToThisGroup = (studentId, groupId) => {

      return new Promise((resolve, reject) => {

            ClassStudentConnectionModel.findOne({
                  studentId,
                  classId: groupId,
                  isActive: true
            })
                  .then(connectionExists => {

                        if (connectionExists) {
                              resolve(1);
                        } else {
                              resolve(0);
                        }

                  })
                  .catch(err => {
                        console.log(err);
                        reject(0);
                  })

      });

}


const chatConnection = (teacherId, studentId, groupId) => {

      return new Promise((resolve, reject) => {

            ChatConnectionModel.findOne({
                  initiatorUserId: teacherId,
                  receiverUserId: studentId,
                  isActive: true
            }).exec()
                  .then(ChatConnectionExist => {

                        if (ChatConnectionExist) {

                              // if (ChatConnectionExist.groupId.indexOf(groupId)) {
                              resolve(1);
                              // } else {

                              //       ChatConnectionModel.updateOne({
                              //             _id: ChatConnectionExist._id
                              //       }, {
                              //             $push: {
                              //                   groupId
                              //             }
                              //       })
                              //             .then(groupUpdated => {
                              //                   resolve(1);
                              //             })
                              //             .catch(err => {
                              //                   console.log(err);

                              //                   reject(0);
                              //             })
                              // }

                        } else {

                              // const establishChatConnection = new ChatConnectionModel({
                              //       _id: new mongoose.Types.ObjectId(),
                              //       connectionType: 1,
                              //       initiatorUserId: teacherId,
                              //       receiverUserId: studentId,
                              //       groupId: [groupId]
                              // })

                              createOneOnOneChatConnections(teacherId, studentId)
                                    .then(established => {
                                          resolve(1);
                                    }).catch(err => {
                                          console.log(err);

                                          reject(0);
                                    })
                        }

                  })
                  .catch(err => {
                        console.log(err);
                  })


      });
}



const connectWithGroup = (studentId, teacherId, groupId, studentMobileNo, connectionStatus, teacherName, groupName, newStudent = null) => {

      return new Promise((resolve, reject) => {

            const establishConnection = new ClassStudentConnectionModel({
                  _id: new mongoose.Types.ObjectId(),
                  classId: groupId,
                  studentId,
                  mobileNo: studentMobileNo,
                  connectionStatus, //Connection Status is Pending initially
            });

            establishConnection.save()
                  .then(success => {

                        chatConnection(teacherId, studentId, groupId)
                              .then(success => {

                                    if (connectionStatus == 2) {
                                          SendJoinedNotification(studentId, groupId, success._id, teacherName, groupName, newStudent)
                                    }

                                    resolve(1) //New mobile no registered Successfully

                              })
                              .catch(err => {
                                    console.log(err);
                                    reject(0);
                              })

                  })
                  .catch(err => {
                        console.log(err);
                        reject(0);
                  })
      })

}



const registerNewMobileNoAndName = (groupId, teacherId, firstName, surName, mobileNo, existingMobileNo, loggedInStatus, teacherName, groupName) => {

      return new Promise((resolve, reject) => {

            if (existingMobileNo) {

                  const addOtherStudent = new StudentModel({
                        _id: new mongoose.Types.ObjectId(),
                        firstName,
                        surName,
                        mobileNo,
                        type: true, //Student-true
                        loggedIn: loggedInStatus == 1 ? false : true,
                        addedBy: teacherId
                  });

                  addOtherStudent.save()
                        .then(async savedStudentData => {

                              connectWithGroup(savedStudentData._id, teacherId, groupId, savedStudentData.mobileNo, loggedInStatus, teacherName, groupName, 1) //new Student
                                    .then(success => {
                                          /**Send Notification */
                                          resolve(1) // New Student with same mobileNo
                                    })
                                    .catch(err => {
                                          console.log(err);
                                          reject(0);
                                    })

                        })
                        .catch(err => {
                              console.log(err);
                              reject(0);
                        });

            } else {

                  let inValidMobileNoArray = new Array();

                  let password = randomize('a0', 8);

                  bcrypt.hash(password, 13, (err, hash) => {

                        if (err) {

                              reject(0);

                        } else {

                              const registerNewStudent = new StudentModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    firstName,
                                    surName,
                                    mobileNo,
                                    type: true, //Student-true
                                    password: hash,
                                    addedBy: teacherId
                              });

                              registerNewStudent.save()
                                    .then(async savedStudentData => {

                                          let message = "Please Download App from here Download Link..!! Login Details MobileNo : " + savedStudentData.mobileNo + "Password : " + password;

                                          await Sms.send(savedStudentData.mobileNo, message, "")
                                                .then(async success => {

                                                      console.log(success);

                                                      if (success.statusCode == 0) {

                                                            inValidMobileNoArray.push(savedStudentData.mobileNo)
                                                            resolve(1);

                                                      } else {

                                                            connectWithGroup(savedStudentData._id, teacherId, groupId, savedStudentData.mobileNo, 1, teacherName, groupName)
                                                                  .then(success => {
                                                                        resolve(1) // New Student with same mobileNo
                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);
                                                                        reject(0);
                                                                  })

                                                      }

                                                })
                                                .catch(err => {
                                                      console.log(err);
                                                      reject(0);
                                                })

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          reject(0);
                                    });

                        }
                  });
            }

      })

}



const add = async (req, res, next) => {

      if (req.body.teacherId && req.body.groupId && req.body.studentData) {

            let teacherId = req.body.teacherId;
            let groupId = req.body.groupId;
            let studentData = req.body.studentData;
            /**firstName-_-surName-*-mobileNo*-*stringFlag %-% */

            VerifyTeacher(teacherId, groupId, async (error, response) => {

                  if (response && response.statusCode != "0") {

                        let teacherName = response.teacherData.firstName + " " + response.teacherData.surName;

                        let groupName = response.classData.section ? response.classData.grade + "-" + response.classData.section : response.classData.grade;

                        let individualRecords = studentData.trim().split('%-%');

                        if (individualRecords.length > 0) {

                              let groupConnections = new Array();

                              for (let index = 0; index < individualRecords.length; index++) {

                                    const record = individualRecords[index];

                                    let splitForName = record.split("-*-");
                                    let splitForMobileNo = splitForName[1].split("*-*");

                                    console.log("splitForName");
                                    console.log(splitForName);
                                    console.log("splitForMobileNo");
                                    console.log(splitForMobileNo);

                                    //Student was Registered
                                    if (splitForMobileNo[1] == 'false') {

                                          /** Check if student registered*/
                                          let studentRecord = await StudentModel.findOne({
                                                _id: splitForName[0],
                                                mobileNo: splitForMobileNo[0],
                                                type: true,
                                                isActive: true
                                          }).exec()

                                          /**If student already exists */
                                          if (studentRecord) {

                                                checkStudentAlreadyConnectedToThisGroup(splitForName[0], groupId)
                                                      .then(studentExists => {

                                                            if (!studentExists) {

                                                                  groupConnections.push(connectWithGroup(studentRecord._id, teacherId, groupId, studentRecord.mobileNo, studentRecord.loggedInStatus = 1, teacherName, groupName)) //studentRecord.loggedInStatus == true ? 1 : 0
                                                                  /**Send Notification */

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                      })
                                          }

                                    } else if (splitForMobileNo[1] == 'true') {

                                          /**If user has not been registered as student */
                                          let splitName = splitForName[0].split("-_-");

                                          console.log("splitName");
                                          console.log(splitName);

                                          /** Check if student mobileno already registered*/
                                          let studentsRecords = await StudentModel.find({
                                                mobileNo: splitForMobileNo[0],
                                                type: true,
                                                isActive: true
                                          })

                                          /**If student already exists */
                                          if (studentsRecords.length > 0) {

                                                let studentAlreadyRegistered = 0;
                                                let loggedInStatus = 1;

                                                for (let index = 0; index < studentsRecords.length; index++) {
                                                      const studentData = studentsRecords[index];

                                                      //check same student name already exists with this mobile no
                                                      if (studentData.firstName.toLowerCase() == splitName[0].toLowerCase() && studentAlreadyRegistered == 0) {
                                                            studentAlreadyRegistered = studentData;
                                                      }

                                                      if (studentData.loggedIn == 1 && loggedInStatus == 1) { //if (studentData.loggedIn == true && loggedInStatus == 1) {
                                                            loggedInStatus = 2;
                                                      }
                                                }

                                                if (studentAlreadyRegistered == 0) {

                                                      /** Add other student to same mobileno */
                                                      groupConnections.push(await registerNewMobileNoAndName(groupId, teacherId, splitName[0], splitName[1], splitForMobileNo[0], 1, loggedInStatus, teacherName, groupName))


                                                } else {

                                                      checkStudentAlreadyConnectedToThisGroup(studentAlreadyRegistered._id, groupId)
                                                            .then(async studentExists => {

                                                                  if (!studentExists) { //await

                                                                        groupConnections.push(connectWithGroup(studentAlreadyRegistered._id, teacherId, groupId, studentAlreadyRegistered.mobileNo, studentAlreadyRegistered.loggedInStatus = 1, teacherName, groupName)) //studentAlreadyRegistered.loggedInStatus == true ? 1 : 2
                                                                        /**Send Notification */
                                                                  }

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);
                                                            })
                                                }


                                          } else {

                                                /**Register new user with creating password and send to mobileNo */
                                                groupConnections.push(await registerNewMobileNoAndName(groupId, teacherId, splitName[0], splitName[1], splitForMobileNo[0], 0, 1, teacherName, groupName))

                                          }



                                    } else {

                                          groupConnections.push(0)

                                    }

                              } // for condition ending

                              Promise.all(groupConnections)
                                    .then(connectionsEstablished => {

                                          console.log(connectionsEstablished);

                                          return res.status(200).json({
                                                statusCode: "1",
                                                message: "Students Connection Sent Successfully..!!"
                                          })

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied..!!"
                                          })
                                    })

                        } else {

                              console.log("No Records exist..!!");
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: "Please fill all fields correctly..!!"
                              })

                        }


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



module.exports = add