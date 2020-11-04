const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const StudentModel = require('../../../../models/authentication/userModel');
const ConnectionModel = require('../../../../models/group/connectionModel');

const SendJoinRequestNotification = require('../../../../third-party/notification/teacher/sendJoinRequest')


const send = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.studentId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;
            let studentId = req.params.studentId;

            //Verify Teacher and Grade
            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        StudentModel.findOne({
                                    _id: studentId,
                                    isActive: true
                              })
                              .exec()
                              .then(student => {

                                    if (student) {


                                          let ConnectionSentToUser = ConnectionModel.findOne({
                                                      teacherId,
                                                      studentId,
                                                      groupId,
                                                      isActive: true
                                                })
                                                .exec()

                                          let ConnectionSentToMobileNo = ConnectionModel.findOne({
                                                      teacherId,
                                                      studentMobileNo: student.mobileNo,
                                                      groupId,
                                                      connectionStatus: 1,
                                                      isActive: true
                                                })
                                                .exec()

                                          Promise.all([ConnectionSentToUser, ConnectionSentToMobileNo])
                                                .then(connectionDetails => {

                                                      console.log(connectionDetails);

                                                      if (connectionDetails[0] != null || connectionDetails[1] != null) {

                                                            let connectionExists = connectionDetails[0] ? connectionDetails[0] : connectionDetails[1];

                                                            if (connectionExists.connectionStatus == 1) {

                                                                  res.status(200).json({
                                                                        "statusCode": "0",
                                                                        "message": "Connection Request already sent..!!"
                                                                  })

                                                            } else if (connectionExists.connectionStatus == 2) {

                                                                  res.status(200).json({
                                                                        "statusCode": "0",
                                                                        "message": "Connection already exist..!!"
                                                                  })
                                                                  
                                                            } else {

                                                                  console.log(connectionExists);

                                                                  ConnectionModel.updateOne({
                                                                              _id: connectionExists._id
                                                                        }, {
                                                                              $set: {
                                                                                    connectionStatus: 1
                                                                              }
                                                                        })
                                                                        .exec()
                                                                        .then(connectionUpdated => {

                                                                              SendJoinRequestNotification(student.mobileNo, groupId, connectionExists._id, response.teacherData.name, response.classData.grade + "-" + response.classData.section)
                                                                                    .then(success => {

                                                                                          res.status(200).json({
                                                                                                "statusCode": "1",
                                                                                                "message": "Connection Request Sent.!!"
                                                                                          })

                                                                                    })
                                                                                    .catch(err => {
                                                                                          console.log(err);
                                                                                          res.status(200).json({
                                                                                                "statusCode": "0",
                                                                                                "message": "Something Went Wrong. Please try later.!!"
                                                                                          })
                                                                                    })
                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err);
                                                                              res.status(200).json({
                                                                                    "statusCode": "0",
                                                                                    "message": "Something Went Wrong. Please try later.!!"
                                                                              })
                                                                        })

                                                            }

                                                      } else {

                                                            const GroupStudentConnection = new ConnectionModel({
                                                                  _id: new mongoose.Types.ObjectId(),
                                                                  teacherId,
                                                                  groupId,
                                                                  studentId,
                                                                  studentMobileNo: student.mobileNo,
                                                                  connectionStatus: 1, // Join Request Sent
                                                            });

                                                            GroupStudentConnection.save()
                                                                  .then(connectionRequestSent => {

                                                                        SendJoinRequestNotification(student.mobileNo, groupId, connectionRequestSent._id, response.teacherData.name, response.classData.grade + "-" + response.classData.section)
                                                                              .then(success => {

                                                                                    res.status(200).json({
                                                                                          "statusCode": "1",
                                                                                          "message": "Connection Request Sent.!!"
                                                                                    })

                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(200).json({
                                                                                          "statusCode": "0",
                                                                                          "message": "Something Went Wrong. Please try later.!!"
                                                                                    })
                                                                              })

                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);
                                                                        res.status(200).json({
                                                                              "statusCode": "0",
                                                                              "message": "Something Went Wrong. Please try later.!!"
                                                                        })
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

module.exports = send;