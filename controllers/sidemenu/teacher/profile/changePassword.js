const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const TeacherModel = require('../../../../models/authentication/userModel');

const bcrypt = require('bcrypt');

const changeTeacherPassword = (req, res, next) => {

      if (req.params.teacherId && req.body.oldPassword && req.body.newPassword) {

            let teacherId = req.params.teacherId;

            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        let oldPassword = req.body.oldPassword;
                        let newPassword = req.body.newPassword;

                        if (oldPassword != newPassword) {

                              bcrypt.compare(oldPassword, response.teacherData.password, (err, success) => {

                                    if (err) {
                                          console.log(err);
                                          res.status(200).json({
                                                statusCode: 0,
                                                message: "Something went wrong..! Please try later...!!"
                                          })
                                    }

                                    if (success) {

                                          bcrypt.hash(newPassword, 13, (err, hash) => {

                                                if (err) {

                                                      res.status(200).json({
                                                            status: 0,
                                                            error: err
                                                      });

                                                } else {

                                                      TeacherModel.updateOne({
                                                                  _id: teacherId,
                                                                  isActive: true
                                                            }, {
                                                                  $set: {
                                                                        password: hash
                                                                  }
                                                            })
                                                            .exec()
                                                            .then(passwordUpdated => {

                                                                  if (passwordUpdated) {

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Password has been changed successfully...!!"
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
                                                                        message: "Something went wrong..! Please try later...!!"
                                                                  })
                                                            })

                                                }
                                          });

                                    } else {
                                          res.status(200).json({
                                                statusCode: 0,
                                                message: "Old Password did not match...!!"
                                          });
                                    }
                              })

                        } else {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Old and New Passwords. Cannot be same...!!"
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
            res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = changeTeacherPassword