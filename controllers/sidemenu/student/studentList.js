const StudentModel = require('../../../models/authentication/userModel');

const VerifyStudent = require('../../../middleware/verifyStudent');



const studentList = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            VerifyStudent(studentId, "")
                  .then(response => {

                        if (response && response.statusCode == 1) {

                              StudentModel.find({
                                          mobileNo: response.studentData.mobileNo,
                                          type: true,
                                          isActive: true
                                    }).exec()
                                    .then(studentsList => {

                                          let studentArray = new Array();

                                          if (studentsList.length > 0) {

                                                for (let index = 0; index < studentsList.length; index++) {
                                                      const studentData = studentsList[index];

                                                      studentArray.push({
                                                            "studentId": studentData._id,
                                                            "firstName": studentData.firstName,
                                                            "surName": studentData.surName,
                                                            "profilePic": studentData.profilePic
                                                      })

                                                }

                                                res.status(200).json({
                                                      "statusCode": "1",
                                                      "students": studentArray,
                                                      "message": "Data Found...!!"
                                                })

                                          } else {
                                                res.status(200).json({
                                                      "statusCode": "0",
                                                      "studentsData": [],
                                                      "message": "No groups Exist...!!"
                                                })
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

module.exports = studentList;