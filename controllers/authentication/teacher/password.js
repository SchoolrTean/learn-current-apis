const mongoose = require('mongoose');
const TeacherModel = require('../../../models/authentication/userModel');
const UserVerificationModel = require('../../../models/authentication/userVerificationModel');
const SMS = require('../../../third-party/sms/sendSms');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.forgot = (req, res) => {

      let mobileNo = req.body.mobileNo;

      if (mobileNo != "") { //check mobile No is empty

            if (mobileNo > 6000000000 && mobileNo.split('').length == 10) {


                  //Check Mobile No already exists and is Active ...!
                  let TeacherRegistered = TeacherModel.findOne({
                        mobileNo,
                        type: false, //teacher
                        isActive: true
                  }).exec()

                  //Check Mobile No already Exists...!!
                  let CheckVerificationCode = UserVerificationModel.findOne({
                        mobileNo,
                        userType: false, //teacher
                        isActive: true
                  }).exec()

                  Promise.all([TeacherRegistered, CheckVerificationCode]).then(async result => {

                              /**IF Teacher Mobile No was already had an account and is in active state then */
                              if (result[0]) {


                                    let verificationCode = Math.floor(1000 + Math.random() * 9000);

                                    //Check Code Generated
                                    if (!verificationCode) {

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later...!!"
                                          });

                                    } else {

                                          let someError = 0;

                                          if (result[1]) {

                                                try {

                                                      await UserVerificationModel
                                                            .update({
                                                                  mobileNo,
                                                                  userType: false
                                                            }, {
                                                                  $set: {
                                                                        verificationCode,
                                                                        verificationStatus: 0,
                                                                        noOfFaildAttempts: result[1].noOfFaildAttempts + 1
                                                                  }
                                                            })
                                                            .exec()

                                                } catch (error) {
                                                      console.log(error);
                                                      someError = 1;
                                                }

                                          } else {

                                                /** If Teacher Mobile No does not exist then save it */
                                                try {

                                                      const SaveVerificationCode = new UserVerificationModel({
                                                            _id: new mongoose.Types.ObjectId(),
                                                            mobileNo: mobileNo,
                                                            verificationCode: verificationCode,
                                                            userType: false
                                                      });

                                                      //Save Verification Code
                                                      await SaveVerificationCode.save()

                                                } catch (error) {
                                                      console.log(error);
                                                      someError = 1;
                                                }

                                          }


                                          if (someError == 1) {

                                                return res.status(200).json({
                                                      "statusCode": "0",
                                                      "message": "Something went wrong. Please try again..!!"
                                                })

                                          } else {

                                                let message = "OTP is " + verificationCode;

                                                //Send Verificaiotn Code to mobile No as sms
                                                await SMS.send(mobileNo, message, verificationCode)
                                                      .then(responseObj => {

                                                            console.log("responseObj");
                                                            console.log(responseObj);

                                                            if (responseObj.statusCode == "1") {

                                                                  console.log("verificationCode :" + verificationCode);

                                                                  return res.status(200).json({
                                                                        "statusCode": "1",
                                                                        "message": "Verification Code Sent..!!"
                                                                  })

                                                            } else {

                                                                  return res.status(200).json({
                                                                        "statusCode": "0",
                                                                        "message": "Please Enter Valid Mobile No..!!"
                                                                  })

                                                            }

                                                      })
                                                      .catch(err => {

                                                            console.log(err);

                                                            return res.status(200).json({
                                                                  "statusCode": "0",
                                                                  "message": "Something went wrong. Please try again..!!"
                                                            })
                                                      });

                                          }
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

      if (req.body.mobileNo != "" && req.body.password != "" && req.body.OTP && req.body.notificationId) { //check mobile No is empty

            let mobileNo = req.body.mobileNo;
            let newPassword = req.body.password;
            let notificationId = req.body.notificationId;
            let OTP = req.body.OTP;

            if (mobileNo > 6000000000 && mobileNo.split('').length == 10) {


                  //Check Mobile No already exists and is Active ...!
                  let TeacherRegistered = TeacherModel.findOne({
                        mobileNo,
                        type: false, //teacher
                        isActive: true
                  }).exec()

                  //Check Mobile No already Exists...!!
                  let CheckVerificationCode = UserVerificationModel.findOne({
                        mobileNo,
                        userType: false, //teacher
                        verificationStatus: 0
                  }).exec()

                  Promise.all([TeacherRegistered, CheckVerificationCode]).then(async result => {

                              console.log(result);

                              /**IF Teacher Mobile No was already had an account and is in active state then */
                              if (result[0] && result[1]) {

                                    if (result[1].verificationCode == OTP) {

                                          bcrypt.hash(newPassword, 13, (err, hash) => {

                                                if (err) {
                                                      console.log(err);

                                                      res.status(200).json({
                                                            "statusCode": 0,
                                                            "message": "Something went wrong..! Please try later...!!"
                                                      });

                                                } else {

                                                      TeacherModel.updateOne({
                                                                  _id: result[0]._id,
                                                                  type: false, //teacher
                                                                  isActive: true
                                                            }, {
                                                                  $set: {
                                                                        password: hash
                                                                  }
                                                            })
                                                            .exec()
                                                            .then(passwordUpdated => {

                                                                  TeacherModel.updateMany({
                                                                              mobileNo,
                                                                              type: false, //teacher
                                                                              isActive: true
                                                                        }, {
                                                                              $set: {
                                                                                    notificationId
                                                                              }
                                                                        })
                                                                        .exec()
                                                                        .then(notificationUpdated => {

                                                                              if (passwordUpdated) {


                                                                                    UserVerificationModel.remove({
                                                                                                mobileNo,
                                                                                                userType: false, //teacher
                                                                                                isActive: true
                                                                                          }).exec()
                                                                                          .then(userData => {

                                                                                                const token = jwt.sign({
                                                                                                      userId: result[0]._id,
                                                                                                      name: result[0].name
                                                                                                }, process.env.JWT_SECRET, {
                                                                                                      expiresIn: "24d"
                                                                                                });

                                                                                                return res.status(200).json({
                                                                                                      statusCode: "1",
                                                                                                      teacherId: result[0]._id,
                                                                                                      mobileNo: String(result[0].mobileNo),

                                                                                                      firstName: result[0].firstName,
                                                                                                      surName: result[0].surName ? result[0].surName : "",

                                                                                                      profilePic: result[0].profilePic ? result[0].profilePic : "",

                                                                                                      tokenId: token,
                                                                                                      message: 'Data Found...!'
                                                                                                })

                                                                                          })
                                                                                          .catch(err => {

                                                                                                console.log(err);
                                                                                                res.status(200).json({
                                                                                                      statusCode: 0,
                                                                                                      message: "Something went wrong..! Please try later...!!!"
                                                                                                })

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

                                          UserVerificationModel
                                                .update({
                                                      mobileNo,
                                                      userType: false,
                                                      isActive: true
                                                }, {
                                                      $set: {
                                                            noOfFaildAttempts: result[1].noOfFaildAttempts + 1
                                                      }
                                                })
                                                .exec()
                                                .then(done => {
                                                      res.status(200).json({
                                                            "statusCode": 0,
                                                            "message": "OTP Entered Was Incorrect...!!"
                                                      });
                                                })
                                                .catch(err => {

                                                      console.log(err);

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Something Went Wrong. Please Try Later...!!"
                                                      });

                                                })

                                    }


                              } else {

                                    return res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Access Denied..!"
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