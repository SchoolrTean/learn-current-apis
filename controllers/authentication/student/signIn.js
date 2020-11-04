const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const StudentModel = require('../../../models/authentication/userModel');
const ConnectionModel = require('../../../models/group/connectionModel');

const studentSignIn = (req, res, next) => {

      if (req.body.mobileNo && req.body.password && req.body.notificationId) {
            const mobileNo = req.body.mobileNo;
            const password = req.body.password;

            const notificationId = req.body.notificationId;

            StudentModel.findOne({
                        mobileNo,
                        type: true, //Student
                        password: {
                              $exists: true
                        },
                        isActive: true
                  }).exec() //check Mobileno Exists
                  .then(user => {

                        if (!user) {

                              return res.status(200).json({
                                    statusCode: 0,
                                    message: "No Account Exists with this "
                              });

                        } else {

                              bcrypt.compare(password, user.password, (err, success) => {

                                    if (err) {
                                          res.status(200).json({
                                                statusCode: 0,
                                                message: "Something went wrong..! Please try later...!!"
                                          })
                                    }

                                    if (success) {


                                          StudentModel.updateMany({
                                                      mobileNo,
                                                      type: true, //Student
                                                      isActive: true
                                                }, {
                                                      $set: {
                                                            notificationId,
                                                            loggedIn: 1
                                                      }
                                                }).exec()
                                                .then(async updatedUserDetails => {

                                                      // if (user.loggedIn == false) {

                                                      await ConnectionModel.updateMany({
                                                            studentMobileNo: mobileNo,
                                                            isActive: true
                                                      }, {
                                                            $set: {
                                                                  connectionStatus: 2
                                                            }
                                                      })

                                                      // }


                                                      const token = jwt.sign({
                                                            userId: user._id,
                                                            firstName: user.firstName
                                                      }, process.env.JWT_SECRET, {
                                                            expiresIn: "24d"
                                                      });

                                                      return res.status(201).json({
                                                            statusCode: "1",

                                                            studentId: user._id,
                                                            mobileNo: String(user.mobileNo),

                                                            firstName: user.firstName,
                                                            surName: user.surName ? user.surName : "",
                                                            profilePic: user.profilePic ? user.profilePic : "",

                                                            tokenId: token,
                                                            message: 'Login Successfull..!!!'

                                                      });

                                                })
                                                .catch(err => {
                                                      return res.status(200).json({
                                                            statusCode: 0,
                                                            message: "Something went wrong..! Please try later...!!2"
                                                      });
                                                });


                                    } else {

                                          return res.status(200).json({
                                                statusCode: 0,
                                                message: "Mobile No or Password you have entered was wrong...!!"
                                          });

                                    }
                              });
                        }

                  })
                  .catch(err => {
                        console.log(err);
                        res.status(200).json({
                              statusCode: 0,
                              message: "Something went wrong..! Please try later...!!"
                        })
                  });
      } else {
            res.status(200).json({
                  statusCode: 0,
                  message: "All Fields Mandatory..!!"
            });
      }

}

module.exports = studentSignIn;