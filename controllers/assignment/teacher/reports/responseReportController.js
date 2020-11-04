const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const ConnectionsModel = require('../../../../models/group/connectionModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');


/*******************************************************************************
 * Announcement Response of an assignment
 */
exports.announcementResponse = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.assignmentId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;
            let assignmentId = req.params.assignmentId;

            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        AssignmentModel.findOne({
                                    _id: assignmentId,
                                    sectionType: "Announcement",
                                    groupId,
                                    isActive: true
                              }, {
                                    announcement: 1,
                                    cancelStatus: 1,
                                    teacherDeleteStatus: 1,
                                    teacherDeleteAllStatus: 1,
                              })
                              .exec()
                              .then(result => {

                                    if (result) {

                                          if (result.cancelStatus === false && result.teacherDeleteStatus === false && result.teacherDeleteAllStatus === false) {

                                                ConnectionsModel.find({
                                                            groupId,
                                                            connectionStatus: 2,
                                                            isActive: true
                                                      })
                                                      .populate('studentId', 'firstName surName profilePic')
                                                      .exec()
                                                      .then(async connections => {

                                                            let responseArray = new Array();

                                                            if (connections.length > 0) {

                                                                  responseArray = [{
                                                                              reason: "Participating",
                                                                              students: []
                                                                        },
                                                                        {
                                                                              reason: "Not Participating",
                                                                              students: []
                                                                        }, {
                                                                              reason: "Not Updated",
                                                                              students: []
                                                                        }
                                                                  ];

                                                                  for (let index = 0; index < connections.length; index++) {

                                                                        const connection = connections[index];

                                                                        let studentObj = {
                                                                              studentId: connection.studentId._id,
                                                                              name: connection.studentId.firstName + " " + connection.studentId.surName,
                                                                              profilePic: connection.studentId.profilePic ? connection.studentId.profilePic : "",
                                                                        }

                                                                        if (result.announcement.coming.indexOf(connection.studentId._id) != "-1") {
                                                                              responseArray[0].students.push(studentObj)
                                                                        } else if (result.announcement.notComing.indexOf(connection.studentId._id) != "-1") {
                                                                              responseArray[1].students.push(studentObj)
                                                                        } else {
                                                                              responseArray[2].students.push(studentObj)
                                                                        }
                                                                  }

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        responseData: responseArray,
                                                                        message: "Data Found..!!!"
                                                                  });

                                                            } else {
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "No Connectios Exist..!!!"
                                                                  });
                                                            }
                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!!"
                                                            });
                                                      })

                                          } else {
                                                let message = (result.teacherDeleteAllStatus === true || result.teacherDeleteStatus === true) ? "Already Deleted...!!" : result.cancelStatus == true ? "Already Cancelled...!!" : "Something went wrong...!!";

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: message
                                                })
                                          }
                                    } else {
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          });
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    return res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. Please try again..!!!"
                                    })
                              });
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


/*******************************************************************************
 * HomeWork Response of an assignment
 */
exports.homeWorkResponse = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.assignmentId && req.params.homeWorkId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;
            let assignmentId = req.params.assignmentId;
            let homeWorkId = req.params.homeWorkId;

            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        AssignmentModel.findOne({
                                    _id: assignmentId,
                                    "homeWork._id": homeWorkId,
                                    sectionType: "HomeWork",
                                    groupId,
                                    isActive: true
                              }, {
                                    "homeWork.$": 1,
                                    cancelStatus: 1,
                                    teacherDeleteStatus: 1,
                                    teacherDeleteAllStatus: 1,
                              })
                              .exec()
                              .then(result => {

                                    console.log("result");
                                    console.log(result);

                                    if (result) {

                                          if (result.cancelStatus === false && result.teacherDeleteStatus === false && result.teacherDeleteAllStatus === false) {

                                                ConnectionsModel.find({
                                                            groupId,
                                                            connectionStatus: 2,
                                                            isActive: true
                                                      })
                                                      .populate('studentId', 'firstName surName profilePic')
                                                      .exec()
                                                      .then(async connections => {

                                                            let responseArray = new Array();

                                                            if (connections.length > 0) {

                                                                  responseArray = [{
                                                                        reason: "Homework Done",
                                                                        students: []
                                                                  }];

                                                                  let notResponded = {
                                                                        reason: "Not Updated",
                                                                        students: []
                                                                  }

                                                                  let responeExistArray = [];

                                                                  for (let index = 0; index < connections.length; index++) {

                                                                        const connection = connections[index];

                                                                        let notCompletedHomeWorkStudent = 0;

                                                                        for (let index = 0; index < result.homeWork[0].notCompletedStudents.length; index++) {

                                                                              const notCompletedStudent = result.homeWork[0].notCompletedStudents[index];

                                                                              if (String(notCompletedStudent.userId) == String(connection.studentId._id)) {

                                                                                    let responeExists = responeExistArray.indexOf(notCompletedStudent.reason);

                                                                                    if (responeExists == -1) {

                                                                                          let responseObj = {};

                                                                                          responseObj.reason = notCompletedStudent.reason;
                                                                                          responseObj.students = [{
                                                                                                studentId: connection.studentId._id,
                                                                                                name: connection.studentId.firstName + " " + connection.studentId.surName,
                                                                                                profilePic: connection.studentId.profilePic ? connection.studentId.profilePic : "",
                                                                                          }]

                                                                                          responseArray.push(responseObj);
                                                                                          responeExistArray.push(notCompletedStudent.reason)

                                                                                    } else {

                                                                                          responseArray[responeExists + 1].students.push({
                                                                                                studentId: connection.studentId._id,
                                                                                                name: connection.studentId.firstName + " " + connection.studentId.surName,
                                                                                                profilePic: connection.studentId.profilePic ? connection.studentId.profilePic : "",
                                                                                          })

                                                                                    }

                                                                                    notCompletedHomeWorkStudent = 1;

                                                                              }
                                                                        }


                                                                        if (notCompletedHomeWorkStudent == 0) {

                                                                              //let completedStudentExists = result.completedStudents.indexOf(connection.studentId._id) == -1 ? "false" : "true"

                                                                              if (result.homeWork[0].completedStudents.indexOf(connection.studentId._id) != -1) {
[]
                                                                                    responseArray[0].students.push({
                                                                                          studentId: connection.studentId._id,
                                                                                          name: connection.studentId.firstName + " " + connection.studentId.surName,
                                                                                          profilePic: connection.studentId.profilePic ? connection.studentId.profilePic : "",
                                                                                    })

                                                                              } else {

                                                                                    notResponded.students.push({
                                                                                          studentId: connection.studentId._id,
                                                                                          name: connection.studentId.firstName + " " + connection.studentId.surName,
                                                                                          profilePic: connection.studentId.profilePic ? connection.studentId.profilePic : "",
                                                                                    })

                                                                              }

                                                                        }

                                                                  }

                                                                  if (notResponded.students.length > 0) {
                                                                        responseArray.push(notResponded)
                                                                  }

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        responseData: responseArray,
                                                                        message: "Data Found..!!!"
                                                                  });

                                                            } else {
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "No Connectios Exist..!!!"
                                                                  });
                                                            }
                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!!"
                                                            });
                                                      })

                                          } else {
                                                let message = (result.teacherDeleteAllStatus === true || result.teacherDeleteStatus === true) ? "Already Deleted...!!" : result.cancelStatus == true ? "Already Cancelled...!!" : "Something went wrong...!!";

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: message
                                                })
                                          }
                                    } else {
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          });
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    return res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. Please try again..!!!"
                                    })
                              });
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