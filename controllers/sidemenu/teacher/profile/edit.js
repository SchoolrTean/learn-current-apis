const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const TeacherModel = require('../../../../models/authentication/userModel');


const editTeacherProfile = (req, res, next) => {
      let _profilePicPath = "";

      if (req.file) {
            _profilePicPath = req.file.path.replace(/\\/g, '/');
      }

      console.log(req.body);

      console.log(_profilePicPath);

      if (req.body.teacherId && ((req.body.firstName && req.body.editType == 1) || (_profilePicPath != "" && req.body.editType == 2))) {

            let teacherId = req.body.teacherId;

            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, "", (error, response) => {

                  console.log(response);

                  if (response && response.statusCode != "0") {

                        let updateQuery = {};

                        if (req.body.editType == 1) {

                              updateQuery.firstName = req.body.firstName;
                              updateQuery.surName = req.body.surName;
                              updateQuery.emailId = req.body.emailId;
                              updateQuery.schoolName = req.body.schoolName;
                              updateQuery.schoolBranch = req.body.schoolBranch;
                              updateQuery.schoolLocation = req.body.schoolLocation;

                        } else {
                              updateQuery.profilePic = _profilePicPath;
                        }

                        console.log(updateQuery);

                        TeacherModel.updateOne({
                                    _id: teacherId
                              }, {
                                    $set: updateQuery
                              })
                              .then(profileUpdated => {

                                    console.log(profileUpdated);

                                    VerifyTeacher(teacherId, "", (error, response) => {

                                          console.log(response);

                                          if (response && response.statusCode != "0") {

                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      teacherId,
                                                      firstName: response.teacherData.firstName,
                                                      surName: response.teacherData.surName ? response.teacherData.surName : "",
                                                      mobileNo: String(response.teacherData.mobileNo),
                                                      profilePic: response.teacherData.profilePic ? response.teacherData.profilePic : "",
                                                      emailId: response.teacherData.emailId ? response.teacherData.emailId : "",
                                                      schoolName: response.teacherData.schoolName ? response.teacherData.schoolName : "",
                                                      schoolBranch: response.teacherData.schoolBranch ? response.teacherData.schoolBranch : "",
                                                      schoolLocation: response.teacherData.schoolLocation ? response.teacherData.schoolLocation : "",
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

            })
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = editTeacherProfile