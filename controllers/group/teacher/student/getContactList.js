const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const StudentModel = require('../../../../models/authentication/userModel');
const ClassStudentConnectionModel = require('../../../../models/classes/classStudentConnectionModel');


const validateData = (studentMobileNoArray, contactNamesArray) => {
      return new Promise((resolve, reject) => {

            let validatedMobileNos = new Array();
            let validatedContactNames = new Array()

            try {

                  for (let index = 0; index < studentMobileNoArray.length; index++) {
                        const studentMobileNo = studentMobileNoArray[index];

                        if (studentMobileNo.trim()) {

                              //Here we are removing customer care numbers which will be less than 10
                              if (studentMobileNo.trim().split('').length > 10) {

                                    let formattedMobileNo = studentMobileNo.slice(studentMobileNo.length - 10)

                                    if (formattedMobileNo.charAt[0] <= 9 && formattedMobileNo.charAt[0] >= 6) {

                                          validatedMobileNos.push(formattedMobileNo)
                                          validatedContactNames.push(contactNamesArray[index])
                                    }

                              } else if (studentMobileNo.split('').length == 10) {

                                    validatedMobileNos.push(studentMobileNo)
                                    validatedContactNames.push(contactNamesArray[index])
                              }

                        }

                  }

                  resolve({
                        formattedMobileNos: validatedMobileNos,
                        contactNames: validatedContactNames
                  })


            } catch (error) {

                  console.log(error);
                  reject(0)

            }

      })
}


const matchingContactList = (req, res, next) => {

      if (req.body.teacherId && req.body.groupId && req.body.studentMobileNos && req.body.contactNames) {

            let teacherId = req.body.teacherId;
            let groupId = req.body.groupId;
            let studentMobileNos = req.body.studentMobileNos;
            let contactNames = req.body.contactNames;

            let studentMobileNoArray = studentMobileNos.split('%-%');
            let contactNamesArray = contactNames.split('%-%');

            console.log(studentMobileNoArray);
            console.log(contactNamesArray);

            if (studentMobileNoArray.length == contactNamesArray.length && studentMobileNoArray.length > 0) {

                  validateData(studentMobileNoArray, contactNamesArray)
                        .then(validatedData => {

                              console.log(validatedData);

                              //Verify Teacher and Grade
                              VerifyTeacher(teacherId, groupId, async (error, response) => {

                                    if (response && response.statusCode != "0") {

                                          try {

                                                let studentArray = new Array();

                                                for (let index = 0; index < validatedData.formattedMobileNos.length; index++) {
                                                      const studentMobileNo = validatedData.formattedMobileNos[index];

                                                      let studentExistsDetails = await StudentModel.find({
                                                            mobileNo: studentMobileNo,
                                                            type: 1,
                                                            isActive: true
                                                      })
                                                            .exec()

                                                      let exisitngStudentsDataArray = new Array();

                                                      if (studentExistsDetails.length > 0) {

                                                            for (let index = 0; index < studentExistsDetails.length; index++) {
                                                                  const studentDetails = studentExistsDetails[index];

                                                                  let checkConnectionExists = await ClassStudentConnectionModel.findOne({
                                                                        studentId: studentDetails._id,
                                                                        classId: groupId,
                                                                        isActive: true
                                                                  })

                                                                  exisitngStudentsDataArray.push({
                                                                        _id: studentDetails._id,
                                                                        firstName: studentDetails.firstName,
                                                                        surName: studentDetails.surName ? studentDetails.surName : "",
                                                                        profilePic: studentDetails.profilePic ? studentDetails.profilePic : "",
                                                                        connectionExists: checkConnectionExists ? 1 : 0
                                                                  })
                                                            }

                                                      }

                                                      studentArray.push({
                                                            mobileNo: studentMobileNo,
                                                            contactName: validatedData.contactNames[index],
                                                            studentsData: exisitngStudentsDataArray
                                                      })

                                                }

                                                res.status(200).json({
                                                      "statusCode": "1",
                                                      "studentData": studentArray,
                                                      "message": "Data Found..!!"
                                                })

                                          } catch (error) {

                                                console.log(error);
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Access Denied.....!!"
                                                })

                                          }

                                    } else {

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied.....!!"
                                          })

                                    }
                              })

                        })
                        .catch(err => {
                              console.log(err);
                              res.status(200).json({
                                    "statusCode": "0",
                                    "message": "Something Went Wrong. Please try later..!!"
                              })
                        })


            } else {
                  res.status(200).json({
                        "statusCode": "0",
                        "message": "Access Denied..!!"
                  })
            }


      } else {

            res.status(200).json({
                  "statusCode": "0",
                  "message": "All Fields are mandatory...!!"
            })
      }

}

module.exports = matchingContactList;