const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');

const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');

const VerifyStudent = require('../../../middleware/verifyStudent');



const list = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            VerifyStudent(studentId, "")
                  .then(response => {

                        if (response && response.statusCode == 1) {

                              ClassStudentConnectionModel.find({
                                    studentId,
                                    connectionStatus: 1,
                                    isActive: true
                              }, {
                                    "classId": 1,
                              })
                                    // .populate('classId')
                                    // .populate('teacherId')
                                    .exec()
                                    .then(connectedClasses => {
                                          console.log("connections" + connectedClasses);

                                          let connectedClassesList = connectedClasses.map(classConnection => classConnection.classId)

                                          ClassTeacherConnectionModel.find({
                                                classId: {
                                                      $in: connectedClassesList
                                                },
                                                isActive: true
                                          })
                                          .populate('classId')
                                          .populate('teacherId')
                                                .then(connections => {

                                                      let connectionList = [];

                                                      if (connections.length > 0) {

                                                            for (let index = 0; index < connections.length; index++) {
                                                                  const connection = connections[index];

                                                                  connectionList.push({
                                                                        groupId: connection.classId._id,
                                                                        groupName: connection.classId.section ? connection.classId.grade + '-' + connection.classId.section : connection.classId.grade,
                                                                        teacherId: connection.teacherId._id,
                                                                        teacherName: connection.teacherId.firstName + " " + connection.teacherId.surName
                                                                  })
                                                            }

                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  connectionList,
                                                                  message: "Data Found..!!"
                                                            });

                                                      } else {

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  connectionList,
                                                                  message: "No Records Found..!!"
                                                            });

                                                      }
                                                })
                                                .catch(err => {
                                                      console.log(err);

                                                      return res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Something Went Wrong. Please Try Later..!!"
                                                      });
                                                })

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later..!!"
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

module.exports = list;