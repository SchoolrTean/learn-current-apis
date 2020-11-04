const VerifyTeacher = require('../../../middleware/verifyTeacher');
const TeacherGradesModel = require('../../../models/group/teacherGroupModel');
const ConnectionModel = require('../../../models/group/connectionModel')
const ChatConnectionModel = require('../../../models/chat/chatConnectionModel')
const chatMessageModel = require('../../../models/chat/chatMessagesModel')
const UserModel = require('../../../models/authentication/userModel')



module.exports = function (io) {

      io.sockets.on('connection', (socket) => {

            console.log('Connection to IO');

            /**
             * Join rooms is called when the teacher opens app in his/her mobile.
             * TeahcerId and type are the parameters passed and joined the rooms
             * rooms are groupId and individual connection id
             * 
             * GroupId is for broadcst message
             * Individual Id is for individual Chat
             * 
             * For teacher individul and broadcast is displayed in only one view
             */
            socket.on('teacherJoinRooms', function (teacherId) {

                  VerifyTeacher(teacherId, "", (error, response) => {

                        if (response && response.statusCode != "0") {

                              UserModel.update({
                                    teacherId,
                                    isActive: true
                              }, {
                                    $set: {
                                          chatOnlineStatus: true
                                    }

                              })
                                    .then(onlineStatusUpdated => {

                                          if (onlineStatusUpdated.ok) {

                                                ChatConnectionModel.find({
                                                      initiatorUserId: teacherId,
                                                      deleteStatus: false,
                                                      isActive: true
                                                }, {
                                                      roomId: 1
                                                })
                                                      .exec()
                                                      .then(async connections => {

                                                            if (connections.length > 0) {

                                                                  for (let index = 0; index < connections.length; index++) {

                                                                        const connection = connections[index];

                                                                        socket.join(connection.roomId)

                                                                        let onlineStatusMessageObj = {
                                                                              roomId: connection.roomId,
                                                                              userId: teacherId
                                                                        }

                                                                        console.log("join Room -Teacher -" + connection.roomId);

                                                                        //io.sockets.in(group._id).emit("teacherOnline", onlineStatusMessageObj);
                                                                        socket.to(connection.roomId).emit('teacherOnline', onlineStatusMessageObj);

                                                                  }

                                                            }

                                                      })
                                                      .catch(err => {

                                                            console.log(err);

                                                            io.emit("error", {
                                                                  teacherId: teacherId,
                                                                  message: "Something Went Wrong. Please Try later..!!"
                                                            });

                                                      })

                                          } else {

                                                io.emit("error", {
                                                      teacherId: teacherId,
                                                      message: "Something Went Wrong. Please Try later..!!"
                                                });

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          io.emit("error", {
                                                teacherId: teacherId,
                                                message: "Something Went Wrong. Please Try later..!!"
                                          });
                                    })

                        } else {

                              io.emit("error", {
                                    teacherId: teacherId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });

                        }
                  });

            })



            /**
             * When the new group was created then this event was emitted to call this function
             * This event joins the teacher to this room. 
             */
            socket.on('teacherJoinCreateRoom', function (teacherId, roomId) {

                  console.log('teacherJoinCreateRoom - ON');

                  VerifyTeacher(teacherId, "", (error, response) => {

                        if (response && response.statusCode != "0") {

                              socket.join(roomId);

                        } else {

                              io.emit("error", {
                                    teacherId: teacherId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });

                        }
                  });

            })


            /**
             * When the teacher Types then this fuction is called from the teacher client.
             * then the typing response will be sent to all the students in the group Room
             * 
             * Client receieves typing Response emit from server and now the typing response
             * is shown to client if the response contains studentId only that student will 
             * informed regarding typing else entire group will get a broadcast message typing
             */
            socket.on('teacherGroupTyping', function (teacherId, roomId) {

                  console.log('teacherGroupTyping - ON');

                  VerifyTeacher(teacherId, "", (error, response) => {

                        if (response && response.statusCode != "0") {

                              io.sockets.to(roomId).emit("teacherGroupTyping", {
                                    roomId: roomId,
                                    userId: teacherId
                              });

                        } else {

                              io.sockets.to(roomId).emit("error", {
                                    teacherId: teacherId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });

                        }
                  });

            })



            /**
             * When the teacher stoppes typing then this fuction is called from the teacher client.
             * then the typing response will be sent to all the students in the group Room
             * 
             * Client receieves typing Stopped Response emit from server and now the typing response
             * is shown to client if the response contains studentId only that student will 
             * informed regarding stopped typing else entire group will get a broadcast message typing stopped
             */
            socket.on('teacherGroupStoppedTyping', function (teacherId, roomId) { //, IndividualUserId = null

                  console.log('teacherGroupStoppedTyping - ON');

                  VerifyTeacher(teacherId, "", (error, response) => {

                        if (response && response.statusCode != "0") {

                              // let eventObj = "";

                              // if (IndividualUserId) {
                              //       eventObj = {
                              //             groupId: groupId,
                              //             studentId: IndividualUserId
                              //       }
                              // } else {
                              //       eventObj = {
                              //             groupId: groupId,
                              //             studentId: ""
                              //       }
                              // }

                              io.sockets.to(roomId).emit("teacherGroupStoppedTyping", {
                                    roomId,
                                    userId: teacherId
                              }); //, eventObj
                        } else {
                              io.sockets.to(roomId).emit("error", {
                                    teacherId: teacherId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });
                        }
                  });

            })



            /**
             * Update the seen status of teacher received message to the sender.
             * 
             * GroupId is for broadcst message
             * Individual Id is for individual Chat
             * 
             * For teacher individul and broadcast is displayed in only one view
             */

            socket.on('teacherUpdateSeenStatus', function (teacherId, roomId, messageId) {

                  console.log('teacherUpdateSeenStatus - ON');

                  VerifyTeacher(teacherId, "", (error, response) => {

                        if (response && response.statusCode != "0") {

                              ChatConnectionModel.findOne({
                                    initiatorUserId: teacherId,
                                    roomId,
                                    deleteStatus: false,
                                    isActive: true
                              }).exec()
                                    .then(Connection => {

                                          if (Connection) {

                                                chatMessageModel.findOne({
                                                      _id: messageId,
                                                      roomId,
                                                      userId: {
                                                            $ne: teacherId
                                                      },
                                                      isActive: true
                                                }).exec()
                                                      .then(messageFound => {

                                                            if (messageFound) {

                                                                  let updateQuery = {}

                                                                  if (Connection.type == 1) {
                                                                        updateQuery = {
                                                                              $set: {
                                                                                    seenStatus: true
                                                                              }
                                                                        }
                                                                  } else {
                                                                        updateQuery = {
                                                                              $push: {
                                                                                    seenUsers: teacherId
                                                                              }
                                                                        }
                                                                  }

                                                                  chatMessageModel.updateOne({
                                                                        _id: messageId
                                                                  }, updateQuery).exec()
                                                                        .then(messageUpdatedAsSeen => {

                                                                              if (messageUpdatedAsSeen) {

                                                                                    let messageObj = {
                                                                                          messageId,
                                                                                          roomId
                                                                                    }

                                                                                    io.sockets.in(roomId).emit("teacherEmitSeenStatus", messageObj);

                                                                              } else {
                                                                                    io.sockets.to(roomId).emit("error", {
                                                                                          roomId,
                                                                                          teacherId: teacherId,
                                                                                          message: "Something Went Wrong. Please Try later..!!"
                                                                                    });
                                                                              }

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err)

                                                                              io.sockets.to(roomId).emit("error", {
                                                                                    roomId,
                                                                                    teacherId: teacherId,
                                                                                    message: "Something Went Wrong. Please Try later..!!"
                                                                              });
                                                                        })

                                                            } else {
                                                                  io.sockets.to(roomId).emit("error", {
                                                                        roomId,
                                                                        teacherId: teacherId,
                                                                        message: "Something Went Wrong. Please Try later..!!"
                                                                  });
                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err)

                                                            io.sockets.to(roomId).emit("error", {
                                                                  roomId,
                                                                  teacherId: teacherId,
                                                                  message: "Something Went Wrong. Please Try later..!!"
                                                            });
                                                      })

                                          } else {
                                                io.sockets.to(roomId).emit("error", {
                                                      roomId,
                                                      teacherId: teacherId,
                                                      message: "Something Went Wrong. Please Try later..!!"
                                                });
                                          }

                                    })
                                    .catch(err => {
                                          io.sockets.to(roomId).emit("error", {
                                                roomId,
                                                teacherId: teacherId,
                                                message: "Something Went Wrong. Please Try later..!!"
                                          });
                                    })

                        } else {
                              io.sockets.to(roomId).emit("error", {
                                    roomId,
                                    teacherId: teacherId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });
                        }
                  });
            });



            /**
             * Update the seen status of teacher received message to the sender.
             * 
             * GroupId is for broadcst message
             * 
             * For teacher individul and broadcast is displayed in only one view
             */
            socket.on('teacherGroupDisconnect', function (teacherId) {

                  console.log('teacherGroupDisconnect - ON');

                  VerifyTeacher(teacherId, "", (error, response) => {

                        if (response && response.statusCode != "0") {

                              UserModel.update({
                                    teacherId,
                                    isActive: true
                              }, {
                                    $set: {
                                          chatOnlineStatus: false
                                    }

                              })
                                    .then(onlineStatusUpdated => {

                                          if (onlineStatusUpdated.ok) {

                                                ChatConnectionModel.find({
                                                      initiatorUserId: teacherId,
                                                      deleteStatus: false,
                                                      isActive: true
                                                }, {
                                                      _id: 1
                                                })
                                                      .exec()
                                                      .then(async conversations => {

                                                            if (conversations.length > 0) {

                                                                  for (let index = 0; index < conversations.length; index++) {

                                                                        const conversation = conversations[index];

                                                                        console.log(conversation.roomId + ':- Teahcer Disconnected');

                                                                        socket.to(conversation.roomId).emit('teacherOffline', {
                                                                              roomId: conversation.roomId,
                                                                              userId: teacherId
                                                                        });

                                                                        socket.leave(conversation.roomId)

                                                                  }

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            io.emit("error", {
                                                                  teacherId: teacherId,
                                                                  message: "Something Went Wrong. Please Try later..!!"
                                                            });

                                                      })

                                          } else {

                                                io.emit("error", {
                                                      teacherId: teacherId,
                                                      message: "Something Went Wrong. Please Try later..!!"
                                                });


                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          io.emit("error", {
                                                teacherId: teacherId,
                                                message: "Something Went Wrong. Please Try later..!!"
                                          });

                                    })


                        } else {

                              io.sockets.to(roomId).emit("error", {
                                    teacherId: teacherId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });

                        }
                  });

            })



            /********************************************************** Student Socket Events ***********************************************************/



            /**
             * Join rooms is called when the student opens app On his/her mobile.
             * StudentId is passed and joined the rooms on groupId 
             * 
             * Student always pushes the individual messages.
             * 
             * For student only individu view exists like a whatsapp.
             */
            socket.on('studentJoinRooms', function (studentId) {

                  console.log('studentJoinRooms - ON');

                  UserModel.findOne({
                        _id: studentId,
                        isActive: true,
                        type: 1
                  }).exec()
                        .then(async student => {

                              if (student) {

                                    // let query = {
                                    //       isActive: true,
                                    //       type: 1
                                    // };

                                    // if (student.mobileNo) {
                                    //       query.mobileNo = student.mobileNo
                                    // } else {
                                    //       query.emailId = student.emailId
                                    // }

                                    // UserModel.find(query)
                                    //       .sort({
                                    //             name: 1
                                    //       })
                                    //       .exec()
                                    //       .then(async students => {

                                    //             for (let index = 0; index < students.length; index++) {

                                    //                   const student = students[index];

                                    await ChatConnectionModel.find({
                                          initiatorUserId: studentId,
                                          // connectionStatus: 2,
                                          isActive: true
                                    })
                                          .exec()
                                          .then(conversations => {

                                                for (let index = 0; index < conversations.length; index++) {

                                                      socket.join(conversations[index].roomId)

                                                      console.log("student Join" + conversations[index].roomId);

                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                io.emit("error", {
                                                      studentId: studentId,
                                                      message: "Something Went Wrong. Please Try later..!!"
                                                });

                                          })

                                    //       }

                                    // }).catch(err => {
                                    //       console.log(err);

                                    //       io.emit("error", {
                                    //             studentId: studentId,
                                    //             message: "Something Went Wrong. Please Try later..!!"
                                    //       });

                                    // })

                              } else {
                                    io.emit("error", {
                                          studentId: studentId,
                                          message: "Access Denied..!!"
                                    });

                              }

                        }).catch(err => {

                              console.log(err);

                              io.emit("error", {
                                    studentId: studentId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });


                        })

            })



            /**
             * Student Join Room which was created by teacher and teacher will emit the event
             * Once event was emitted if student recieves then student will emit this join event
             * Now he/she will join the group.
             */
            socket.on('studentJoinCreateRoom', function (studentId, roomId) { //groupId

                  console.log('studentJoinCreateRoom - ON')

                  UserModel.findOne({
                        _id: studentId,
                        type: 1
                  }).exec()
                        .then(student => {

                              if (student) {

                                    if (student.isActive == true) {

                                          ConnectionModel.findOne({
                                                initiatorUserId: studentId,
                                                roomId,
                                                deleteStatus: false,
                                                isActive: true
                                          })
                                                .exec()
                                                .then(connectionExist => {

                                                      if (connectionExist) {

                                                            console.log('studentJoinCreateRoom - ON - JOIN' + roomId)

                                                            socket.join(roomId);

                                                      } else {

                                                            io.emit("error", {
                                                                  studentId: studentId,
                                                                  message: "Something Went Wrong. Please Try later..!!"
                                                            });

                                                      }

                                                })
                                                .catch(err => {

                                                      console.log(err);

                                                      io.emit("error", {
                                                            studentId: studentId,
                                                            message: "Something Went Wrong. Please Try later..!!"
                                                      });
                                                })

                                    } else {
                                          io.emit("error", {
                                                studentId: studentId,
                                                message: "Something Went Wrong. Please Try later..!!"
                                          });

                                    }

                              } else {
                                    io.emit("error", {
                                          studentId: studentId,
                                          message: "Access Denied..!!"
                                    });

                              }

                        }).catch(err => {

                              console.log(err);

                              io.emit("error", {
                                    studentId: studentId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });


                        })
            });



            /**
             * When the student Types then this fuction is called from the student client.
             * then the typing response will be sent to teacher of that group and shown
             */
            socket.on('studentTyping', function (studentId, roomId) {

                  console.log("studentTyping - ON")

                  UserModel.findOne({
                        _id: studentId,
                        type: 1
                  }).exec()
                        .then(student => {

                              if (student) {

                                    console.log("student Typing")

                                    if (student.isActive == true) {

                                          ChatConnectionModel.find({
                                                roomId,
                                                initiatorUserId: studentId,
                                                deleteStatus: false,
                                                isActive: true
                                          })
                                                .exec()
                                                .then(connectionExists => {

                                                      if (connectionExists) {

                                                            io.sockets.to(roomId).emit("studentTyping", {
                                                                  roomId,
                                                                  studentId
                                                            });

                                                      } else {

                                                            io.sockets.to(roomId).emit("error", {
                                                                  roomId,
                                                                  studentId: studentId,
                                                                  message: "Access Denied..!!"
                                                            });

                                                      }

                                                })
                                                .catch(err => {

                                                      console.log(err);

                                                      io.sockets.to(roomId).emit("error", {
                                                            roomId,
                                                            studentId: studentId,
                                                            message: "Something Went Wrong. Please Try later..!!"
                                                      });
                                                })

                                    } else {
                                          io.sockets.to(roomId).emit("error", {
                                                roomId,
                                                studentId: studentId,
                                                message: "Access Denied..!!"
                                          });
                                    }

                              } else {
                                    io.sockets.to(roomId).emit("error", {
                                          roomId,
                                          studentId: studentId,
                                          message: "Access Denied..!!"
                                    });
                              }

                        }).catch(err => {

                              console.log(err);

                              io.sockets.to(roomId).emit("error", {
                                    roomId,
                                    studentId: studentId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });

                        })

            })



            /**
             * When the student stops Types then this fuction is called from the student client.
             * then the typing stopped response will be sent to teacher of that group and shown
             */
            socket.on('studentStoppedTyping', function (studentId, roomId) {

                  console.log('studentStoppedTyping-ON');

                  UserModel.findOne({
                        _id: studentId,
                        type: 1
                  }).exec()
                        .then(student => {

                              if (student) {

                                    if (student.isActive == true) {

                                          ChatConnectionModel.find({
                                                roomId,
                                                initiatorUserId: studentId,
                                                // connectionStatus: 2,
                                                isActive: true
                                          })
                                                .exec()
                                                .then(connectionExists => {

                                                      if (connectionExists) {
                                                            io.sockets.to(roomId).emit("studentStoppedTyping", {
                                                                  studentId,
                                                                  roomId
                                                            });
                                                      } else {
                                                            io.sockets.to(roomId).emit("error", {
                                                                  roomId,
                                                                  studentId: studentId,
                                                                  message: "Access Denied..!!"
                                                            });
                                                      }

                                                })
                                                .catch(err => {

                                                      console.log(err);

                                                      io.sockets.to(roomId).emit("error", {
                                                            roomId,
                                                            studentId: studentId,
                                                            message: "Something Went Wrong. Please Try later..!!"
                                                      });
                                                })

                                    } else {
                                          io.sockets.to(roomId).emit("error", {
                                                roomId,
                                                studentId: studentId,
                                                message: "Access Denied..!!"
                                          });
                                    }

                              } else {
                                    io.sockets.to(roomId).emit("error", {
                                          roomId,
                                          studentId: studentId,
                                          message: "Access Denied..!!"
                                    });
                              }

                        }).catch(err => {

                              console.log(err);

                              io.sockets.to(roomId).emit("error", {
                                    roomId,
                                    studentId: studentId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });

                        })

            })



            /**
             * Update the seen status of student received message to the teacher.
             * 
             * GroupId is for broadcst message
             * messageId is for individual chat
             * StudentId is for userId
             * 
             * For student individul is displayed in the one view
             */

            socket.on('studentUpdateSeenStatus', function (studentId, roomId, messageId) {

                  console.log('studentUpdateSeenStatus-ON');

                  UserModel.findOne({
                        _id: studentId,
                        type: 1
                  }).exec()
                        .then(student => {

                              if (student) {

                                    if (student.isActive == true) {

                                          ChatConnectionModel.find({
                                                roomId,
                                                initiatorUserId: studentId,
                                                deleteStatus: false,
                                                isActive: true
                                          })
                                                .exec()
                                                .then(connectionExists => {

                                                      if (connectionExists) {

                                                            chatMessageModel.findOne({
                                                                  _id: messageId,
                                                                  roomId,
                                                                  // deleteAll: false,
                                                                  isActive: true
                                                            }).exec()
                                                                  .then(messageFound => {

                                                                        if (messageFound) {

                                                                              chatMessageModel.updateOne({
                                                                                    _id: messageId
                                                                              }, {
                                                                                    $set: {
                                                                                          seenStatus: true
                                                                                    }
                                                                              }).exec()
                                                                                    .then(messageUpdatedAsSeen => {

                                                                                          if (messageUpdatedAsSeen) {

                                                                                                io.sockets.to(roomId).emit("studentEmitSeenStatus", {
                                                                                                      messageId: messageId,
                                                                                                      roomId,
                                                                                                });

                                                                                          } else {
                                                                                                io.sockets.to(roomId).emit("error", {
                                                                                                      roomId,
                                                                                                      studentId: studentId,
                                                                                                      message: "Something Went Wrong..!!"
                                                                                                });
                                                                                          }

                                                                                    })

                                                                        } else {
                                                                              io.sockets.to(roomId).emit("error", {
                                                                                    roomId,
                                                                                    studentId: studentId,
                                                                                    message: "Something went Wrong..!!"
                                                                              });
                                                                        }

                                                                  })

                                                      } else {
                                                            io.sockets.to(roomId).emit("error", {
                                                                  roomId,
                                                                  studentId: studentId,
                                                                  message: "Access Denied..!!"
                                                            });
                                                      }

                                                })
                                                .catch(err => {

                                                      console.log(err);

                                                      io.sockets.to(roomId).emit("error", {
                                                            roomId,
                                                            studentId: studentId,
                                                            message: "Something Went Wrong. Please Try later..!!"
                                                      });
                                                })

                                    } else {
                                          io.sockets.to(roomId).emit("error", {
                                                roomId,
                                                studentId: studentId,
                                                message: "Access Denied..!!"
                                          });
                                    }

                              } else {
                                    io.sockets.to(roomId).emit("error", {
                                          roomId,
                                          studentId: studentId,
                                          message: "Access Denied..!!"
                                    });
                              }

                        }).catch(err => {

                              console.log(err);

                              io.sockets.to(roomId).emit("error", {
                                    roomId,
                                    studentId: studentId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });

                        })

            });



            /**
             * leave rooms is called when the student close On his/her mobile.
             * StudentId is passed and left the rooms on groupId and offline is updated
             */
            socket.on('studentGroupDisconnect', function (studentId) {

                  console.log('studentGroupDisconnect - ON')

                  UserModel.findOne({
                        _id: studentId,
                        type: 1,
                        isActive: true
                  }).exec()
                        .then(async student => {

                              if (student) {

                                    // let query = {
                                    //       isActive: true,
                                    //       type: 1
                                    // }

                                    // if (student.mobileNo) {
                                    //       query.mobileNo = student.mobileNo
                                    // }

                                    // if (student.emailId) {
                                    //       query.emailId = student.emailId
                                    // }

                                    // UserModel.find(query)
                                    //       .exec()
                                    //       .then(async students => {

                                    // for (let index = 0; index < students.length; index++) {

                                    // const student = students[index];

                                    await ChatConnectionModel.find({
                                          initiatorUserId: studentId,
                                          deleteStatus: false,
                                          isActive: true
                                    })
                                          .exec()
                                          .then(conversations => {

                                                for (let index = 0; index < conversations.length; index++) {

                                                      socket.leave(conversations[index].roomId)

                                                      console.log("disconnect Student - " + conversations[index].roomId);

                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                io.emit("error", {
                                                      studentId: studentId,
                                                      message: "Something Went Wrong. Please Try later..!!"
                                                });

                                          })

                                    // }

                                    // }).catch(err => {
                                    //       console.log(err);

                                    //       io.emit("error", {
                                    //             studentId: studentId,
                                    //             message: "Something Went Wrong. Please Try later..!!"
                                    //       });

                                    // })
                              } else {
                                    io.emit("error", {
                                          studentId: studentId,
                                          message: "Access Denied..!!"
                                    });

                              }

                        }).catch(err => {

                              console.log(err);

                              io.emit("error", {
                                    studentId: studentId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });


                        })

            })




            socket.on('disconnect', (studentId) => {

                  console.log('Student Disconnect - ON');

                  UserModel.findOne({
                        _id: studentId,
                        type: 1,
                        isActive: true
                  }).exec()
                        .then(async student => {

                              if (student) {

                                    // let query = {
                                    //       isActive: true,
                                    //       type: 1
                                    // };

                                    // if (student.mobileNo) {
                                    //       query.mobileNo = student.mobileNo
                                    // } else {
                                    //       query.emailId = student.emailId
                                    // }

                                    // UserModel.find(query)
                                    //       .sort({
                                    //             name: 1
                                    //       })
                                    //       .exec()
                                    //       .then(async students => {

                                    //             for (let index = 0; index < students.length; index++) {

                                    //                   const student = students[index];

                                    await ChatConnectionModel.find({
                                          initiatorUserId: studentId,
                                          deleteStatus: false,
                                          isActive: true
                                    })
                                          .exec()
                                          .then(conversations => {

                                                for (let index = 0; index < conversations.length; index++) {

                                                      socket.leave(conversations[index].roomId)

                                                      console.log("student Leave " + conversations[index].roomId);

                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                io.emit("error", {
                                                      studentId: studentId,
                                                      message: "Something Went Wrong. Please Try later..!!"
                                                });

                                          })

                                    //       }

                                    // }).catch(err => {
                                    //       console.log(err);

                                    //       io.emit("error", {
                                    //             studentId: studentId,
                                    //             message: "Something Went Wrong. Please Try later..!!"
                                    //       });

                                    // })


                              } else {
                                    io.emit("error", {
                                          studentId: studentId,
                                          message: "Access Denied..!!"
                                    });

                              }

                        }).catch(err => {

                              console.log(err);

                              io.emit("error", {
                                    studentId: studentId,
                                    message: "Something Went Wrong. Please Try later..!!"
                              });


                        })
            });


      });
}