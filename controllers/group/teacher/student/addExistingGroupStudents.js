const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const ConnectionModel = require('../../../../models/group/connectionModel');

const ChatConnectionModel = require('../../../../models/chat/chatConnectionModel')



const chatConnection = (teacherId, studentId, groupId) => {

      return new Promise((resolve, reject) => {

            ChatConnectionModel.findOne({
                        teacherId,
                        studentId,
                        isActive: true
                  }).exec()
                  .then(ChatConnectionExist => {

                        if (ChatConnectionExist) {

                              ChatConnectionModel.updateOne({
                                          _id: ChatConnectionExist._id
                                    }, {
                                          $push: {
                                                groupId
                                          }
                                    })
                                    .then(groupUpdated => {
                                          resolve(1);
                                    })
                                    .catch(err => {
                                          console.log(err);

                                          reject(0);
                                    })

                        } else {
                              reject(0);
                        }

                  })
                  .catch(err => {
                        console.log(err);
                  })


      });
}



const add = (req, res) => {

      if (req.body.teacherId && req.body.groupId && req.body.studentIds) {

            let teacherId = req.body.teacherId;
            let groupId = req.body.groupId;
            let studentIds = req.body.studentIds;

            //Verify Teacher and Grade
            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        if (studentIds.trim()) {

                              let splitStudentIds = studentIds.split(',');
                              let splitedStudentIds = [];

                              /**Remove Dupilicates in studnetIds */
                              for (let index = 0; index < splitStudentIds.length; index++) {

                                    const studentId = splitStudentIds[index];

                                    if (splitedStudentIds.length == 0 || splitedStudentIds.indexOf(studentId) == -1) {

                                          splitedStudentIds.push(studentId);

                                    }

                              }

                              console.log('Filtered Unique');

                              console.log(splitedStudentIds);


                              //Check all connections ids has been connected already to same group you want to add
                              ConnectionModel.find({
                                          groupId,
                                          studentId: {
                                                $in: splitedStudentIds
                                          },
                                          $or: [{
                                                connectionStatus: '2'
                                          }, {
                                                connectionStatus: '3'
                                          }, {
                                                connectionStatus: '4'
                                          }],
                                          isActive: 1,
                                    })
                                    .exec()
                                    .then(async connectionsExist => {

                                          let deletedExistArray = [];

                                          /**Remove those connected students of same group*/
                                          if (connectionsExist.length > 0) {

                                                for (let index = 0; index < connectionsExist.length; index++) {
                                                      let connectionExist = connectionsExist[index];

                                                      let idIndex = splitedStudentIds.indexOf(String(connectionExist.studentId));
                                                      console.log(idIndex);

                                                      if (connectionExist.connectionStatus == 3 || connectionExist.connectionStatus == 4) {
                                                            deletedExistArray.push(connectionExist.studentId);
                                                      }

                                                      /**Remove students already exist in this group */
                                                      splitedStudentIds.splice(idIndex, 1);

                                                      console.log('removed Ids');
                                                      console.log(splitedStudentIds);

                                                }

                                                console.log('splited');
                                                console.log(splitedStudentIds);

                                          }


                                          if (splitedStudentIds.length > 0) {

                                                /**
                                                 * Check student has connection with teacher in any of the group
                                                 */
                                                ConnectionModel.find({
                                                            studentId: {
                                                                  $in: splitedStudentIds
                                                            },
                                                            connectionStatus: '2',
                                                            isActive: 1,
                                                      })
                                                      .exec()
                                                      .then(connections => {

                                                            console.log(connections)

                                                            if (connections.length >= splitedStudentIds.length) {

                                                                  let savedConnections = [];

                                                                  for (let index = 0; index < splitedStudentIds.length; index++) {

                                                                        const studentId = splitedStudentIds[index];

                                                                        const establishConnection = new ConnectionModel({
                                                                              _id: new mongoose.Types.ObjectId,
                                                                              teacherId,
                                                                              groupId,
                                                                              studentId: mongoose.Types.ObjectId(studentId),
                                                                              connectionStatus: '2', //connection.connectionStatus
                                                                        })

                                                                        savedConnections.push(establishConnection.save());

                                                                        savedConnections.push(chatConnection(teacherId, studentId, groupId))

                                                                  }

                                                                  Promise.all(savedConnections)
                                                                        .then(done => {

                                                                              if (deletedExistArray.length > 0) {

                                                                                    ConnectionModel.updateMany({
                                                                                                groupId,
                                                                                                studentId: {
                                                                                                      $in: deletedExistArray
                                                                                                },
                                                                                                isActive: true,
                                                                                          }, {
                                                                                                $set: {
                                                                                                      connectionStatus: '2'
                                                                                                }
                                                                                          }).exec()
                                                                                          .then(updated => {

                                                                                                let addStudents = [];

                                                                                                for (let index = 0; index < splitedStudentIds.length; index++) {

                                                                                                      addStudents.push(TodayAssignment.addStudent(groupId, splitedStudentIds[index]));

                                                                                                }

                                                                                                Promise.all(addStudents)
                                                                                                      .then(done => {

                                                                                                            res.status(200).json({
                                                                                                                  'statusCode': '1',
                                                                                                                  'message': 'Students Added Successfully ...!!'
                                                                                                            })

                                                                                                      })
                                                                                                      .catch((err) => {

                                                                                                            console.log(err);
                                                                                                            res.status(200).json({
                                                                                                                  'statusCode': '0',
                                                                                                                  'message': 'Something went wrong.Please try later....!!!'
                                                                                                            })

                                                                                                      });

                                                                                          }).catch((err) => {
                                                                                                console.log(err);
                                                                                                res.status(200).json({
                                                                                                      'statusCode': '0',
                                                                                                      'message': 'Something went wrong.Please try later....!!!'
                                                                                                })
                                                                                          });

                                                                              } else {

                                                                                    res.status(200).json({
                                                                                          'statusCode': '1',
                                                                                          'message': 'Students Added Successfully ...!!'
                                                                                    })

                                                                              }

                                                                        })
                                                                        .catch((err) => {
                                                                              console.log(err);
                                                                              res.status(200).json({
                                                                                    'statusCode': '0',
                                                                                    'message': 'Something went wrong.Please try later....!!!'
                                                                              })
                                                                        });

                                                            } else if (connections.length == 0) {
                                                                  res.status(200).json({
                                                                        'statusCode': '0',
                                                                        'message': 'Students Selected Already Exist....!'
                                                                  })
                                                            } else {
                                                                  res.status(200).json({
                                                                        'statusCode': '0',
                                                                        'message': 'Something went wrong.Please try later....!'
                                                                  })
                                                            }
                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  'statusCode': '0',
                                                                  'message': 'Something went wrong.Please try later....!!'
                                                            })
                                                      })

                                          } else if (deletedExistArray.length > 0) {

                                                ConnectionModel.updateMany({
                                                            groupId,
                                                            studentId: {
                                                                  $in: deletedExistArray
                                                            },
                                                            isActive: true,
                                                      }, {
                                                            $set: {
                                                                  connectionStatus: '2'
                                                            }
                                                      }).exec()
                                                      .then(updated => {
                                                            res.status(200).json({
                                                                  'statusCode': '1',
                                                                  'message': 'Students Added Successfully ...!!'
                                                            })
                                                      }).catch((err) => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  'statusCode': '0',
                                                                  'message': 'Something went wrong.Please try later....!!!'
                                                            })
                                                      });

                                          } else {
                                                res.status(200).json({
                                                      'statusCode': '0',
                                                      'message': 'All Students Already Exist..!!'
                                                })
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          res.status(200).json({
                                                'statusCode': '0',
                                                'message': 'Something went wrong.Please try later....!!'
                                          })
                                    })

                        } else {
                              res.status(200).json({
                                    'statusCode': '0',
                                    'message': 'Something went wrong.Please try later....!!!!'
                              })
                        }

                  } else {

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied.....!!"
                        })

                  }
            })

      } else {
            res.status(200).json({
                  'statusCode': '0',
                  'message': 'All Fields are mandatory...!!'
            })
      }
}

module.exports = add;