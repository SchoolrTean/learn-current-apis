const mongoose = require('mongoose');

const SMS = require('../../../third-party/sms/sendSms');

const TeacherModel = require('../../../models/authentication/userModel');
const UserVerificationModel = require('../../../models/authentication/userVerificationModel');

exports.send = (req, res) => {

      let mobileNo = req.body.mobileNo;

      if (mobileNo != "") { //check mobile No is empty

            if (mobileNo > 6000000000 && mobileNo.split('').length == 10) {


                  //Check Mobile No already exists and is Active ...!
                  let TeacherRegistered = TeacherModel.findOne({
                        mobileNo,
                        // type: false, //teacher
                        $or: [{
                              type: 0, //teacher
                        }, {
                              type: 2, //school
                        }, {
                              type: 3, //coordinater
                        }],
                        isActive: true
                  }).exec()

                  //Check Mobile No already Exists...!!
                  let CheckVerificationCode = UserVerificationModel.findOne({
                        mobileNo,
                        userType: false, //teacher
                        isActive: true
                  }).exec()

                  Promise.all([TeacherRegistered, CheckVerificationCode]).then(async result => {

                              /**IF Teacher Mobile No was already had an account and is in active state ten */
                              if (result[0]) {

                                    return res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Mobile no already registered with us..! Please login..!"
                                    });

                              } else {

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

                                                      if (result[1].noOfFaildAttempts == 5) {
                                                            someError = 2; //Maximum number of Resend OTP attempts has been completed 
                                                      } else {
                                                            await UserVerificationModel
                                                                  .update({
                                                                        mobileNo,
                                                                        userType: false, //teacher
                                                                        isActive: true
                                                                  }, {
                                                                        $set: {
                                                                              verificationCode,
                                                                              verificationStatus: 0,
                                                                              noOfFaildAttempts: result[1].noOfFaildAttempts + 1
                                                                        }
                                                                  })
                                                                  .exec()
                                                      }

                                                } catch (error) {
                                                      console.log(error);
                                                      someError = 1;
                                                }

                                          } else {

                                                /** If Teacher Mobile No does not exist then save it */
                                                try {

                                                      const SaveVerificationCode = new UserVerificationModel({
                                                            _id: new mongoose.Types.ObjectId(),
                                                            mobileNo,
                                                            verificationCode,
                                                            userType: false, //teacher
                                                            noOfFaildAttempts: 0
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

                                          } else if (someError == 2) {

                                                return res.status(200).json({
                                                      "statusCode": "0",
                                                      "message": "Maximum no of OTP attempts completed.!! Please call your customer care..!!"
                                                })

                                          } else {

                                                let message = "Thank You For Choosing Schoolr. Your OTP is " + verificationCode;

                                                //Send Verificaiotn Code to mobile No as sms
                                                await SMS.send(mobileNo, message, verificationCode)
                                                      .then(responseObj => {

                                                            console.log("responseObj");
                                                            console.log(responseObj);

                                                            if (responseObj.statusCode == "1") {

                                                                  return res.status(200).json({
                                                                        "statusCode": "1",
                                                                        "verificationCode": verificationCode,
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


exports.verify = (req, res) => {

      let mobileNo = req.body.mobileNo;
      let verificationCode = req.body.verificationCode;

      if (mobileNo != "" && verificationCode != "") {

            //Check Mobile No already exists and is Active ...!
            let TeacherAlreadyRegistered = TeacherModel.findOne({
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

            Promise.all([TeacherAlreadyRegistered, CheckVerificationCode])
                  .then(result => {

                        //CheckVerificationCode Result Was Found
                        if (result[1]) {

                              if (!result[1].verificationStatus) { // If verificationStatus is 0 i.e Verification code sent but not verified

                                    if (result[1].verificationCode == verificationCode) { //verificatoin Code matched

                                          UserVerificationModel.updateOne({
                                                      mobileNo,
                                                      userType: false, //teacher
                                                      isActive: true
                                                }, {
                                                      $set: {
                                                            verificationStatus: 1
                                                      }
                                                })
                                                .exec()
                                                .then(verified => {

                                                      return res.status(200).json({
                                                            statusCode: "1",
                                                            message: 'Mobile No has been verified..!!'
                                                      })

                                                }).catch(err => {
                                                      console.log(err);

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Something went wrong. Please try again..!!"
                                                      });

                                                })
                                    } else {
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Verification code entered was Incorrect..!!"
                                          })
                                    }

                              } else {

                                    return res.status(200).json({
                                          statusCode: "0",
                                          message: "Mobile No has alredy been Verified..!!"
                                    })
                              }

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
                              message: "Something Went Wrong. Please Try Later...!!"
                        });

                  })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}