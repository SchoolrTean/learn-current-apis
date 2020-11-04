const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const viewTeacherProfile = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, "", async (error, response) => {

                  console.log(response);

                  if (response && response.statusCode != "0") {

                        console.log(response.teacherData);
                        return res.status(200).json({
                              statusCode: "1",
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
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = viewTeacherProfile