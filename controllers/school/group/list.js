const mongoose = require('mongoose');
const randomize = require('randomatic');

const UserModel = require('../../../models/authentication/userModel');
const ClassModel = require('../../../models/classes/classModel');


const addSchoolGroup = (req, res, next) => {

      console.log("req.params");
      console.log(req.params);

      try {
            if (req.params.schoolId) {

                  let schoolId = req.params.schoolId;

                  UserModel.findOne({
                        _id: schoolId,
                        isActive: true
                  })
                        .exec()
                        .then(schoolData => {

                              if (schoolData) {

                                    ClassModel.find({
                                          createdBy: schoolId,
                                          isActive: true
                                    })
                                          .sort({
                                                date: 1
                                          })
                                          .exec()
                                          .then(ClassesFound => {

                                                if (ClassesFound.length > 0) {

                                                      let ClassList = new Array();

                                                      ClassesFound.forEach(classDetails => {

                                                            ClassList.push({
                                                                  _id: classDetails._id,
                                                                  grade: classDetails.grade,
                                                                  groupPic: classDetails.groupPic ? classDetails.groupPic : "",
                                                                  section: classDetails.section ? classDetails.section : ""
                                                            })

                                                      });

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            groupList : ClassList,
                                                            message: "Data Found..!!"
                                                      });

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "No Groups exists..!!"
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

module.exports = addSchoolGroup;