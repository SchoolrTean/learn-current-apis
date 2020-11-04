const VerifyStudent = require('../../../../middleware/verifyStudent');
const StudentModel = require('../../../../models/authentication/userModel');


const profile = (req, res, next) => {
      let _profilePicPath = "";

      if (req.file) {
            _profilePicPath = req.file.path.replace(/\\/g, '/');
      }

      console.log(req.body);

      console.log(_profilePicPath);

      if (req.params.studentId && ((req.body.emailId && req.body.editType == 1) || (_profilePicPath != "" && req.body.editType == 2))) {

            let studentId = req.params.studentId;

            //Verify Teacher
            VerifyStudent(studentId, "")
                  .then(async response => {

                        console.log(response);

                        if (response && response.statusCode != "0") {

                              let updateQuery = {};

                              if (req.body.editType == 1) {

                                    updateQuery.emailId = req.body.emailId;

                              } else {
                                    updateQuery.profilePic = _profilePicPath;
                              }

                              console.log(updateQuery);

                              StudentModel.updateOne({
                                          _id: studentId
                                    }, {
                                          $set: updateQuery
                                    })
                                    .then(profileUpdated => {

                                          console.log(profileUpdated);

                                          VerifyStudent(studentId, "")
                                                .then(async response => {

                                                      console.log(response);

                                                      if (response && response.statusCode != "0") {

                                                            return res.status(200).json({
                                                                  statusCode: "1",
                                                                  firstName: response.studentData.firstName,
                                                                  surName: response.studentData.surName ? response.studentData.surName : "",
                                                                  mobileNo: response.studentData.mobileNo,
                                                                  profilePic: response.studentData.profilePic,
                                                                  emailId: response.studentData.emailId,
                                                                  message: "Data Found"
                                                            })

                                                      } else {
                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: error.message
                                                            })
                                                      }
                                                })

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Somoething Went Wrong. Please Try Later..!!"
                                          })
                                    })
                        } else {
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: error.message
                              })
                        }

                  }).catch(err => {
                        console.log(err);
                        return res.status(200).json({
                              statusCode: "0",
                              message: "Somoething Went Wrong. Please Try Later..!!"
                        })
                  })

      } else {

            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });

      }
}

module.exports = profile