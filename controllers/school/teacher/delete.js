const UserModel = require('../../../models/authentication/userModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');
const SchoolTeacherConnectionModel = require('../../../models/school/schoolTeacherConnectionModel');


const deleteSchoolTeacher = (req, res, next) => {

      console.log(req.body);

      try {
            if (req.params.schoolId && req.params.teacherId) {

                  let schoolId = req.params.schoolId;
                  let teacherId = req.params.teacherId;

                  UserModel.findOne({
                        _id: schoolId,
                        type: 2, //school
                        isActive: true
                  })
                        .exec()
                        .then(schoolData => {

                              if (schoolData) {

                                    UserModel.findOne({
                                          _id: teacherId,
                                          type: 0, //school
                                          schoolId,
                                          isActive: true
                                    })
                                          .exec()
                                          .then(teacherData => {

                                                if (teacherData) {

                                                      ClassTeacherConnectionModel.find({
                                                            schoolId,
                                                            teacherId,
                                                            isActive: true
                                                      })
                                                            .exec()
                                                            .then(teacherAssignedClasses => {

                                                                  if (teacherAssignedClasses.length > 0) {

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: 'Remove Assigned Classes ...!!'
                                                                        });

                                                                  } else {

                                                                        SchoolTeacherConnectionModel.updateOne({
                                                                              schoolId,
                                                                              teacherId,
                                                                              isActive: true
                                                                        }, {
                                                                              $set: {
                                                                                    isActive: false
                                                                              }
                                                                        })
                                                                              .exec()
                                                                              .then(schoolConnectionRemoved => {

                                                                                    if (schoolConnectionRemoved.ok == 1) {

                                                                                          UserModel.updateOne({
                                                                                                _id: teacherId
                                                                                          }, {
                                                                                                $set: {
                                                                                                      isActive: false
                                                                                                }
                                                                                          })
                                                                                                .exec()
                                                                                                .then(teacherRemoved => {

                                                                                                      if (teacherRemoved.nModified == 1) {
                                                                                                            res.status(200).json({
                                                                                                                  statusCode: "1",
                                                                                                                  message: 'Delete Successfull...!!'
                                                                                                            });
                                                                                                      } else {
                                                                                                            res.status(200).json({
                                                                                                                  statusCode: "0",
                                                                                                                  message: 'Something Went Wrong. Please Try Later...!!'
                                                                                                            });
                                                                                                      }

                                                                                                })
                                                                                                .catch(err => {
                                                                                                      console.log(err);

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "0",
                                                                                                            message: 'Something Went Wrong. Please Try Later...!!'
                                                                                                      });
                                                                                                })

                                                                                    } else {
                                                                                          res.status(200).json({
                                                                                                statusCode: "0",
                                                                                                message: 'Something Went Wrong. Please Try Later...!!'
                                                                                          });
                                                                                    }

                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: 'Something Went Wrong. Please Try Later...!!'
                                                                                    });
                                                                              })

                                                                  }

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: 'Something Went Wrong. Please Try Later...!!'
                                                                  });
                                                            })

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: 'Something Went Wrong. Please Try Later...!!'
                                                      });

                                                }

                                          }).catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: 'Something Went Wrong. Please Try Later...!!'
                                                });
                                          })

                              } else {

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: 'Something Went Wrong. Please Try Later...!!'
                                    });

                              }

                        }).catch(err => {
                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: 'Something Went Wrong. Please Try Later...!!'
                              });
                        })



            } else {
                  return res.status(200).json({
                        statusCode: "0",
                        message: "All fields are mandatory..!!"
                  });
            }

      } catch (error) {
            res.status(200).json({
                  statusCode: "0",
                  message: 'Something Went Wrong. Please Try Later...!!'
            });
      }

}

module.exports = deleteSchoolTeacher;