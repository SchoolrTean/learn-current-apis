const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const TeacherModel = require('../../../../models/authentication/userModel');
const UserVerificationModel = require('../../../../models/authentication/userVerificationModel');

const changeTeacherMobileNo = (req, res, next) => {

      if (req.params.teacherId && req.body.NewMobileNo) {

            let teacherId = req.params.teacherId;
            let oldMobileNo = req.body.oldMobileNo;
            let NewMobileNo = req.body.NewMobileNo;

            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        if (response.teacherData.mobileNo == oldMobileNo) {

                              if (NewMobileNo > 6000000000 && NewMobileNo.split('').length == 10) {

                                    UserVerificationModel.findOne({
                                                mobileNo: NewMobileNo,
                                                verificationStatus: 1,
                                                isActive: true
                                          }).exec()
                                          .then(mobileNoVerified => {

                                                if (mobileNoVerified) {

                                                      TeacherModel.updateOne({
                                                                  _id: teacherId
                                                            }, {
                                                                  $set: {
                                                                        mobileNo: NewMobileNo
                                                                  }
                                                            }).exec()
                                                            .then(mobileNoUpdated => {

                                                                  UserVerificationModel.remove({
                                                                              mobileNo: NewMobileNo
                                                                        }).exec()
                                                                        .then(removeVerification => {

                                                                              return res.status(200).json({
                                                                                    "statusCode": "1",
                                                                                    "message": "Mobile No Updated..!!"
                                                                              });

                                                                        }).catch(err => {
                                                                              console.log(err);
                                                                              return res.status(200).json({
                                                                                    "statusCode": "0",
                                                                                    "message": "Something Went Wrong. Please Tsry Later..!!"
                                                                              });
                                                                        })

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);
                                                                  return res.status(200).json({
                                                                        "statusCode": "0",
                                                                        "message": "Something Went Wrong. Please Tsry Later..!!"
                                                                  });
                                                            })

                                                } else {
                                                      return res.status(200).json({
                                                            "statusCode": "0",
                                                            "message": "Access Denied..!!"
                                                      });
                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);
                                                return res.status(200).json({
                                                      "statusCode": "0",
                                                      "message": "Something Went Wrong. Please Tsry Later..!!"
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

module.exports = changeTeacherMobileNo