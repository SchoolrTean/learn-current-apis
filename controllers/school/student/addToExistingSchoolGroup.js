const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const UserModel = require('../../../models/authentication/userModel');
const ClassModel = require('../../../models/classes/classModel');
// const TeacherGroupModel = require('../../../models/group/teacherGroupModel');
// const ConnectionModel = require('../../../models/group/connectionModel')
// const ChatConnectionModel = require('../../../models/chat/chatConnectionModel');
const SchoolStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const validator = require("email-validator");

mongoose.set('debug', true)


const CreateNewStudent = (firstName, surName, mobileNo, emailId, admissionNumber) => {

      return new Promise((resolve, reject) => {

            try {

                  console.log(admissionNumber);

                  bcrypt.hash(admissionNumber, 13, (err, hash) => {

                        if (err) {
                              console.log(err);

                              reject(0)

                        } else {

                              const TeacherData = new UserModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    firstName,
                                    surName,
                                    emailId,
                                    mobileNo,
                                    password: hash,
                                    type: 1, //Student
                              });

                              TeacherData.save()
                                    .then(success => {
                                          resolve(success._id);
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



const JoinToSchoolClass = (firstName, surName, admissionNumber, mobileNo, emailId, invitationType, studentId, classId, schoolId, subjects, secondLanguage, thirdLanguage) => {

      return new Promise((resolve, reject) => {

            try {

                  const ConnectionData = new SchoolStudentConnectionModel({
                        _id: new mongoose.Types.ObjectId(),
                        schoolId,
                        classId,
                        subjects: subjects,
                        secondLanguage,
                        thirdLanguage,
                        firstName,
                        surName,
                        mobileNo,
                        emailId,
                        admissionNumber,
                        connectionStatus: invitationType, //0-Not invited 1-Invited
                  });

                  if (studentId) {
                        ConnectionData.studentId = studentId
                  }

                  ConnectionData.save()
                        .then(savedGroupConnection => {

                              console.log("Saved Group Connection For Student" + firstName);
                              resolve(1);

                        })
                        .catch(err => {
                              console.log(err);
                              reject(0);
                        })

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

                  let emailIdsData = req.body.emailIdsData.split(',');

                  let formattedMobileNosData = MobileNosData.filter(function (el) {
                        return el != null;
                  });

                  let formattedEmailIds = emailIdsData.filter(function (el) {
                        return el != null && el != '';
                  });

                  let validatedEmailIds = formattedEmailIds.filter(function (el) {
                        return validator.validate(el) == 1;
                  });

                  let secondLanguageData = req.body.secondLanguageData.toLowerCase();
                  let thirdLanguageData = req.body.thirdLanguageData.toLowerCase();

                  let secondLanguageList = secondLanguageData.split(',');
                  let thirdLanguageList = thirdLanguageData.split(',')

                  console.log(validatedEmailIds);
                  console.log(formattedEmailIds);

                  console.log(formattedEmailIds.length)
                  console.log(validatedEmailIds.length)

                  if (formattedEmailIds.length == validatedEmailIds.length) {

                        if (studentFirstNameData.length == studentSurNameData.length && admissionNumbersData.length == MobileNosData.length && emailIdsData.length == MobileNosData.length && studentFirstNameData.length == admissionNumbersData.length && (secondLanguageList.length == 0 || secondLanguageList.length == studentFirstNameData.length) && (thirdLanguageList.length == 0 || thirdLanguageList.length == studentFirstNameData.length)) {

                              UserModel.findOne({
                                    _id: schoolId,
                                    isActive: true
                              })
                                    .exec()
                                    .then(schoolData => {

                                          if (schoolData) {

                                                ClassModel.findOne({
                                                      _id: classId,
                                                      createdBy: schoolId,
                                                      isActive: true
                                                })
                                                      .exec()
                                                      .then(async classFound => {

                                                            if (classFound) {

                                                                  // teacherGroupModel.find({
                                                                  //       schoolGroupId: groupId,
                                                                  // })

                                                                  let studentErrorList = new Array();

                                                                  let studentSavedList = new Array();

                                                                  for (let index = 0; index < studentFirstNameData.length; index++) {

                                                                        if ((emailIdsData[index] || !emailIdsData[index].trim()) || (MobileNosData[index] || !MobileNosData[index].trim())) {


                                                                              let query = "";
                                                                              let mobileNo = MobileNosData[index].trim();
                                                                              let emailId = emailIdsData[index].trim();

                                                                              if (emailId && mobileNo) {
                                                                                    query = {
                                                                                          $or: [{
                                                                                                mobileNo,
                                                                                          }, {
                                                                                                emailId,
                                                                                          }

                                                                                          ],
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

                                                                                                      if (!student.emailId || student.emailId == emailIdsData[index]) {
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
                                                                                                      emailId: emailIdsData[index],
                                                                                                })

                                                                                          } else {

                                                                                                if (invitationType == 1) { //Connected

                                                                                                      if (!existingStudentId) {
                                                                                                            existingStudentId = await CreateNewStudent(studentFirstNameData[index], studentSurNameData[index], MobileNosData[index], emailIdsData[index], admissionNumbersData[index])
                                                                                                      }

                                                                                                      studentSavedList.push(JoinToSchoolClass(studentFirstNameData[index], studentSurNameData[index], admissionNumbersData[index], MobileNosData[index], emailIdsData[index], invitationType, existingStudentId, classId, schoolId, classFound.subjects, secondLanguageList[index], thirdLanguageList[index]))

                                                                                                      // studentSavedList.push(JoinToAllAssignmentGroup(MobileNosData[index], existingStudentId, groupId))

                                                                                                } else if (invitationType == 0) { //just Invited

                                                                                                      studentSavedList.push(JoinToSchoolClass(studentFirstNameData[index], studentSurNameData[index], admissionNumbersData[index], MobileNosData[index], emailIdsData[index], invitationType, existingStudentId, classId, schoolId, classFound.subjects, secondLanguageList[index], thirdLanguageList[index]))

                                                                                                }

                                                                                          }

                                                                                    })
                                                                                    .catch(err => {
                                                                                          console.log(err);

                                                                                    })


                                                                        } else {
                                                                              console.log("Console");
                                                                        }


                                                                  }

                                                                  Promise.all(studentSavedList)
                                                                        .then(allStudentsSaved => {

                                                                              return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    studentErrorList,
                                                                                    message: "Successfull...!!"
                                                                              });

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

                        res.status(200).json({
                              statusCode: "0",
                              message: "Please Enter Valid EmailIds..!!"
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
//                         .then(assignmentGroups => {

//                               let connectionToAssignmentGroups = new Array();

//                               for (let index = 0; index < assignmentGroups.length; index++) {

//                                     const establishConnection = new ConnectionModel({
//                                           _id: mongoose.Types.ObjectId(),
//                                           studentId,
//                                           teacherId: assignmentGroups[index].teacherId,
//                                           groupId: assignmentGroups[index]._id,
//                                           studentMobileNo: mobileNo,
//                                           connectionStatus: "2"
//                                     })

//                                     connectionToAssignmentGroups.push(establishConnection.save())

//                                     const establishChatConnection = new ChatConnectionModel({
//                                           _id: new mongoose.Types.ObjectId(),
//                                           studentId,
//                                           teacherId: assignmentGroups[index].teacherId,
//                                           groupId: [assignmentGroups[index]._id],
//                                     })


//                                     connectionToAssignmentGroups.push(establishChatConnection.save())

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

