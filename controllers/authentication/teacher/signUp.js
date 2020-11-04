const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const TeacherModel = require('../../../models/authentication/userModel');
// const UserVerification = require('../../../models/authentication/userVerificationModel');



const signUp = (req, res) => {

      let profilePicturePath = req.file ? req.file.path.replace(/\\/g, '/') : "";

      if (req.body.firstName && req.body.surName && req.body.emailId && req.body.mobileNo) { //&& req.body.notificationId

            let firstName = req.body.firstName;
            let surName = req.body.surName;
            let emailId = req.body.emailId;
            let mobileNo = req.body.mobileNo;

            let schoolName = req.body.schoolName;
            let schoolBranch = req.body.schoolBranch;
            let schoolAddress = req.body.schoolAddress;
            let schoolCity = req.body.schoolCity;
            let schoolEmailId = req.body.schoolEmailId;
            let schoolContactNumber = req.body.schoolContactNumber;

            // let notificationId = req.body.notificationId;

            TeacherModel.findOne({
                  $or: [{
                        emailId,
                        $or: [{
                              type: 0, //teacher
                        }, {
                              type: 2, //school
                        }, {
                              type: 3, //coordinater
                        }]
                  }, {
                        mobileNo,
                        $or: [{
                              type: 0, //teacher
                        }, {
                              type: 2, //school
                        }, {
                              type: 3, //coordinater
                        }]
                  }],
                  isActive: true
            })
                  .exec()
                  .then(user => {

                        if (!user) {

                              bcrypt.hash(mobileNo, 13, (err, hash) => {
                                    if (err) {

                                          return res.status(200).json({
                                                statusCode: 0,
                                                error: err
                                          });

                                    } else {

                                          const TeacherSignUp = new TeacherModel({
                                                _id: new mongoose.Types.ObjectId(),
                                                firstName,
                                                surName,
                                                emailId,
                                                mobileNo,
                                                type: 0,
                                                password: hash,
                                                schoolName,
                                                schoolBranch,
                                                schoolAddress,
                                                schoolCity,
                                                schoolEmailId,
                                                schoolContactNumber,
                                                profilePic: profilePicturePath ? profilePicturePath : "",
                                                // notificationId
                                          });

                                          TeacherSignUp.save()
                                                .then(async result => {

                                                      return res.status(200).json({
                                                            statusCode: "1",
                                                            message: 'Teacher saved successfully..!!'
                                                      });

                                                })
                                                .catch(err => {
                                                      console.log(err);

                                                      let errorMessage = "";

                                                      if (err.name == "ValidationError") {
                                                            errorMessage = "Please fill all fields correctly..!!";
                                                      } else {
                                                            errorMessage = "Something went wrong. Please try again..!!";
                                                      }

                                                      return res.status(200).json({
                                                            statusCode: "0",
                                                            message: errorMessage
                                                      });

                                                });


                                    }
                              });

                        } else {
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: user.emailId == emailId && user.mobileNo == mobileNo ? "EmailId and Mobile No Already Registered..!" : user.emailId == emailId ? "EmailId Already Registered..!" : "Mobile No Already Registered..!"
                              });

                        }
                  })
                  .catch(err => {
                        console.log(err);
                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try again..!!"
                        });

                  });


      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = signUp