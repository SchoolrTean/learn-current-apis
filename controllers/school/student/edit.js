const UserModel = require('../../../models/authentication/userModel');
const ClassModel = require('../../../models/classes/classModel');
const SchoolStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');


const SchoolGroupStudentList = (req, res, next) => {

      try {

            if (req.params.schoolId && req.params.classId && req.params.classStudentConnectionId) {

                  let schoolId = req.params.schoolId;

                  let classId = req.params.groupId; //Data

                  let classStudentConnectionId = req.params.classStudentConnectionId;

                  let emailId = req.body.emailId;
                  let mobileNo = req.body.mobileNo;
                  let firstName = req.body.firstName;
                  let surName = req.body.surName;
                  let admissionNumber = req.body.admissionNumber;
                  let subjects = req.body.subjects;
                  let secondLanguage = req.body.secondLanguage;
                  let thirdLanguage = req.body.thirdLanguage

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

                                                      SchoolStudentConnectionModel.findOne({
                                                            _id: classStudentConnectionId,
                                                            schoolId,
                                                            classId,
                                                            isActive: true
                                                      })
                                                            .exec()
                                                            .then(studentList => {

                                                                  if (studentList.length > 0) {

                                                                        let studentListArray = new Array();

                                                                        for (let index = 0; index < studentList.length; index++) {
                                                                              const student = studentList[index];

                                                                              studentListArray.push({
                                                                                    connectionId: student._id,
                                                                                    firstName: student.firstName,
                                                                                    surName: student.surName,
                                                                                    admissionNumber: student.admissionNumber,
                                                                                    secondLanguage: student.secondLanguage ? student.secondLanguage : "",
                                                                                    thirdLanguage: student.thirdLanguage ? student.thirdLanguage : ""
                                                                              })

                                                                        }

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              classPic: classFound.groupPic ? classFound.groupPic : "",
                                                                              className: classFound.grade + " " + classFound.section,
                                                                              studentList: studentListArray,
                                                                              message: "Data Found..!!"
                                                                        });

                                                                  } else {

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              classPic: classFound.groupPic ? classFound.groupPic : "",
                                                                              className: classFound.grade + " " + classFound.section,
                                                                              studentList: [],
                                                                              message: "No RecordsFound..!!"
                                                                        });

                                                                  }

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something went wrong. Please try later..!!"
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

      } catch (error) {

            console.log(error);

            res.status(200).json({
                  statusCode: "0",
                  message: "Something went Wrong. Please try later..!!"
            })

      }
}



module.exports = SchoolGroupStudentList;