const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const StudentModel = require('../../../../models/authentication/userModel');
const ConnectionModel = require('../../../../models/group/connectionModel');


const getData = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.studentId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;
            let studentId = req.params.studentId;

            //Verify Teacher and Grade
            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        StudentModel.findOne({
                                    _id: studentId,
                                    type: 1,
                                    isActive: true
                              })
                              .exec()
                              .then(student => {

                                    if (student) {

                                          let Student = StudentModel.findOne({
                                                      _id: studentId,
                                                      type: 1,
                                                      isActive: true
                                                })
                                                .exec()

                                          let Connection = ConnectionModel.findOne({
                                                      studentId,
                                                      groupId,
                                                      isActive: true
                                                })
                                                .populate('groupId')
                                                .exec()

                                          let Connections = ConnectionModel.find({
                                                      studentId,
                                                      groupId: {
                                                            $ne: groupId
                                                      },
                                                      connectionStatus: 2,
                                                      isActive: true
                                                })
                                                .populate('groupId')
                                                .exec()

                                          Promise.all([Student, Connection, Connections])
                                                .then(result => {

                                                      if (result[0] && result[1]) {

                                                            let OtherGroupData = new Array();

                                                            if (result[2].length > 0) {

                                                                  for (let index = 0; index < result[2].length; index++) {
                                                                        const connectionRecord = result[2][index];

                                                                        OtherGroupData.push({
                                                                              "groupId": connectionRecord.groupId._id,
                                                                              "groupName": connectionRecord.groupId.section ? connectionRecord.groupId.grade + " - " + connectionRecord.groupId.section : connectionRecord.groupId.grade,
                                                                              "groupPic": connectionRecord.groupId.groupPic,
                                                                              "status": String(connectionRecord.groupId.teacherId) == String(teacherId) ? "true" : "false"
                                                                        })

                                                                  }

                                                            }


                                                            return res.status(200).json({
                                                                  "statusCode": "1",
                                                                  "studentFirstName": result[0].firstName,
                                                                  "studentSurName": result[0].surName ? result[0].surName : "",
                                                                  "profilePic": result[0].profilePic ? result[0].profilePic : "",
                                                                  "editStudentName": String(result[0].addedBy) == String(teacherId) ? "true" : "false",
                                                                  "mobileNumber": result[0].mobileNo ? result[0].mobileNo : "",
                                                                  "emailId": result[0].emailId ? result[0].emailId : "",
                                                                  "groupName": result[1].groupId.section ? result[1].groupId.grade + " - " + result[1].groupId.section : result[1].groupId.grade,
                                                                  "groupPic": result[1].groupId.groupPic,
                                                                  "connectionStatus": String(result[1].connectionStatus),
                                                                  "otherGroups": OtherGroupData,
                                                                  "message": "Data Found..!!"
                                                            })


                                                      } else {

                                                            res.status(200).json({
                                                                  "statusCode": "0",
                                                                  "message": "Access Denied..!!"
                                                            })

                                                      }

                                                })
                                                .catch(err => {
                                                      console.log(err);

                                                      res.status(200).json({
                                                            "statusCode": "0",
                                                            "message": "Something Went Wrong. Please Tyr Later..!!"
                                                      })
                                                })

                                    } else {
                                          res.status(200).json({
                                                "statusCode": "0",
                                                "message": "Access Denied..!!"
                                          })
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Something Went Wrong. Please Tyr Later..!!"
                                    })
                              })

                  } else {

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied.....!!"
                        })

                  }
            })

      } else {
            res.status(200).json({
                  "statusCode": "0",
                  "message": "All Fields are mandatory...!!"
            })
      }

}

module.exports = getData;