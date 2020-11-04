const UserModel = require('../../../models/authentication/userModel');
const ClassModel = require('../../../models/classes/classModel');


const deleteSchoolCoordinator = (req, res, next) => {

      console.log(req.body);

      try {
            if (req.params.schoolId && req.params.coordinatorId) {

                  let schoolId = req.params.schoolId;
                  let coordinatorId = req.params.coordinatorId;

                  UserModel.findOne({
                        _id: schoolId,
                        type: 2, //school
                        isActive: true
                  })
                        .exec()
                        .then(schoolData => {

                              if (schoolData) {

                                    UserModel.findOne({
                                          _id: coordinatorId,
                                          type: 3, //Coordinator
                                          schoolId,
                                          isActive: true
                                    })
                                          .exec()
                                          .then(teacherData => {

                                                if (teacherData) {

                                                      ClassModel.find({
                                                            coordinator: coordinatorId,
                                                            isActive: true
                                                      })
                                                            .exec()
                                                            .then(classesExists => {

                                                                  if (classesExists.length == 0) {

                                                                        UserModel.updateOne({
                                                                              _id: coordinatorId
                                                                        }, {
                                                                              $set: {
                                                                                    isActive: false
                                                                              }
                                                                        })
                                                                              .exec()
                                                                              .then(updated => {

                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          message: 'Delete Successfull...!!'
                                                                                    });

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
                                                                              message: 'Remove from Assigned Classes...!!'
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

module.exports = deleteSchoolCoordinator;