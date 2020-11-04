const mongoose = require('mongoose');
const SchoolModel = require('../../../models/authentication/userModel');
const SMS = require('../../../third-party/sms/sendSms');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require("email-validator");


exports.forgot = (req, res) => {

      console.log(req.body.schoolEmailId);

      if (req.body.schoolEmailId) {

            let schoolEmailId = req.body.schoolEmailId;

            if (validator.validate(schoolEmailId)) {

                  /** School Registered ...! */
                  SchoolModel.findOne({
                              emailId: schoolEmailId,
                              type: 2, //School
                              isActive: true
                        }).exec()
                        .then(schoolRegistered => {

                              /**IF Student Mobile No was already had an account and is in active state then */
                              if (schoolRegistered) {

                                    // let verificationCode = Math.floor(1000 + Math.random() * 9000);
                                    let verificationCode = "1234";

                                    //Check Code Generated
                                    if (!verificationCode) {

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later...!!"
                                          });

                                    } else {

                                          SchoolModel.updateOne({
                                                      _id: schoolRegistered._id
                                                }, {
                                                      $set: {
                                                            verificationCode
                                                      }
                                                })
                                                .then(done => {

                                                      res.status(200).json({
                                                            "statusCode": "1",
                                                            "verificationCode": verificationCode,
                                                            "message": "Verification sent to email successfully..!"
                                                      });

                                                })
                                                .catch(err => {
                                                      console.log(err);

                                                      res.status(200).json({
                                                            "statusCode": "0",
                                                            "message": "Something Went Wrong. Please Try Later..!"
                                                      });
                                                })

                                    }

                              } else {

                                    return res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Mobile no not registered with us..! Please SignUp..!"
                                    });

                              }

                        })
                        .catch(err => {

                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something Went Wrong. Please Try Later...!!"
                              });

                        })

            } else {
                  return res.status(200).json({
                        "statusCode": "0",
                        "message": "Enter Valid Mobile Number..!!"
                  });
            }
      } else {

            return res.status(200).json({
                  "statusCode": "0",
                  "message": "All fields are mandatory..!!"
            });

      }
}


exports.reset = (req, res) => {

      if (req.body.schoolEmailId && req.body.password && req.body.OTP && req.body.notificationId) { //check mobile No is empty

            let schoolEmailId = req.body.schoolEmailId;
            let newPassword = req.body.password;
            let notificationId = req.body.notificationId;
            let OTP = req.body.OTP;

            if (validator.validate(schoolEmailId)) {

                  /** School Registered ...! */
                  SchoolModel.findOne({
                              emailId: schoolEmailId,
                              type: 2, //School
                              isActive: true
                        }).exec()
                        .then(schoolRegistered => {

                              /**IF Student Mobile No was already had an account and is in active state then */
                              if (schoolRegistered && schoolRegistered.verificationCode && schoolRegistered.verificationCode == OTP) {

                                    bcrypt.hash(newPassword, 13, (err, hash) => {

                                          if (err) {
                                                console.log(err);

                                                res.status(200).json({
                                                      "statusCode": 0,
                                                      "message": "Something went wrong..! Please try later...!!"
                                                });

                                          } else {

                                                SchoolModel.updateOne({
                                                            _id: schoolRegistered._id
                                                      }, {
                                                            $set: {
                                                                  password: hash,
                                                                  notificationId,
                                                                  verificationCode: ""
                                                            }
                                                      })
                                                      .exec()
                                                      .then(passwordUpdated => {

                                                            if (passwordUpdated) {

                                                                  const token = jwt.sign({
                                                                        schoolName: schoolRegistered.schoolName,
                                                                        role: "School"
                                                                  }, process.env.JWT_SECRET, {
                                                                        expiresIn: "24d"
                                                                  });

                                                                  return res.status(200).json({
                                                                        statusCode: "1",

                                                                        studentId: schoolRegistered._id,
                                                                        emailId: schoolRegistered.emailId,

                                                                        schoolName: schoolRegistered.schoolName,
                                                                        schoolBranch: schoolRegistered.schoolBranch ? schoolRegistered.schoolBranch : "",
                                                                        schoolAddress: schoolRegistered.schoolAddress,
                                                                        schoolCity: schoolRegistered.schoolCity,
                                                                        schoolContactNumber: schoolRegistered.schoolContactNumber,

                                                                        notificationId,
                                                                        tokenId: token,
                                                                        message: 'Data Found...!'
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
                                                                  message: "Something went wrong..! Please try later...!!!"
                                                            })
                                                      })

                                          }
                                    });


                              } else {

                                    let message = !schoolRegistered ? "Access Denied..!!" : "Incorrect Verification Code..!!";

                                    return res.status(200).json({
                                          "statusCode": "0",
                                          "message": message
                                    });

                              }

                        })
                        .catch(err => {

                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something Went Wrong. Please Try Later...!!"
                              });

                        })

            } else {
                  return res.status(200).json({
                        "statusCode": "0",
                        "message": "Enter Valid EmailId..!!"
                  });
            }
      } else {

            return res.status(200).json({
                  "statusCode": "0",
                  "message": "All fields are mandatory..!!"
            });

      }
}