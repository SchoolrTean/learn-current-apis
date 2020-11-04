const mongoose = require('mongoose');

const StudentModel = require('../../../models/authentication/userModel');

const VerifyStudent = require('../../../middleware/verifyStudent');



const addStudent = (req, res, next) => {

      let _profilePicPath = "";

      if (req.file) {

            _profilePicPath = req.file.path.replace(/\\/g, '/');

      }

      console.log(req.body);

      if (req.body.studentId && req.body.name) {

            let _name = req.body.name;
            let studentId = req.body.studentId;

            VerifyStudent(studentId, "")
                  .then(response => {

                        if (response && response.statusCode == 1) {

                              /**Register Student Details */
                              const NewStudent = new StudentModel({
                                    _id: new mongoose.Types.ObjectId(),

                                    mobileNo: response.studentData.mobileNo,
                                    password: response.studentData.password,

                                    name: _name,
                                    profilePic: _profilePicPath ? _profilePicPath : "",
                                    notificationId: response.studentData.notificationId,
                              });

                              NewStudent.save()
                                    .then(result => {

                                          /** We will send this output to the Student */
                                          return res.status(201).json({
                                                "statusCode": "1",
                                                "message": 'New Student Added Successfully..!!'

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


                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: response.message
                              });

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: 'Soomething Went Wrong. Please Try Later...!!'
                        });

                  })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = addStudent;