const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const UserModel = require('../../../models/authentication/userModel');
const ClassModel = require('../../../models/classes/classModel');
// const TeacherGroupModel = require('../../../models/group/teacherGroupModel');
// const ConnectionModel = require('../../../models/group/connectionModel');
// const ChatConnectionModel = require('../../../models/chat/chatConnectionModel');
const SchoolStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const validator = require("email-validator");

const Sms = require('../../../third-party/sms/sendSms')
const SendJoinedNotification = require('../../../third-party/notification/teacher/sendJoinedNotification');

// const AddStudentToClassGroup = require('../../chat/teacher/classes/addStudentToClassGroup')


const CreateNewStudent = (firstName, surName, mobileNo, emailId, admissionNumber) => {

      return new Promise((resolve, reject) => {

            try {

                  bcrypt.hash(admissionNumber, 13, (err, hash) => {

                        if (err) {
                              console.log(err);

                              reject(0);

                        } else {

                              const NewStudent = new UserModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    firstName,
                                    surName,
                                    emailId,
                                    mobileNo,
                                    password: hash,
                                    type: 1, //Student
                              });

                              NewStudent.save()
                                    .then(success => {

                                          if (mobileNo && !emailId) {

                                                // let message = "Please Download App from here Download Link..!! Login Details MobileNo : " + mobileNo + "Password : " + admissionNumber;

                                                // Sms.send(mobileNo, message, "")
                                                //       .then(success => {

                                                resolve(success._id);

                                                // })
                                                // .catch(err => {
                                                //       console.log(err);
                                                //       reject(0);
                                                // })
                                          } else {

                                                resolve(success._id);
                                          }
                                    })
                                    .catch(err => {
                                          console.log(err);
                                          reject(0);
                                    })

                        }
                  });

            } catch (error) {

                  console.log(error);
                  reject(0);

            }


      })

}




const JoinToSchoolClass = (firstName, surName, admissionNumber, mobileNo, emailId, invitationType, studentId, classId, schoolId, subjects) => {

      return new Promise((resolve, reject) => {

            try {
                  const ConnectionData = new SchoolStudentConnectionModel({
                        _id: new mongoose.Types.ObjectId(),
                        schoolId,
                        classId,
                        firstName,
                        surName,
                        mobileNo,
                        emailId,
                        admissionNumber,
                        connectionStatus: invitationType, //0-Not invited 1-Invited
                  });

                  if (studentId) {

                        ConnectionData.studentId = studentId
                        ConnectionData.subjects = subjects

                        let studentConnectionQuery = {}

                        if (emailId && mobileNo) {
                              studentConnectionQuery = {
                                    $or: [{
                                          mobileNo
                                    }, {
                                          emailId
                                    }],
                                    classId,
                                    isActive: true
                              }
                        } else if (emailId) {
                              studentConnectionQuery = {
                                    emailId,
                                    classId,
                                    isActive: true
                              }
                        } else {
                              studentConnectionQuery = {
                                    mobileNo,
                                    classId,
                                    isActive: true
                              }
                        }

                        //** Check Already Connection Exists */
                        SchoolStudentConnectionModel.findOne(studentConnectionQuery).exec()
                              .then(connectionExists => {

                                    if (connectionExists) {

                                          if (connectionExists.connectionStatus == 1) {
                                                resolve(1);
                                          } else {

                                                SchoolStudentConnectionModel.updateOne({
                                                      _id: connectionExists._id
                                                }, {
                                                      $set: {
                                                            connectionStatus: invitationType
                                                      }
                                                }).exec()
                                                      .then(updated => {
                                                            resolve(1);
                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            reject(0);
                                                      })
                                          }

                                    } else {

                                          ConnectionData.save()
                                                .then(savedGroupConnection => {

                                                      console.log("Saved Group Connection For Student" + firstName);
                                                      resolve(1);

                                                })
                                                .catch(err => {
                                                      console.log(err);
                                                      reject(0);
                                                })

                                    }

                              })
                              .catch(err => {

                              })

                  } else {

                        ConnectionData.save()
                              .then(savedGroupConnection => {

                                    console.log("Saved Group Connection For Student" + firstName);
                                    resolve(1);

                              })
                              .catch(err => {
                                    console.log(err);
                                    reject(0);
                              })

                  }

            } catch (error) {
                  reject(0);
            }



      })

}




const addStudentToSchoolGroup = (req, res, next) => {

      try {

            if (req.body.schoolId && req.body.groupId && req.body.studentFirstNameData && req.body.studentSurNameData && req.body.admissionNumbersData && req.body.MobileNosData && req.body.emailIdsData && req.body.invitationType) {

                  let schoolId = req.body.schoolId;

                  let classId = req.body.groupId; //Data

                  let invitationType = req.body.invitationType; //0-invite Later, 1-connected

                  let studentFirstNameData = req.body.studentFirstNameData.split(','); //Data
                  let studentSurNameData = req.body.studentSurNameData.split(','); //Data

                  let admissionNumbersData = req.body.admissionNumbersData.split(',');
                  let MobileNosData = req.body.MobileNosData.split(',');

                  let emailIdsData = req.body.emailIdsData.toLowerCase().split(',');

                  let mobileNoValidateRegExp = /^\(?([6-9]{1})([0-9]{2})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

                  let removeNullMobileNos = MobileNosData.filter(function (el) {
                        return el != null;
                  });

                  let validatedMobileNos = removeNullMobileNos.filter(function (el) {
                        if (el.match(mobileNoValidateRegExp)) {
                              return el;
                        }
                  })

                  let formattedEmailIds = emailIdsData.filter(function (el) {
                        return el != null && el != '';
                  });

                  let validatedEmailIds = formattedEmailIds.filter(function (el) {
                        return validator.validate(el) == 1;
                  });

                  console.log(validatedEmailIds);
                  console.log(formattedEmailIds);

                  if (formattedEmailIds.length == validatedEmailIds.length && validatedMobileNos.length == removeNullMobileNos.length) {

                        if (studentFirstNameData.length == studentSurNameData.length && admissionNumbersData.length == MobileNosData.length && emailIdsData.length == MobileNosData.length && studentFirstNameData.length == admissionNumbersData.length) {

                              UserModel.findOne({
                                    _id: schoolId,
                                    isActive: true
                              })
                                    .exec()
                                    .then(schoolData => {

                                          if (schoolData) {

                                                ClassModel.findOne({
                                                      _id: classId,
                                                      isActive: true
                                                })
                                                      .exec()
                                                      .then(async classFound => {

                                                            if (classFound) {

                                                                  console.log(classFound)

                                                                  let studentErrorList = new Array();

                                                                  let studentSavedList = new Array();

                                                                  for (let index = 0; index < studentFirstNameData.length; index++) {

                                                                        if (emailIdsData[index].trim() || MobileNosData[index].trim()) {

                                                                              let query = "";
                                                                              let mobileNo = MobileNosData[index].trim();
                                                                              let emailId = emailIdsData[index].toLowerCase().trim();

                                                                              if (emailId && mobileNo) {
                                                                                    query = {
                                                                                          $or: [{
                                                                                                mobileNo,
                                                                                          }, {
                                                                                                emailId,
                                                                                          }],
                                                                                          type: 1, //Student
                                                                                          isActive: true
                                                                                    }
                                                                              } else if (emailId && !mobileNo) {

                                                                                    query = {
                                                                                          emailId,
                                                                                          type: 1, //Student
                                                                                          isActive: true
                                                                                    }

                                                                              } else if (!emailId && mobileNo) {

                                                                                    query = {
                                                                                          mobileNo,
                                                                                          type: 1, //Student
                                                                                          isActive: true
                                                                                    }

                                                                              }


                                                                              await UserModel.find(query).exec()
                                                                                    .then(async students => {

                                                                                          let emailIdExists = 0;
                                                                                          let mobileNoExists = 0;
                                                                                          let existingStudentId = 0;

                                                                                          if (students.length > 0) {

                                                                                                students.forEach(student => {

                                                                                                      if (student.firstName == studentFirstNameData[index]) {
                                                                                                            existingStudentId = student._id;
                                                                                                      }

                                                                                                      if (!student.emailId || student.emailId == emailId) {
                                                                                                            emailIdExists = 1;
                                                                                                      } else if (!student.mobileNo || student.mobileNo == MobileNosData[index]) {
                                                                                                            mobileNoExists = 1;
                                                                                                      }

                                                                                                });

                                                                                          }

                                                                                          if (emailIdExists && mobileNoExists) {
                                                                                                //both emailID and MobileNo exists but both had different users then

                                                                                                studentErrorList.push({
                                                                                                      firstName: studentFirstNameData[index],
                                                                                                      surName: studentSurNameData[index],
                                                                                                      admissionNumber: admissionNumbersData[index],
                                                                                                      mobileNo: MobileNosData[index],
                                                                                                      emailId,
                                                                                                })

                                                                                          } else {

                                                                                                if (invitationType == 1) { //Connected

                                                                                                      if (!existingStudentId) {
                                                                                                            existingStudentId = await CreateNewStudent(studentFirstNameData[index], studentSurNameData[index], MobileNosData[index], emailIdsData[index].toLowerCase(), admissionNumbersData[index])
                                                                                                      }

                                                                                                      console.log("studentId");
                                                                                                      console.log(existingStudentId)

                                                                                                      studentSavedList.push(JoinToSchoolClass(studentFirstNameData[index], studentSurNameData[index], admissionNumbersData[index], MobileNosData[index], emailIdsData[index].toLowerCase(), invitationType, existingStudentId, classId, schoolId, classFound.subjects))

                                                                                                      // studentSavedList.push(JoinToAllAssignmentGroup(MobileNosData[index], existingStudentId, classId))


                                                                                                } else if (invitationType == 0) { //just Invited

                                                                                                      studentSavedList.push(JoinToSchoolClass(studentFirstNameData[index], studentSurNameData[index], admissionNumbersData[index], MobileNosData[index], emailIdsData[index].toLowerCase(), invitationType, existingStudentId, classId, schoolId, classFound.subjects))

                                                                                                }

                                                                                          }

                                                                                    })
                                                                                    .catch(err => {
                                                                                          console.log(err);

                                                                                          return res.status(200).json({
                                                                                                statusCode: "0",
                                                                                                message: "Something went wrong. Please Try Later..!!"
                                                                                          });
                                                                                    })


                                                                        } else {

                                                                              studentErrorList.push({
                                                                                    firstName: studentFirstNameData[index],
                                                                                    surName: studentSurNameData[index],
                                                                                    admissionNumber: admissionNumbersData[index],
                                                                                    mobileNo: MobileNosData[index],
                                                                                    emailId: emailIdsData[index],
                                                                              })
                                                                        }

                                                                  }

                                                                  Promise.all(studentSavedList)
                                                                        .then(allStudentsSaved => {

                                                                              // addStudentToStudentConnection(groupId)
                                                                              //       .then(success => {

                                                                              res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    studentErrorList,
                                                                                    message: "Successfull...!!"
                                                                              });

                                                                              // })
                                                                              // .catch(err => {
                                                                              //       console.log(err);

                                                                              //       res.status(200).json({
                                                                              //             statusCode: "0",
                                                                              //             message: "Something Went Wrong. Please Try Later...!!"
                                                                              //       });
                                                                              // })

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err);
                                                                              return res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something went wrong. Please Try Later..!!"
                                                                              });
                                                                        })

                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Access Denied..!!"
                                                                  });

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please Try later..!!"
                                                            });
                                                      })

                                          } else {

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Access Denied..!!"
                                                });

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please Try later..!!"
                                          });
                                    })

                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: "All fields are mandatory..!!"
                              });

                        }

                  } else {

                        let message = formattedEmailIds.length != validatedEmailIds.length ? "Please Enter Valid EmailIds..!!" : "Please Enter Valid MobileNos..!!";

                        res.status(200).json({
                              statusCode: "0",
                              message
                        });

                  }

            } else {
                  return res.status(200).json({
                        statusCode: "0",
                        message: "All fields are mandatory..!!"
                  });
            }

      } catch (error) {

            console.log(error);

            res.status(200).json({
                  statusCode: "0",
                  message: "Something went Wrong. Please try later..!!"
            })

      }
}



module.exports = addStudentToSchoolGroup;





// const JoinToAllAssignmentGroup = (mobileNo, studentId, groupId) => {

//       return new Promise((resolve, reject) => {

//             try {

//                   TeacherGroupModel.find({
//                         schoolGroupId: groupId,
//                         isActive: true
//                   })
//                         .exec()
//                         .then(async assignmentGroups => {

//                               console.log("assignmentGroups");
//                               console.log(assignmentGroups);

//                               let connectionToAssignmentGroups = new Array();

//                               for (let index = 0; index < assignmentGroups.length; index++) {

//                                     await ConnectionModel.findOne({
//                                           studentId,
//                                           teacherId: assignmentGroups[index].teacherId,
//                                           groupId: assignmentGroups[index]._id,
//                                           isActive: true
//                                     })
//                                           .exec()
//                                           .then(connectionAlreadyExists => {

//                                                 console.log("connectionAlreadyExists");
//                                                 console.log(connectionAlreadyExists);

//                                                 if (!connectionAlreadyExists) {

//                                                       const establishConnection = new ConnectionModel({
//                                                             _id: new mongoose.Types.ObjectId(),
//                                                             studentId,
//                                                             teacherId: assignmentGroups[index].teacherId,
//                                                             groupId: assignmentGroups[index]._id,
//                                                             studentMobileNo: mobileNo,
//                                                             connectionStatus: 2
//                                                       })

//                                                       connectionToAssignmentGroups.push(establishConnection.save())

//                                                       connectionToAssignmentGroups.push(AddStudentToClassGroup(assignmentGroups[index]._id, studentId))

//                                                 }

//                                           })

//                               }

//                               Promise.all(connectionToAssignmentGroups)
//                                     .then(saveForAllAssignmentGroups => {
//                                           resolve(1);
//                                     })
//                                     .catch(err => {
//                                           console.log(err);
//                                           reject(0)
//                                     })

//                         })
//                         .catch(err => {
//                               console.log(err);
//                               reject(0)
//                         })

//             } catch (error) {
//                   console.log(error);
//                   reject(0)
//             }

//       })

// }
