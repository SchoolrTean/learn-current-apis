const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomize = require('randomatic');

const SchoolModel = require('../../../models/authentication/userModel');
const UserVerification = require('../../../models/authentication/userVerificationModel');


const signUp = (req, res) => {

      if (req.body.schoolName && req.body.schoolAddress && req.body.schoolCity && req.body.schoolEmailId && req.body.schoolContactNumber) { //&& req.body.location 

            let schoolName = req.body.schoolName;
            let schoolBranch = req.body.schoolBranch;
            let schoolAddress = req.body.schoolAddress;
            let schoolCity = req.body.schoolCity;
            let schoolEmailId = req.body.schoolEmailId.toLowerCase();
            let schoolContactNumber = req.body.schoolContactNumber;
            let password = '1234' //randomize('a0', 10);


            /**Check wheather emailId or contact number was already registered */
            SchoolModel.findOne({
                        emailId: schoolEmailId,
                        isActive: true
                  })
                  .exec()
                  .then(userAlreadyRegistered => {

                        if (!userAlreadyRegistered) {

                              bcrypt.hash(password, 13, (err, hash) => {

                                    if (err) {

                                          return res.status(200).json({
                                                statusCode: 0,
                                                error: err
                                          });

                                    } else {

                                          const SchoolSignUp = new SchoolModel({
                                                _id: new mongoose.Types.ObjectId(),
                                                emailId: schoolEmailId,
                                                password: hash,
                                                type: 2,//School
                                                schoolName,
                                                schoolBranch,
                                                schoolAddress,
                                                schoolCity,
                                                schoolContactNumber
                                          });

                                          SchoolSignUp.save()
                                                .then(async result => {

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            message: "School Registered Successfully...!!"
                                                      })

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

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "This email or MobileNo has already registered to the platform ..!"
                              })

                        }
                  })
                  .catch(err => {

                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try again..!!"
                        })
                  });

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = signUp