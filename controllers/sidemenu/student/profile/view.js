const VerifyStudent = require('../../../../middleware/verifyStudent');

const ConnectionModel = require('../../../../models/group/connectionModel');


const studentList = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            VerifyStudent(studentId, "")
                  .then(response => {

                        if (response && response.statusCode == 1) {

                              ConnectionModel.find({
                                          studentId,
                                          connectionStatus: 2,
                                          isActive: true
                                    }, {
                                          groupId: 1,
                                          date: 1
                                    })
                                    .sort({
                                          date: -1
                                    })
                                    .populate({
                                          path: 'groupId',
                                          select: 'grade section groupPic teacherId',
                                          populate: {
                                                path: 'teacherId',
                                                select: 'firstName surname _id',
                                          }
                                    })
                                    .exec()
                                    .then(connectedGroupList => {

                                          let mygroupArray = new Array();

                                          if (connectedGroupList.length > 0) {

                                                connectedGroupList.forEach(connectedGroup => {

                                                      mygroupArray.push({
                                                            teacherName: connectedGroup.groupId.teacherId.firstName,
                                                            groupName: connectedGroup.groupId.section ? connectedGroup.groupId.grade + " " + connectedGroup.groupId.section : connectedGroup.groupId.grade,
                                                            groupPic: connectedGroup.groupId.groupPic,
                                                            joinedDate: connectedGroup.date
                                                      })

                                                });

                                          }

                                          res.status(200).json({
                                                "statusCode": "1",
                                                "studentSurName": response.studentData.surName,
                                                "studentFirstName": response.studentData.firstName,
                                                "studentGrade": response.studentData.grade ? response.studentData.grade : "",
                                                "studentMobileNo": response.studentData.mobileNo,
                                                "studentEmailId": response.studentData.emailId ? response.studentData.emailId : "",
                                                "profilePic": response.studentData.profilePic ? response.studentData.profilePic : "",
                                                "myGroups": mygroupArray,
                                                "message": "Data Found...!!"
                                          })

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