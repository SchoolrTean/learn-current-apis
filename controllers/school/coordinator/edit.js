const UserModel = require('../../../models/authentication/userModel');


const editSchoolCoordinator = (req, res, next) => {

      console.log(req.body);

      try {
            if (req.params.schoolId && req.params.coordinatorId && req.body.firstName && req.body.surName) {

                  let schoolId = req.params.schoolId;
                  let coordinatorId = req.params.coordinatorId;
                  let firstName = req.body.firstName; //Data
                  let surName = req.body.surName; //Data

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

                                                      UserModel.updateOne({
                                                                  _id: coordinatorId
                                                            }, {
                                                                  $set: {
                                                                        firstName,
                                                                        surName
                                                                  }
                                                            })
                                                            .exec()
                                                            .then(updated => {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: 'Update Successfull...!!'
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

module.exports = editSchoolCoordinator;