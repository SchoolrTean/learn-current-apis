const SMS = require('../../../../third-party/sms/sendSms');
const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const TeacherModel = require('../../../../models/authentication/userModel');
const UserVerificationModel = require('../../../../models/authentication/userVerificationModel');

const editTeacherMobileNo = (req, res, next) => {

      if (req.params.teacherId && req.body.oldMobileNo && req.body.NewMobileNo) {

            let teacherId = req.params.teacherId;
            let oldMobileNo = req.body.oldMobileNo;
            let NewMobileNo = req.body.NewMobileNo;


            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        if (response.teacherData.mobileNo == oldMobileNo) {

                              if (NewMobileNo > 6000000000 && NewMobileNo.split('').length == 10) {


                                    let mobileNo = NewMobileNo;

                                    //Check Mobile No already exists and is Active ...!
                                    let TeacherRegistered = TeacherModel.findOne({
                                          mobileNo,
                                          type: false, //teacher
                                          isActive: true
                                    }).exec()

                                    //Check Mobile No already Exists...!!
                                    let CheckVerificationCode = UserVerificationModel.findOne({
                                          mobileNo
                                    }).exec()

                                    Promise.all([TeacherRegistered, CheckVerificationCode]).then(async result => {

                                                /**New MobileNo was already registered*/
                                                if (result[0]) {

                                                      return res.status(200).json({
                                                            "statusCode": "0",
                                                            "message": "Mobile no already registered with us..! Please Use Some Other Mobile No..!"
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

                                                                  if (result[1].noOfFaildAttempts < 5) {

                                                                        try {

                                                                              await UserVerificationModel
                                                                                    .update({
                                                                                          mobileNo
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
                                                                        someError = 2;
                                                                  }

                                                            } else {

                                                                  /** If Teacher Mobile No does not exist then save it */
                                                                  try {

                                                                        const SaveVerificationCode = new UserVerificationModel({
                                                                              _id: new mongoose.Types.ObjectId(),
                                                                              mobileNo,
                                                                              verificationCode
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

                                                                  let message = "Your OTP is " + verificationCode;

                                                                  //Send Verificaiotn Code to mobile No as sms
                                                                  await SMS.send(mobileNo, message, verificationCode)
                                                                        .then(responseObj => {

                                                                              console.log("responseObj");
                                                                              console.log(responseObj);

                                                                              if (responseObj.statusCode == "1") {

                                                                                    return res.status(200).json({
                                                                                          "statusCode": "1",
                                                                                          "verificationCode": verificationCode,
                                                                                          "message": "Verification Code Sent to ..!!"
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
                                    statusCode: "0",
                                    message: "Old Mobile No Mismatch..!!"
                              })

                        }

                  } else {
                        return res.status(200).json({
                              statusCode: "0",
                              message: error.message
                        })
                  }

            })
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = editTeacherMobileNo