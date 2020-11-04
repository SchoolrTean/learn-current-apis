const StudentModel = require('../../../../models/authentication/userModel');

const bcrypt = require('bcrypt');

const changeTeacherPassword = (req, res, next) => {

      console.log(req.params);

      console.log(req.body);

      if (req.params.studentId && req.body.oldPassword && req.body.newPassword) {

            let studentId = req.params.studentId;

            StudentModel.findOne({
                        _id: studentId,
                        type: true, //Student
                        isActive: true
                  })
                  .then(studentRecord => {

                        if (studentRecord) {

                              let oldPassword = req.body.oldPassword;
                              let newPassword = req.body.newPassword;

                              if (oldPassword != newPassword) {

                                    bcrypt.compare(oldPassword, studentRecord.password, (err, success) => {

                                          if (err) {
                                                console.log(err);
                                                res.status(200).json({
                                                      statusCode: 0,
                                                      message: "Something went wrong..! Please try later...!!"
                                                })
                                          }

                                          if (success) {

                                                bcrypt.hash(newPassword, 13, (err, hash) => {

                                                      if (err) {

                                                            res.status(200).json({
                                                                  status: 0,
                                                                  error: err
                                                            });

                                                      } else {

                                                            StudentModel.updateOne({
                                                                        _id: studentId,
                                                                        type: true, //Student
                                                                        isActive: true
                                                                  }, {
                                                                        $set: {
                                                                              password: hash
                                                                        }
                                                                  })
                                                                  .exec()
                                                                  .then(passwordUpdated => {

                                                                        if (passwordUpdated) {

                                                                              res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    message: "Password has been changed successfully...!!"
                                                                              })

                                                                        } else {

                                                                              res.status(200).json({
                                                                                    statusCode: 0,
                                                                                    message: "Something went wrong..! Please try later...!!"
                                                                              })

                                                                        }

                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);
                                                                        res.status(200).json({
                                                                              statusCode: 0,
                                                                              message: "Something went wrong..! Please try later...!!"
                                                                        })
                                                                  })

                                                      }
                                                });

                                          } else {
                                                res.status(200).json({
                                                      statusCode: 0,
                                                      message: "Old Password did not match...!!"
                                                });
                                          }
                                    })

                              } else {

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Old and New Passwords. Cannot be same...!!"
                                    })

                              }

                        } else {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something Went Wrong. Please try later..!!"
                              });

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        res.status(200).json({
                              statusCode: "0",
                              message: "Something Went Wrong. Please try later..!!"
                        });
                  })


      } else {
            res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = changeTeacherPassword