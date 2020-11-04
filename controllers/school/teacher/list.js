const UserModel = require('../../../models/authentication/userModel');


const SchoolTeacherList = (req, res, next) => {

      console.log(req.body);

      try {
            if (req.params.schoolId) {

                  let schoolId = req.params.schoolId;

                  UserModel.findOne({
                              _id: schoolId,
                              type: 2, //school
                              isActive: true
                        })
                        .exec()
                        .then(schoolData => {

                              if (schoolData) {

                                    UserModel.find({
                                                schoolId,
                                                type: 0, //teacher
                                                isActive: true
                                          })
                                          .exec()
                                          .then(teacherList => {

                                                let teacherDataList = new Array();

                                                if (teacherList.length > 0) {

                                                      teacherList.forEach(teacher => {

                                                            teacherDataList.push({
                                                                  _id: teacher._id,
                                                                  firstName: teacher.firstName,
                                                                  surName: teacher.surName,
                                                                  emailId: teacher.emailId,
                                                                  mobileNo: String(teacher.mobileNo),
                                                                  invitationStatus: "1", //0-invitation link, 1-Connected
                                                                  profilePic: teacher.profilePic ? teacher.profilePic : "",
                                                            })

                                                      });


                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            teacherDataList,
                                                            message: 'Data Found...!!'
                                                      });

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            teacherDataList,
                                                            message: 'No Records Found...!!'
                                                      });

                                                }

                                          }).catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: 'Something Went Wrong. Please Try Later...!!'
                                                });
                                          })

                              } else {

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: 'Something Went Wrong. Please Try Later...!!'
                                    });

                              }

                        }).catch(err => {
                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: 'Something Went Wrong. Please Try Later...!!'
                              });
                        })



            } else {
                  return res.status(200).json({
                        statusCode: "0",
                        message: "All fields are mandatory..!!"
                  });
            }

      } catch (error) {
            res.status(200).json({
                  statusCode: "0",
                  message: 'Something Went Wrong. Please Try Later...!!'
            });
      }

}

module.exports = SchoolTeacherList;