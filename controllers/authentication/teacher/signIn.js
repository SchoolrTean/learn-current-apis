const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TeacherModel = require('../../../models/authentication/userModel');

const teacherSignIn = (req, res, next) => {

      const emailId = req.body.emailId.toLowerCase();
      const password = req.body.password;
      const notificationId = req.body.notificationId;

      TeacherModel.findOne({
                  emailId,
                  $or: [{
                        type: 0, // teacher
                  }, {
                        type: 2, // school
                  }, {
                        type: 3, // coordinator
                  }]

            }).exec()
            .then(user => {

                  if (!user) {

                        res.status(200).json({
                              statusCode: 0,
                              message: "Account Does Not Exist With This EmailID...!!"
                        });

                  } else {

                        bcrypt.compare(password, user.password, (err, success) => {

                              if (success) {

                                    if (user.isActive == true) //if user is a teacher
                                    {
                                          TeacherModel.updateOne({
                                                      _id: user._id
                                                }, {
                                                      notificationId
                                                }).exec()
                                                .then(updated => {

                                                      let name = user.firstName ? user.firstName + "" + user.surName : user.schoolName;
                                                      let role = user.type == 0 ? user.schoolId ? "School Teacher" : "Teacher" : user.type == 2 ? "School" : "Coordinator";

                                                      const token = jwt.sign({
                                                            name: name,
                                                            role
                                                      }, process.env.JWT_SECRET, {
                                                            expiresIn: "24d"
                                                      });

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            userId: user._id,
                                                            emailId: user.emailId ? String(user.emailId) : "",
                                                            mobileNo: user.mobileNo ? String(user.mobileNo) : "",
                                                            role,

                                                            firstName: user.firstName ? user.firstName : "",
                                                            surName: user.surName ? user.surName : "",

                                                            schoolName: user.schoolName ? user.schoolName : "",
                                                            schoolBranch: user.schoolBranch ? user.schoolBranch : "",
                                                            schoolAddress: user.schoolAddress ? user.schoolAddress : "",
                                                            schoolCity: user.schoolCity ? user.schoolCity : "",
                                                            schoolEmailId: user.schoolEmailId ? user.schoolEmailId : "",
                                                            schoolContactNumber: user.schoolContactNumber ? user.schoolContactNumber : "",

                                                            profilePic: user.profilePic ? user.profilePic : "",

                                                            tokenId: token,
                                                            message: 'Details Saved Successfully'
                                                      })
                                                })
                                                .catch(err => {
                                                      console.log(err);
                                                      res.status(200).json({
                                                            statusCode: 0,
                                                            message: "Something went wrong..! Please try later...!!!"
                                                      });
                                                });
                                          // } 
                                          // else if (user.isActive == false) {

                                          //       OTP.sendOtp(_mobileNo, messageType = "2")
                                          //             .then(response => {

                                          //                   if (response.statusCode == 1) {
                                          //                         res.status(200).json({
                                          //                               statusCode: "3",
                                          //                               verificationCode: response.verificationCode,
                                          //                               message: "Verification code sent to registered mobileNo..!!"
                                          //                         })
                                          //                   } else {
                                          //                         res.status(200).json({
                                          //                               statusCode: "0",
                                          //                               message: "Something went wrong. Please try again..!!"
                                          //                         })
                                          //                   }
                                          //             })
                                          //             .catch(err => {
                                          //                   console.log(err);
                                          //                   res.status(200).json({
                                          //                         statusCode: "0",
                                          //                         message: "Something went wrong. Please try again..!!"
                                          //                   })
                                          //             })

                                    } else {
                                          res.status(200).json({
                                                statusCode: 0,
                                                message: "Access Denied...!!"
                                          });
                                    }
                              } else {
                                    res.status(200).json({
                                          statusCode: 0,
                                          message: "EmailId or Password is incorrect..!"
                                    })
                              }
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

module.exports = teacherSignIn;