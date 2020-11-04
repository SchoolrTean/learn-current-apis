const VerifyTeacher = require('../../../middleware/verifyTeacher');

const checkTeacherExistsWithMobileNo = (req, res, next) => {

       if (req.params.teacherId && req.body.mobileNo) {

              let teacherId = req.params.teacherId;
              let mobileNo = req.body.mobileNo;

              VerifyTeacher(teacherId, groupId, (error, response) => {

                     if (response && response.statusCode != "0") {

                            TeacherModel.findOne({
                                          mobileNo,
                                          isActive: true
                                   })
                                   .exec()
                                   .then(teacherFound => {

                                          if (teacherFound) {

                                                 res.status(200).json({
                                                        "statusCode": "1",
                                                        "teacherDetails": [{
                                                               teacherId: teacherFound._id,
                                                               teacherName: teacherFound.name,
                                                               teacherMobileNo: String(teacherFound.mobileNo),
                                                               teacherProfilePic: teacherFound.profilePic
                                                        }],
                                                        "message": "Data Found...!!"
                                                 })

                                          } else {

                                                 res.status(200).json({
                                                        "statusCode": "0",
                                                        "teacherDetails": [],
                                                        "message": "No Records Found...!!"
                                                 })

                                          }

                                   })
                                   .catch(err => {
                                          console.log(err);
                                   })

                     } else {
                            res.status(200).json({
                                   statusCode: "0",
                                   message: error.message
                            })
                     }

              });



       } else {
              res.status(200).json({
                     "statusCode": "0",
                     "message": "All Fields are mandatory...!!"
              })
       }

}

module.exports = checkTeacherExistsWithMobileNo;