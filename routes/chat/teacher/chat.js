const express = require('express');
const mongoose = require('mongoose');

const path = require('path');
const DateDiff = require('date-diff');
const fs = require('fs');
const pdf = require("pdf-creator-node");

const checkAuth = require('../../../middleware/auth')
const VerifyTeacher = require('../../../middleware/verifyTeacher');
// const VerifyStudent = require('../../../middleware/verifyStudent');

const chatMessageModel = require('../../../models/chat/chatMessagesModel');
const ChatConversationModel = require('../../../models/chat/chatConnectionModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');
const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const UserModel = require('../../../models/authentication/userModel')

const ParseConnections = require('../../../controllers/chat/shared/parseConnectionsController');

// const teacherGroupsModel = require('../../../models/teacher/teacherGroupsModel');
// const connectionModel = require('../../../models/common/connection')

// const checkAssignment = require('../../../controllers/chat/shared/checkAssignmentController');
// const checkChat = require('../../../controllers/chat/shared/checkChatController');


const multer = require('multer');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {
            let randNum = Math.round(Math.random() * (999999 - 111111));
            const folderName = './uploads/chat/teacher/' + fileName + randNum

            try {
                  if (!fs.existsSync(folderName)) {
                        fs.mkdirSync(folderName)
                        cb(null, folderName);
                  }
            } catch (err) {
                  console.error(err)
            }
      },
      filename: function (req, file, cb) {

            // let ext = file.originalname.split('.');
            // let orginalfileName = "";

            // for (let index = 0; index < (ext.length - 1); index++) {
            //       const orginalExtension = ext[index];
            //       if (index == 0) {
            //             orginalfileName += orginalExtension
            //       } else {
            //             orginalfileName += "." + orginalExtension
            //       }
            // }

            cb(null, file.originalname);
      }

});

const upload = multer({
      storage: storage,
      limits: {
            /*fileSize  : 1024 * 1024 * 1,*/
            files: 5
      }
});

/***************** Contoller Definition Part *******************/

const getChatConnections = require('../../../controllers/chat/teacher/chatConnectionListController')

const allConnections = require('../../../controllers/chat/teacher/allChatConnectionsController');

const createNewOneToOneChatConnection = require('../../../controllers/chat/shared/createOneOnOneChatController');

const ChatConversation = require('../../../controllers/chat/teacher/conversationController');

// const GetConnectionOnId = require('../../../controllers/chat/shared/getConnectionOnIdController');

const GetMessageOnId = require('../../../controllers/chat/shared/conversation/getMessageOnIdController');

const AddNewGroupConnection = require('../../../controllers/chat/shared/createNewGroup');

const SaveMessage = require('../../../controllers/chat/shared/conversation/saveChatMessage');



/***************** ./ Contoller Definition Part *******************/

module.exports = function (io) {

      const routes = express.Router();

      /************************ Chat Routes ***********************/

      routes.get('/chatConnections/:teacherId', checkAuth, getChatConnections)


      routes.get('/allConnections/:teacherId', checkAuth, allConnections)


      routes.post('/', checkAuth, upload.any('chatDocument'), (req, res, next) => {

            try {

                  let messageUrls = new Array();

                  if (req.files) {
                        let _filesArray = req.files;

                        _filesArray.forEach(_file => {
                              let correctPath = _file.path.replace(/\\/g, '/');
                              messageUrls.push(correctPath);
                        });
                  }

                  console.log(req.body)

                  if (req.body.teacherId && req.body.receiverUserId && req.body.messageType && (req.body.message || messageUrls.length > 0)) {

                        let teacherId = req.body.teacherId;
                        let receiverUserId = req.body.receiverUserId;
                        let message = req.body.message;
                        let messageType = req.body.messageType; //1-message 2-leave letter 3-image 4-attachment 5-School Assignment 6-audio 7-video

                        console.log(req.body);

                        mongoose.set('debug', true);

                        //Verify Teacher and Grade
                        VerifyTeacher(teacherId, "", async (error, response) => {

                              // console.log(response);

                              if (response && response.statusCode != "0") {

                                    ChatConversationModel.findOne({
                                          initiatorUserId: teacherId,
                                          receiverUserId,
                                          deleteStatus: false,
                                          isActive: true
                                    })
                                          .exec()
                                          .then(async Connection => {

                                                let roomId = "";

                                                if (Connection) {
                                                      roomId = Connection.roomId
                                                } else {
                                                      roomId = await createNewOneToOneChatConnection(teacherId, receiverUserId)
                                                }

                                                SaveMessage(teacherId, roomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId)
                                                      .then(messageSavedId => {

                                                            GetMessageOnId(teacherId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details
                                                                  .then(messageDetails => {

                                                                        // console.log(messageDetails);

                                                                        if (messageDetails.statusCode == 1) {


                                                                              // GetConnectionOnId(roomId, teacherId)
                                                                              sendConnectionRecordOnSocket(roomId, teacherId)
                                                                                    .then(connectionsSent => {

                                                                                          console.log("emit send message teacher");

                                                                                          io.sockets.in(roomId).emit("receiveMessage", {
                                                                                                "messageList": messageDetails.messageList
                                                                                          });

                                                                                          res.status(200).json({
                                                                                                statusCode: "1",
                                                                                                messageList: messageDetails.messageList,
                                                                                                message: "Message Sent Successfully...!!"
                                                                                          })

                                                                                    })
                                                                                    .catch(err => {
                                                                                          console.log(err);

                                                                                          res.status(200).json({
                                                                                                statusCode: "0",
                                                                                                message: "Something Went Wrong. Please Try Later..!!"
                                                                                          })

                                                                                    })

                                                                              // res.status(200).json({
                                                                              //       statusCode: "1",
                                                                              //       messageList: messageDetails.messageList,
                                                                              //       message: "Message Sent Successfully...!!"
                                                                              // })

                                                                        } else if (messageDetails.statusCode == 2) {

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Access Denied....!!"
                                                                              })

                                                                        } else {

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something Went Wrong. Please Try Later..!!"
                                                                              })

                                                                        }

                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something Went Wrong. Please Try Later..!!"
                                                                        })

                                                                  })

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                            })

                                                      })


                                          })
                                          .catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                })
                                          })

                              } else {

                                    res.status(200).json({
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

            } catch (error) {
                  console.log(error)

                  res.status(200).json({
                        statusCode: "0",
                        message: "Something Went Wrong. Please Try Later..!!"
                  })
            }

      });


      routes.post('/sendToGroup', checkAuth, upload.any('chatDocument'), (req, res, next) => {

            try {

                  let messageUrls = new Array();

                  if (req.files) {
                        let _filesArray = req.files;

                        _filesArray.forEach(_file => {
                              let correctPath = _file.path.replace(/\\/g, '/');
                              messageUrls.push(correctPath);
                        });
                  }

                  if (req.body.teacherId && req.body.roomId && req.body.messageType && (req.body.message || messageUrls.length > 0)) {

                        let teacherId = req.body.teacherId;
                        let roomId = req.body.roomId;
                        let message = req.body.message;
                        let messageType = req.body.messageType; //1-message 2-leave letter 3-image 4-attachment 5-School Assignment 6-audio 7-video

                        console.log(req.body);

                        mongoose.set('debug', true);

                        //Verify Teacher and Grade
                        VerifyTeacher(teacherId, "", async (error, response) => {

                              // console.log(response);

                              if (response && response.statusCode != "0") {

                                    ChatConversationModel.findOne({
                                          initiatorUserId: teacherId,
                                          roomId,
                                          deleteStatus: false,
                                          isActive: true
                                    })
                                          .exec()
                                          .then(async Connection => {

                                                if (Connection) {

                                                      if (Connection.connectionType == 2) {

                                                            console.log(Connection)

                                                            SaveMessage(teacherId, roomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId)
                                                                  .then(messageSavedId => {

                                                                        console.log(messageSavedId);

                                                                        GetMessageOnId(teacherId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details
                                                                              .then(messageDetails => {

                                                                                    // console.log(messageDetails);

                                                                                    if (messageDetails.statusCode == 1) {

                                                                                          // GetConnectionOnId(roomId, teacherId)
                                                                                          sendConnectionRecordOnSocket(roomId, teacherId)
                                                                                                .then(connectionsSent => {

                                                                                                      console.log("emit send message teacher");

                                                                                                      io.sockets.in(roomId).emit("receiveMessage", {
                                                                                                            "messageList": messageDetails.messageList
                                                                                                      });

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "1",
                                                                                                            messageList: messageDetails.messageList,
                                                                                                            message: "Message Sent Successfully...!!"
                                                                                                      })

                                                                                                })
                                                                                                .catch(err => {
                                                                                                      console.log(err);

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "0",
                                                                                                            message: "Something Went Wrong. Please Try Later..!!"
                                                                                                      })

                                                                                                })

                                                                                          // console.log("emit send message teacher");

                                                                                          // io.sockets.in(roomId).emit("receiveMessage", {
                                                                                          //       "messageList": messageDetails.messageList
                                                                                          // });

                                                                                          // res.status(200).json({
                                                                                          //       statusCode: "1",
                                                                                          //       messageList: messageDetails.messageList,
                                                                                          //       message: "Message Sent Successfully...!!"
                                                                                          // })

                                                                                    } else if (messageDetails.statusCode == 2) {

                                                                                          res.status(200).json({
                                                                                                statusCode: "0",
                                                                                                message: "Access Denied....!!"
                                                                                          })

                                                                                    } else {

                                                                                          res.status(200).json({
                                                                                                statusCode: "0",
                                                                                                message: "Something Went Wrong. Please Try Later..!!"
                                                                                          })

                                                                                    }

                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something Went Wrong. Please Try Later..!!"
                                                                                    })

                                                                              })

                                                                  })
                                                                  .catch(err => {

                                                                        console.log(err);

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something Went Wrong. Please Try Later..!!"
                                                                        })

                                                                  })

                                                      } else {

                                                            let PromiseData = []

                                                            /**Get ClassId where Teacher is associated with */
                                                            ClassTeacherConnectionModel.findOne({
                                                                  _id: roomId,
                                                                  isActive: true
                                                            }).exec()
                                                                  .then(ClassTeacherConnection => {

                                                                        if (ClassTeacherConnection) {

                                                                              ClassStudentConnectionModel.find({
                                                                                    classId: ClassTeacherConnection.classId,
                                                                                    connectionStatus: 1,
                                                                                    isActive: true
                                                                              })
                                                                                    .exec()
                                                                                    .then(async ChatStudents => {

                                                                                          if (ChatStudents.length > 0) {

                                                                                                let studentList = ChatStudents.map(student => student.studentId)

                                                                                                SaveMessage(teacherId, roomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId, dontIncrementNewMessageFlag = 1)
                                                                                                      .then(async GroupMessageSavedId => {

                                                                                                            for (let index = 0; index < studentList.length; index++) {
                                                                                                                  const receiverUserId = studentList[index];

                                                                                                                  let Connection = await ChatConversationModel.findOne({
                                                                                                                        initiatorUserId: teacherId,
                                                                                                                        receiverUserId,
                                                                                                                        connectionType: 1,
                                                                                                                        deleteStatus: false,
                                                                                                                        isActive: true
                                                                                                                  }).exec()

                                                                                                                  let ConnectedRoomId = "";

                                                                                                                  if (Connection) {
                                                                                                                        ConnectedRoomId = Connection.roomId
                                                                                                                  } else {
                                                                                                                        ConnectedRoomId = await createNewOneToOneChatConnection(teacherId, receiverUserId)
                                                                                                                  }

                                                                                                                  await SaveMessage(teacherId, ConnectedRoomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId)
                                                                                                                        .then(async messageSavedId => {

                                                                                                                              await GetMessageOnId(teacherId, ConnectedRoomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details
                                                                                                                                    .then(async messageDetails => {

                                                                                                                                          await sendConnectionRecordOnSocket(ConnectedRoomId, teacherId)
                                                                                                                                                .then(connectionsSent => {

                                                                                                                                                      console.log("emit send message teacher");

                                                                                                                                                      let emittedMessage = io.sockets.in(ConnectedRoomId).emit("receiveMessage", {
                                                                                                                                                            "messageList": messageDetails.messageList
                                                                                                                                                      });

                                                                                                                                                      PromiseData.push(emittedMessage);

                                                                                                                                                })
                                                                                                                                                .catch(err => {
                                                                                                                                                      console.log(err);
                                                                                                                                                      error = 0
                                                                                                                                                })

                                                                                                                                          // console.log("emit send message teacher");

                                                                                                                                          // let emittedMessage = io.sockets.in(ConnectedRoomId).emit("receiveMessage", {
                                                                                                                                          //       "messageList": messageDetails.messageList
                                                                                                                                          // });

                                                                                                                                          // PromiseData.push(emittedMessage);

                                                                                                                                    })
                                                                                                                                    .catch(err => {
                                                                                                                                          console.log(err);
                                                                                                                                          error = 0
                                                                                                                                    })

                                                                                                                        })
                                                                                                                        .catch(err => {
                                                                                                                              console.log(err);
                                                                                                                              error = 0
                                                                                                                        })

                                                                                                            }

                                                                                                            Promise.all(PromiseData)
                                                                                                                  .then(MessageSent => {

                                                                                                                        if (MessageSent) {

                                                                                                                              GetMessageOnId(teacherId, roomId, GroupMessageSavedId, 1) //Check getDetails Flag to 1 to get details
                                                                                                                                    .then(messageDetails => {

                                                                                                                                          console.log("sent Group message teacher");
                                                                                                                                          console.log(GroupMessageSavedId);

                                                                                                                                          ChatConversationModel.updateOne({
                                                                                                                                                initiatorUserId: teacherId,
                                                                                                                                                roomId
                                                                                                                                          }, {
                                                                                                                                                $set: {
                                                                                                                                                      lastMessageId: GroupMessageSavedId
                                                                                                                                                }
                                                                                                                                          }).exec()
                                                                                                                                                .then(updatedLastmessageId => {

                                                                                                                                                      console.log(updatedLastmessageId)

                                                                                                                                                      if (updatedLastmessageId.n == 1) {

                                                                                                                                                            res.status(200).json({
                                                                                                                                                                  statusCode: "1",
                                                                                                                                                                  messageList: messageDetails.messageList,
                                                                                                                                                                  message: "Message Sent Successfully...!!"
                                                                                                                                                            })

                                                                                                                                                      } else {

                                                                                                                                                            res.status(200).json({
                                                                                                                                                                  statusCode: "0",
                                                                                                                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                                                                                                                            })

                                                                                                                                                      }
                                                                                                                                                })
                                                                                                                                                .catch(err => {
                                                                                                                                                      console.log(err);
                                                                                                                                                      res.status(200).json({
                                                                                                                                                            statusCode: "0",
                                                                                                                                                            message: "Something Went Wrong. Please Try Later..!!"
                                                                                                                                                      })
                                                                                                                                                })


                                                                                                                                    })
                                                                                                                                    .catch(err => {
                                                                                                                                          console.log(err);
                                                                                                                                          res.status(200).json({
                                                                                                                                                statusCode: "0",
                                                                                                                                                message: "Something Went Wrong. Please Try Later..!!"
                                                                                                                                          })
                                                                                                                                    })
                                                                                                                        } else {
                                                                                                                              res.status(200).json({
                                                                                                                                    statusCode: "0",
                                                                                                                                    message: "Something Went Wrong. Please Try Later..!!"
                                                                                                                              })
                                                                                                                        }

                                                                                                                  })
                                                                                                                  .catch(err => {
                                                                                                                        console.log(err);
                                                                                                                        res.status(200).json({
                                                                                                                              statusCode: "0",
                                                                                                                              message: "Something Went Wrong. Please Try Later..!!"
                                                                                                                        })
                                                                                                                  })

                                                                                                      })
                                                                                                      .catch(err => {

                                                                                                            console.log(err);

                                                                                                            res.status(200).json({
                                                                                                                  statusCode: "0",
                                                                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                                                                            })

                                                                                                      })

                                                                                          } else {
                                                                                                res.status(200).json({
                                                                                                      statusCode: "0",
                                                                                                      message: "No Students Assigned to this group...!!"
                                                                                                })
                                                                                          }

                                                                                    })
                                                                                    .catch(err => {
                                                                                          console.log(err);

                                                                                          res.status(200).json({
                                                                                                statusCode: "0",
                                                                                                message: "Something Went Wrong. Please Try Later..!!"
                                                                                          })

                                                                                    })
                                                                        } else {
                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Cannot send Message to this Group..!!"
                                                                              })
                                                                        }

                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something Went Wrong. Please Try Later..!!"
                                                                        })

                                                                  })
                                                      }

                                                } else {
                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Access Denied..!!"
                                                      })
                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                })
                                          })

                              } else {

                                    res.status(200).json({
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

            } catch (error) {
                  console.log(error)
                  res.status(200).json({
                        statusCode: "0",
                        message: "Something Went Wrong. Please Try Later..!!"
                  })
            }

      });


      routes.post('/broadCast', checkAuth, upload.any('chatDocument'), (req, res, next) => {

            try {

                  let messageUrls = new Array();

                  if (req.files) {
                        let _filesArray = req.files;

                        _filesArray.forEach(_file => {
                              let correctPath = _file.path.replace(/\\/g, '/');
                              messageUrls.push(correctPath);
                        });
                  }

                  console.log(req.body)

                  if (req.body.teacherId && req.body.receiverUserIds && req.body.receiverUserIds.split(',').length > 0 && req.body.messageType && (req.body.message || messageUrls.length > 0)) {

                        let teacherId = req.body.teacherId;
                        let receiverUserIds = req.body.receiverUserIds;
                        let message = req.body.message;
                        let messageType = req.body.messageType; //1-message 2-leave letter 3-image 4-attachment 5-School Assignment 6-audio 7-video

                        console.log(req.body);

                        let splitReceiverUserIds = receiverUserIds.split(',');

                        mongoose.set('debug', true);

                        //Verify Teacher and Grade
                        VerifyTeacher(teacherId, "", async (error, response) => {

                              // console.log(response);

                              if (response && response.statusCode != "0") {

                                    let alreadyConnectedList = [];

                                    for (let index = 0; index < splitReceiverUserIds.length; index++) {
                                          const receiverUserId = splitReceiverUserIds[index];

                                          let Connection = ChatConversationModel.findOne({
                                                initiatorUserId: teacherId,
                                                receiverUserId,
                                                deleteStatus: false,
                                                isActive: true
                                          })
                                                .exec()

                                          alreadyConnectedList.push(Connection)
                                    }

                                    Promise.all(alreadyConnectedList)
                                          .then(connectionList => {

                                                let roomIds = [];

                                                if (connectionList.length > 0) {

                                                      for (let index = 0; index < connectionList.length; index++) {
                                                            const connection = connectionList[index];

                                                            if (!connection) {
                                                                  // roomIds[index] = await createNewOneToOneChatConnection(teacherId, splitReceiverUserIds[index])
                                                                  roomIds.push(createNewOneToOneChatConnection(teacherId, splitReceiverUserIds[index]))
                                                            } else {
                                                                  // roomIds[index] = connection.roomId
                                                                  roomIds.push(connection.roomId)
                                                            }

                                                      }

                                                } else {

                                                      for (let index = 0; index < splitReceiverUserIds.length; index++) {
                                                            // roomIds[index] = await createNewOneToOneChatConnection(teacherId, splitReceiverUserIds[index])
                                                            roomIds.push(createNewOneToOneChatConnection(teacherId, splitReceiverUserIds[index]))
                                                      }
                                                }


                                                Promise.all(roomIds)
                                                      .then(async allRoomRecords => {

                                                            console.log(allRoomRecords);

                                                            let error = 0;

                                                            for (let index = 0; index < allRoomRecords.length; index++) {
                                                                  const roomId = allRoomRecords[index];

                                                                  const messageSavedId = await SaveMessage(teacherId, roomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId);

                                                                  const messageDetails = await GetMessageOnId(teacherId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details

                                                                  if (messageDetails.statusCode == 1) {

                                                                        await sendConnectionRecordOnSocket(roomId, teacherId)
                                                                              .then(connectionsSent => {

                                                                                    console.log("emit send message teacher");

                                                                                    io.sockets.in(roomId).emit("receiveMessage", {
                                                                                          "messageList": messageDetails.messageList
                                                                                    });

                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);
                                                                                    error = 1
                                                                              })

                                                                        // io.sockets.in(roomId).emit("receiveMessage", {
                                                                        //       "messageList": messageDetails.messageList
                                                                        // });

                                                                  } else {
                                                                        error = 1
                                                                  }

                                                            }

                                                            if (error == 0) {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "BroadCast Successfull...!!"
                                                                  })

                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something Went Wrong. Please Try Later..!!"
                                                                  })

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                            })

                                                      })

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                })

                                          })

                                    // .then(messageDetails => {

                                    //       // console.log(messageDetails);

                                    //       if (messageDetails.statusCode == 1) {

                                    //             console.log("emit send message teacher");

                                    //             io.sockets.in(roomId).emit("receiveMessage", {
                                    //                   "messageList": messageDetails.messageList
                                    //             });

                                    //             res.status(200).json({
                                    //                   statusCode: "1",
                                    //                   messageList: messageDetails.messageList,
                                    //                   message: "Message Sent Successfully...!!"
                                    //             })

                                    //       } else if (messageDetails.statusCode == 2) {

                                    //             res.status(200).json({
                                    //                   statusCode: "0",
                                    //                   message: "Access Denied....!!"
                                    //             })

                                    //       } else {

                                    //             res.status(200).json({
                                    //                   statusCode: "0",
                                    //                   message: "Something Went Wrong. Please Try Later..!!"
                                    //             })

                                    //       }

                                    // })
                                    //       .catch(err => {
                                    //             console.log(err);

                                    //             res.status(200).json({
                                    //                   statusCode: "0",
                                    //                   message: "Something Went Wrong. Please Try Later..!!"
                                    //             })

                                    //       })

                                    // Promise.all(savedMessageIds)
                                    //       .then(savedMessages => {

                                    //             console.log(savedMessages);

                                    //             if (savedMessages.length > 0) {

                                    //                   for (let index = 0; index < savedMessages.length; index++) {



                                    //                   }

                                    //             }

                                    //       })
                                    //       .catch(err => {
                                    //             console.log(err);

                                    //             res.status(200).json({
                                    //                   statusCode: "0",
                                    //                   message: "Something Went Wrong. Please Try Later..!!"
                                    //             })

                                    //       })

                                    // for (let index = 0; index < splitReceiverUserIds.length; index++) {
                                    //       const receiverUserId = splitReceiverUserIds[index];

                                    //       ChatConversationModel.findOne({
                                    //             initiatorUserId: teacherId,
                                    //             receiverUserId,
                                    //             deleteStatus: false,
                                    //             isActive: true
                                    //       })
                                    //             .exec()
                                    //             .then(async Connection => {

                                    //                   let roomId = "";

                                    //                   if (Connection) {
                                    //                         roomId = Connection.roomId
                                    //                   } else {
                                    //                         roomId = await createNewOneToOneChatConnection(teacherId, receiverUserId)
                                    //                   }

                                    //                   SaveMessage(teacherId, roomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId)
                                    //                         .then(messageSavedId => {

                                    //                               getMessageOnId(teacherId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details
                                    //                                     .then(messageDetails => {

                                    //                                           // console.log(messageDetails);

                                    //                                           if (messageDetails.statusCode == 1) {

                                    //                                                 console.log("emit send message teacher");

                                    //                                                 io.sockets.in(roomId).emit("receiveMessage", {
                                    //                                                       "messageList": messageDetails.messageList
                                    //                                                 });

                                    //                                                 res.status(200).json({
                                    //                                                       statusCode: "1",
                                    //                                                       messageList: messageDetails.messageList,
                                    //                                                       message: "Message Sent Successfully...!!"
                                    //                                                 })

                                    //                                           } else if (messageDetails.statusCode == 2) {

                                    //                                                 res.status(200).json({
                                    //                                                       statusCode: "0",
                                    //                                                       message: "Access Denied....!!"
                                    //                                                 })

                                    //                                           } else {

                                    //                                                 res.status(200).json({
                                    //                                                       statusCode: "0",
                                    //                                                       message: "Something Went Wrong. Please Try Later..!!"
                                    //                                                 })

                                    //                                           }

                                    //                                     })
                                    //                                     .catch(err => {
                                    //                                           console.log(err);

                                    //                                           res.status(200).json({
                                    //                                                 statusCode: "0",
                                    //                                                 message: "Something Went Wrong. Please Try Later..!!"
                                    //                                           })

                                    //                                     })

                                    //                         })
                                    //                         .catch(err => {
                                    //                               console.log(err);

                                    //                               res.status(200).json({
                                    //                                     statusCode: "0",
                                    //                                     message: "Something Went Wrong. Please Try Later..!!"
                                    //                               })

                                    //                         })


                                    //             })
                                    //             .catch(err => {
                                    //                   console.log(err);

                                    //                   res.status(200).json({
                                    //                         statusCode: "0",
                                    //                         message: "Something Went Wrong. Please Try Later..!!"
                                    //                   })
                                    //             })

                                    // }



                              } else {

                                    res.status(200).json({
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

            } catch (error) {
                  console.log(error)

                  res.status(200).json({
                        statusCode: "0",
                        message: "Something Went Wrong. Please Try Later..!!"
                  })
            }

      });



      /**
       * This function works to save Leave Letter sent from student
       */
      routes.post('/mail', checkAuth, upload.any('chatDocument'), async (req, res, next) => {

            let leaveLetterUrls = new Array();

            if (req.files) {
                  let filesArray = req.files;
A
                  filesArray.forEach(file => {
                        let correctPath = file.path.replace(/\\/g, '/');
                        leaveLetterUrls.push(correctPath);
                  });
            }

            console.log(req.body);

            if (req.body.teacherId && req.body.receiverUserIds && req.body.subject && req.body.message) { // && req.body.subject //&& req.body.receiverUserIds.trim().split(',') > 0 

                  let teacherId = req.body.teacherId;

                  let receiverUserIdList = req.body.receiverUserIds.trim().split(',');

                  let mailSubject = req.body.subject;

                  let message = req.body.message;


                  VerifyTeacher(teacherId, "", (error, response) => {

                        if (response && response.statusCode != "0") {

                              UserModel.find({
                                    _id: {
                                          $in: receiverUserIdList
                                    },
                                    $or: [{
                                          type: 0 //Teacher
                                    }, {
                                          type: 1 //Student
                                    }],
                                    isActive: true
                              }).exec()
                                    .then(async receiverList => {

                                          if (receiverList.length == receiverUserIdList.length) {

                                                let nameList = [];

                                                for (let index = 0; index < receiverList.length; index++) {
                                                      const User = receiverList[index];

                                                      nameList.push({
                                                            userName: User.firstName + " " + User.surName
                                                      })

                                                }

                                                /************************* PDF Creation Start **********************/

                                                // Read HTML Template
                                                let html = fs.readFileSync(path.join(__dirname, '../shared/leaveLetterTemplate.html'), 'utf8'); // './template.html'

                                                let leaveLetterUrlList = [];

                                                for (let index = 0; index < leaveLetterUrls.length; index++) {
                                                      leaveLetterUrlList.push({
                                                            url: process.env.API_URL + '/' + leaveLetterUrls[index]
                                                      });
                                                }

                                                console.log("process.env.API_URL");
                                                console.log(process.env.API_URL);

                                                console.log(leaveLetterUrlList);

                                                let randNum = Math.round(Math.random() * (999999 - 111111));

                                                let document = {
                                                      html: html,
                                                      data: {
                                                            fromUsers: [{
                                                                  user: response.teacherData.firstName + " " + response.teacherData.surName
                                                            }],
                                                            nameList,
                                                            subject: [{
                                                                  mailSubject
                                                            }],
                                                            // fromDate: [{
                                                            //       date: fromDate
                                                            // }],
                                                            // toDate: [{
                                                            //       date: toDate
                                                            // }],
                                                            messageData: [{
                                                                  message,
                                                            }],
                                                            leaveLetterUrls: leaveLetterUrlList
                                                      },
                                                      path: './uploads/chat/student/leaveLetter/' + fileName + randNum + '.pdf'
                                                };

                                                let options = {
                                                      format: "A4",
                                                      orientation: "portrait",
                                                      border: "20mm"
                                                };

                                                console.log(document);

                                                pdf.create(document, options)
                                                      .then(res => {
                                                            console.log(res)
                                                      })
                                                      .catch(error => {
                                                            console.error(error)
                                                      });

                                                /**************************** PDF Creation End *****************************/


                                                let errorReceiverUserIds = [];
                                                let promiseData = [];

                                                for (let index = 0; index < receiverUserIdList.length; index++) {
                                                      const receiverUserId = receiverUserIdList[index];

                                                      ChatConversationModel.findOne({
                                                            initiatorUserId: teacherId,
                                                            receiverUserId,
                                                            deleteStatus: false,
                                                            isActive: true
                                                      })
                                                            .exec()
                                                            .then(async Connection => {

                                                                  let roomId = "";

                                                                  if (Connection) {
                                                                        roomId = Connection.roomId
                                                                  } else {
                                                                        roomId = await createNewOneToOneChatConnection(teacherId, receiverUserId)
                                                                  }

                                                                  SaveMessage(teacherId, roomId, message = "", messageType = 2, messageUrls = ['uploads/chat/student/leaveLetter/' + fileName + randNum + '.pdf'], "", "", "", 1, 1)
                                                                        .then(messageSavedId => {

                                                                              GetMessageOnId(teacherId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details
                                                                                    .then(messageDetails => {

                                                                                          // console.log(messageDetails);

                                                                                          if (messageDetails.statusCode == 1) {

                                                                                                sendConnectionRecordOnSocket(roomId, teacherId)
                                                                                                      .then(connectionsSent => {


                                                                                                            console.log("emit send message student");

                                                                                                            let MessageEmitted = io.sockets.in(roomId).emit("receiveMessage", {
                                                                                                                  "messageList": messageDetails.messageList
                                                                                                            });

                                                                                                            promiseData.push(MessageEmitted);

                                                                                                      })
                                                                                                      .catch(err => {
                                                                                                            console.log(err);
                                                                                                            errorReceiverUserIds.push(receiverUserId);
                                                                                                      })

                                                                                          } else if (messageDetails.statusCode == 2) {
                                                                                                errorReceiverUserIds.push(receiverUserId);
                                                                                          } else {
                                                                                                errorReceiverUserIds.push(receiverUserId);
                                                                                          }

                                                                                    })
                                                                                    .catch(err => {
                                                                                          console.log(err);
                                                                                          errorReceiverUserIds.push(receiverUserId);
                                                                                    })

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err);
                                                                              errorReceiverUserIds.push(receiverUserId);
                                                                        })


                                                            })
                                                            .catch(err => {
                                                                  console.log(err);
                                                                  errorReceiverUserIds.push(receiverUserId);
                                                            })

                                                }

                                                Promise.all(promiseData)
                                                      .then(success => {

                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  errorReceiverUserIds,
                                                                  message: "Message Sent Successfully...!!"
                                                            })
                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                            })
                                                      })


                                          } else {

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                })

                                          }
                                    })
                                    .catch(err => {
                                          console.log(err);
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied...!!"

                                          })

                                    })



                        } else {
                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Access Denied...!!"

                              })
                        }

                  })

            } else {
                  res.status(200).json({
                        "statusCode": "0",
                        "message": "All Fields are mandatory...!!"
                  })

            }

      });


      routes.get('/chatConversation/:teacherId/:requestId/:requestType/:messageId?', checkAuth, ChatConversation);


      routes.post('/createGroup', checkAuth, upload.single('groupPic'), (req, res, next) => {

            try {

                  let groupPic = req.file ? req.file.path.replace(/\\/g, '/') : "";

                  console.log(req.body)

                  if (req.body.teacherId && req.body.groupName && req.body.groupUserIds && req.body.groupUserIds.split('%-%').length > 0) {

                        let teacherId = req.body.teacherId;
                        let groupName = req.body.groupName;
                        // let groupUserIds = req.body.groupUserIds;
                        let splitedGroupUserIds = req.body.groupUserIds.split('%-%');

                        mongoose.set('debug', true);

                        //Verify Teacher and Grade
                        VerifyTeacher(teacherId, "", async (error, response) => {

                              console.log(response);

                              if (response && response.statusCode != "0") {

                                    UserModel.find({
                                          _id: {
                                                $in: splitedGroupUserIds
                                          },
                                          isActive: true
                                    })
                                          .then(splitedUsers => {

                                                if (splitedUsers.length == splitedGroupUserIds.length) {

                                                      AddNewGroupConnection(splitedGroupUserIds, groupName, groupPic, teacherId)
                                                            .then(GroupCreated => {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "Created Successfully..!!"
                                                                  })

                                                            })
                                                            .catch(err => {
                                                                  console.log(err)

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something Went Wrong. Please Try Later..!!"
                                                                  })
                                                            })

                                                } else {
                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Something Went Wrong. Please Try Later..!!"
                                                      })
                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                })

                                          })

                              } else {

                                    res.status(200).json({
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

            } catch (error) {
                  console.log(error)

                  res.status(200).json({
                        statusCode: "0",
                        message: "Something Went Wrong. Please Try Later..!!"
                  })
            }

      });


      routes.patch('/forwardMessage/:teacherId/:roomId', checkAuth, (req, res, next) => {

            if (req.params.teacherId && req.params.conversationId && req.body.messageIds && req.body.forwardReceiverandRoomIds) {

                  let teacherId = req.params.teacherId;
                  let conversationId = req.params.conversationId;
                  let messageId = req.params.messageId;
                  let SplitedForwardReceiverandRoomIds = req.body.forwardReceiverandRoomIds.split(',');


                  //Verify Teacher and Grade
                  VerifyTeacher(teacherId, "", async (error, response) => {

                        if (response && response.statusCode != "0") {

                              ChatConversationModel.find({
                                    $or: [{
                                          roomId: {
                                                $in: SplitedForwardReceiverandRoomIds
                                          }
                                    }, {
                                          roomId: {
                                                $in: SplitedForwardReceiverandRoomIds
                                          }
                                    }]
                              })


                              ChatConversationModel.find({
                                    _id: {
                                          $in: SplitedConversationIds
                                    },
                                    teacherId,
                                    isActive: true
                              })
                                    .exec()
                                    .then(ConversationList => {

                                          console.log(ConversationList);
                                          console.log("ConversationList");


                                          if (ConversationList.length == SplitedConversationIds.length) {

                                                chatMessageModel.findOne({
                                                      _id: messageId,
                                                      conversationId,
                                                      deleteAll: false,
                                                      deletedUsers: {
                                                            $ne: teacherId
                                                      },
                                                      isActive: true
                                                })
                                                      .exec()
                                                      .then(async messageData => {

                                                            if (messageData) {

                                                                  let i = 0;
                                                                  let error = 0;

                                                                  while (i < SplitedConversationIds.length && error == 0) {

                                                                        let conversation_Id = SplitedConversationIds[i];

                                                                        const NewMessage = new chatMessageModel({
                                                                              _id: new mongoose.Types.ObjectId(),
                                                                              userId: teacherId,
                                                                              conversationId: conversation_Id,
                                                                              messageType: messageData.messageType,
                                                                              message: messageData.message,
                                                                              urls: messageData.urls
                                                                        })

                                                                        if (messageData.assignmentSchoolId) {
                                                                              NewMessage.assignmentSchoolId = messageData.assignmentSchoolId
                                                                        }

                                                                        if (messageData.fileTiming) {
                                                                              NewMessage.fileTiming = messageData.fileTiming
                                                                        }

                                                                        if (messageData.replyId) {
                                                                              NewMessage.replyId = messageData.replyId
                                                                              NewMessage.replyUserId = messageData.replyUserId
                                                                        }

                                                                        await NewMessage.save()
                                                                              .then(async messageSaved => {

                                                                                    await ChatConversationModel.updateOne({
                                                                                          _id: messageSaved.conversationId
                                                                                    }, {
                                                                                          $set: {
                                                                                                lastMessageId: messageSaved._id
                                                                                          }
                                                                                    }).exec()

                                                                                    await GetMessageOnId(teacherId, messageSaved.conversationId, messageSaved._id, 1) //Check getDetails Flag to 1 to get details
                                                                                          .then(async messageDetails => {


                                                                                                if (messageDetails.statusCode == 1) {

                                                                                                      console.log('emit send message teacher');

                                                                                                      io.sockets.in(messageSaved.conversationId).emit("receiveMessage", {
                                                                                                            "messageList": messageDetails.messageList
                                                                                                      });

                                                                                                } else {

                                                                                                      error = 1;

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "0",
                                                                                                            message: "Something Went Wrong. Please Try Later..!!"
                                                                                                      })

                                                                                                }

                                                                                          })
                                                                                          .catch(err => {
                                                                                                console.log(err);

                                                                                                error = 1;

                                                                                                res.status(200).json({
                                                                                                      statusCode: "0",
                                                                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                                                                })

                                                                                          })

                                                                              })
                                                                              .catch(err => {

                                                                                    console.log(err);
                                                                                    error = 1;

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something Went Wrong. Please Try Later..!!"
                                                                                    })

                                                                              })


                                                                        i++;
                                                                  }

                                                                  if (error == 0) {

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Message Forwarded Successfull...!!"
                                                                        })

                                                                  }

                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Access Denied..!!"
                                                                  })

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                            })

                                                      })

                                          } else {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Access Denied..!!"
                                                })
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later..!!"
                                          })

                                    })


                        } else {

                              res.status(200).json({
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

      });


      routes.patch('/updateSeenStatus/:teacherId/:roomId', checkAuth, (req, res, next) => {

            if (req.params.teacherId && req.params.roomId) {

                  let teacherId = req.params.teacherId;
                  let roomId = req.params.roomId;

                  console.log(req.params)

                  //Verify Teacher and Grade
                  VerifyTeacher(teacherId, "", async (error, response) => {

                        if (response && response.statusCode != "0") {

                              ChatConversationModel.findOne({
                                    initiatorUserId: teacherId,
                                    roomId,
                                    deleteStatus: false,
                                    isActive: true,
                              })
                                    .exec()
                                    .then(conversation => {

                                          if (conversation) {
                                                /**
                                                 * Update individual messages seen status which were greater than last messageId saved
                                                 */
                                                chatMessageModel.find({
                                                      roomId,
                                                      userId: {
                                                            $ne: teacherId
                                                      },
                                                      deleteAllStatus: false,
                                                      isActive: true,
                                                      seenStatus: false
                                                })
                                                      .exec()
                                                      .then(allUnSeenMessagesList => {

                                                            if (allUnSeenMessagesList.length > 0) {

                                                                  let messageIdsList = allUnSeenMessagesList.map(message => message._id);

                                                                  let updateObj = "";

                                                                  if (conversation.connectionType == 1) {
                                                                        updateObj = {
                                                                              $set: {
                                                                                    seenStatus: true
                                                                              }
                                                                        }
                                                                  } else {
                                                                        updateObj = {
                                                                              $push: {
                                                                                    seenUsers: teacherId
                                                                              }
                                                                        }
                                                                  }

                                                                  /**
                                                                   * Update individual messages seen status which were greater than last messageId saved
                                                                   */
                                                                  chatMessageModel.updateMany({
                                                                        _id: {
                                                                              $in: messageIdsList
                                                                        }
                                                                  }, updateObj)
                                                                        .exec()
                                                                        .then(individualChatsUpdated => {

                                                                              if (individualChatsUpdated.ok == 1) {

                                                                                    ChatConversationModel.updateOne({
                                                                                          initiatorUserId: teacherId,
                                                                                          roomId,
                                                                                          deleteStatus: false,
                                                                                          isActive: true
                                                                                    }, {
                                                                                          newMessageCount: 0,
                                                                                          newMailCount: 0,
                                                                                    }).exec()
                                                                                          .then(async connectionUpdated => {

                                                                                                if (connectionUpdated.ok == 1) {

                                                                                                      console.log('emit teacher seen status');

                                                                                                      await io.sockets.in(roomId).emit("teacherEmitSeenStatus", {
                                                                                                            messageIdsList,
                                                                                                            roomId
                                                                                                      });

                                                                                                      console.log('emit teacher online status');


                                                                                                      await io.sockets.in(roomId).emit("teacherEmitOnlineStatus", {
                                                                                                            userId: teacherId,
                                                                                                            roomId
                                                                                                      });

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "1",
                                                                                                            message: "Update Successfull...!!"
                                                                                                      })

                                                                                                } else {
                                                                                                      res.status(200).json({
                                                                                                            statusCode: "0",
                                                                                                            message: "Something Went Wrong. Please Try Later..!!"
                                                                                                      })
                                                                                                }

                                                                                          })
                                                                                          .catch(err => {
                                                                                                console.log(err);

                                                                                                res.status(200).json({
                                                                                                      statusCode: "0",
                                                                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                                                                })
                                                                                          })

                                                                              } else {

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something Went Wrong. Please Try Later..!!"
                                                                                    })

                                                                              }

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err);

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something Went Wrong. Please Try Later..!!"
                                                                              })
                                                                        })
                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "Update Successfull...!!"
                                                                  })

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Please Try Later..!!"
                                                            })
                                                      })
                                          } else {

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Access Denied..!!"
                                                })

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later..!!"
                                          })
                                    })

                        } else {

                              res.status(200).json({
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
      })


      routes.patch('/delete/:teacherId/:roomId/:deleteType', checkAuth, (req, res, next) => {

            if (req.params.teacherId && req.params.roomId && req.body.messageIds && req.params.deleteType) {

                  let teacherId = req.params.teacherId;
                  let roomId = req.params.roomId;
                  let messageIdsArray = req.body.messageIds.split(',');
                  let deleteType = req.params.deleteType; // 1- delete 2- deleteAll

                  // mongoose.set('debug', true);

                  //Verify Teacher and Grade
                  VerifyTeacher(teacherId, "", (error, response) => {

                        if (response && response.statusCode != "0") {

                              // console.log("teacherId" + teacherId);
                              // console.log("groupId" + groupId);

                              let query = "";

                              if (deleteType == 1) {
                                    query = {
                                          _id: {
                                                $in: messageIdsArray
                                          },
                                          roomId,
                                          deletedUsers: {
                                                $ne: teacherId
                                          },
                                          isActive: true
                                    }
                              } else {
                                    query = {
                                          _id: {
                                                $in: messageIdsArray
                                          },
                                          roomId,
                                          userId: teacherId,
                                          deletedUsers: {
                                                $ne: teacherId
                                          },
                                          isActive: true
                                    }
                              }

                              chatMessageModel.find(query)
                                    .populate('userId', 'firstName profilePic isActive')
                                    // .populate('individualUserId', 'name profilePic isActive')
                                    .populate('replyId')
                                    .populate('replyUserId')
                                    .populate('assignmentSchoolId')
                                    .exec()
                                    .then(messages => {

                                          // console.log(messages);

                                          if (messageIdsArray.length == messages.length) {


                                                if (messages.length > 0) {

                                                      let updateData = "";
                                                      let error = 0;

                                                      if (deleteType == 2) {

                                                            let i = 0;

                                                            while (i < messages.length && error == 0) {

                                                                  let sMessage = messages[i];

                                                                  // console.log(sMessage);
                                                                  // console.log(String(sMessage.userId) + " == " + teacherId);

                                                                  if (String(sMessage.userId._id) == teacherId && sMessage.deleteAllStatus == false) {

                                                                        let today = new Date();

                                                                        today.setMinutes(today.getMinutes() + 330); //Adding Timestamp by 5hr 30 min

                                                                        // console.log(today);
                                                                        // console.log(sMessage.date);

                                                                        let dateDiff = new DateDiff(today, sMessage.date);

                                                                        // console.log(dateDiff.minutes);

                                                                        if (dateDiff.minutes() < 60) {

                                                                              updateData = {
                                                                                    $set: {
                                                                                          deleteAllStatus: true
                                                                                    }
                                                                              };

                                                                        } else {

                                                                              error = 1;

                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Cannot Delete All for time elapsed.....!!"
                                                                              })

                                                                        }

                                                                  } else {
                                                                        error = 1;
                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Access Denied.....!!"
                                                                        })
                                                                  }

                                                                  i++;
                                                            }

                                                      } else {

                                                            updateData = {

                                                                  $push: {
                                                                        deletedUsers: teacherId
                                                                  }

                                                            };
                                                      }

                                                      if (error == 0) {

                                                            // console.log(updateData);

                                                            chatMessageModel.updateMany({
                                                                  _id: {
                                                                        $in: messageIdsArray
                                                                  },
                                                            }, updateData)
                                                                  .exec()
                                                                  .then(async messageDeleteUpdatedSuccessfull => {

                                                                        // if (messageDeleteUpdatedSuccessfull.nModified > 0) {

                                                                        //       if (deleteType == 2) {

                                                                        //             console.log('emit student delete all message Ids');

                                                                        //             io.sockets.in(roomId).emit("deleteAllMessageIds", {
                                                                        //                   roomId,
                                                                        //                   "messageIdsList": messageIdsArray
                                                                        //             });

                                                                        //       }

                                                                        // }

                                                                        ChatConversationModel.find({
                                                                              roomId,
                                                                              deleteStatus: false,
                                                                              isActive: true
                                                                        }).exec()
                                                                              .then(async allRoomChatConnections => {

                                                                                    let PromiseSaved = []

                                                                                    for (let index = 0; index < allRoomChatConnections.length; index++) {
                                                                                          const chatConnection = allRoomChatConnections[index];

                                                                                          /**Update LastMessage Id */

                                                                                          let message = await chatMessageModel.findOne({
                                                                                                roomId,
                                                                                                deletedUsers: {
                                                                                                      $ne: chatConnection.initiatorUserId
                                                                                                },
                                                                                                isActive: true
                                                                                          }).sort({
                                                                                                date: -1
                                                                                          }).exec()

                                                                                          console.log("message");
                                                                                          console.log(message);

                                                                                          let updateQuery = {
                                                                                                $set: {
                                                                                                      lastMessageDate: message.date
                                                                                                }
                                                                                          }

                                                                                          if (deleteType == 1) {
                                                                                                updateQuery = {
                                                                                                      $set: {
                                                                                                            lastMessageId: message ? message._id : "",
                                                                                                            lastMessageDate: message.date
                                                                                                      }
                                                                                                }
                                                                                          }

                                                                                          let lastMessageUpdated = ChatConversationModel.updateOne({
                                                                                                _id: chatConnection._id,
                                                                                                // studentId,
                                                                                                isActive: true
                                                                                          }, updateQuery).exec()

                                                                                          PromiseSaved.push(lastMessageUpdated)

                                                                                    }

                                                                                    Promise.all(PromiseSaved)
                                                                                          .then(updationCompleted => {

                                                                                                if (deleteType == 2) {

                                                                                                      // GetConnectionOnId(roomId, teacherId)
                                                                                                      sendConnectionRecordOnSocket(roomId, teacherId)
                                                                                                            .then(connectionsSent => {

                                                                                                                  console.log("emit send message teacher");

                                                                                                                  io.sockets.in(roomId).emit("deleteAllMessageIds", {
                                                                                                                        "roomId": roomId,
                                                                                                                        "messageIdsList": messageIdsArray
                                                                                                                  });

                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "1",
                                                                                                                        message: "Deleted Successfully...!!"
                                                                                                                  })

                                                                                                            })
                                                                                                            .catch(err => {
                                                                                                                  console.log(err);

                                                                                                                  res.status(200).json({
                                                                                                                        statusCode: "0",
                                                                                                                        message: "Something Went Wrong. Please Try Later..!!"
                                                                                                                  })

                                                                                                            })


                                                                                                } else {
                                                                                                      res.status(200).json({
                                                                                                            statusCode: "1",
                                                                                                            message: "Deleted Successfully...!!"
                                                                                                      })
                                                                                                }

                                                                                          })
                                                                                          .catch(err => {
                                                                                                console.log(err);

                                                                                                res.status(200).json({
                                                                                                      statusCode: "0",
                                                                                                      message: "Something Went Wrong. Please Try Later..!!"
                                                                                                })

                                                                                          })

                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something Went Wrong. Please Try Later..!!"
                                                                                    })

                                                                              })

                                                                        // await chatMessageModel.findOne({
                                                                        //       initiatorUserId: teacherId,
                                                                        //       roomId,
                                                                        //       deletedUsers: {
                                                                        //             $ne: teacherId
                                                                        //       },
                                                                        //       isActive: true
                                                                        // }).sort({
                                                                        //       date: -1
                                                                        // }).exec()
                                                                        //       .then(async message => {

                                                                        //             console.log("message");
                                                                        //             console.log(message);

                                                                        //             if (message) {

                                                                        //                   await ChatConversationModel.updateOne({
                                                                        //                         roomId,
                                                                        //                         initiatorUserId: teacherId,
                                                                        //                         isActive: true
                                                                        //                   }, {
                                                                        //                         $set: {
                                                                        //                               lastMessageId: message._id
                                                                        //                         }
                                                                        //                   }).exec()

                                                                        //             } else {
                                                                        //                   await ChatConversationModel.updateOne({
                                                                        //                         roomId,
                                                                        //                         initiatorUserId: teacherId,
                                                                        //                         isActive: true
                                                                        //                   }, {
                                                                        //                         $set: {
                                                                        //                               lastMessageId: ""
                                                                        //                         }
                                                                        //                   }).exec()
                                                                        //             }

                                                                        //       })



                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Deleted Successfully...!!"
                                                                        })

                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something Went Wrong. Please Try Later..!!"
                                                                        })

                                                                  })
                                                      }

                                                } else {
                                                      res.status(200).json({
                                                            "statusCode": "0",
                                                            "message": "No Records Found..!!"
                                                      })
                                                }

                                          } else {
                                                res.status(200).json({
                                                      "statusCode": "0",
                                                      "message": "Something Went Wrong. Please Try Later..!!"
                                                })
                                          }

                                    })
                                    .catch(err => {

                                          console.log(err);

                                          res.status(200).json({
                                                "statusCode": "0",
                                                "message": "Something Went Wrong. Please Try Later..!!"
                                          })

                                    })

                        } else {

                              res.status(200).json({
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

      });


      const sendConnectionRecordOnSocket = (roomId, userId) => {

            return new Promise((resolve, reject) => {

                  ChatConversationModel.find({
                        initiatorUserId: {
                              $ne: userId,
                        },
                        roomId,
                        deleteStatus: false,
                        isActive: true
                  })
                        .sort({
                              'lastMessageDate': -1
                        })
                        .populate('receiverUserId', 'firstName surName profilePic chatOnlineStatus')
                        .populate({
                              path: 'lastMessageId',
                              populate: { path: 'userId' }
                        })
                        .exec()
                        .then(async Connections => {

                              console.log("Connections");
                              console.log(Connections);
                              let sentSocketConnection = [];

                              if (Connections.length > 0) {

                                    for (let index = 0; index < Connections.length; index++) {
                                          const connection = Connections[index];
                                          sentSocketConnection.push(ParseConnections([connection], connection.initiatorUserId))
                                    }

                                    console.log("sentSocketConnection");
                                    console.log(sentSocketConnection);

                                    Promise.all(sentSocketConnection)
                                          .then(ConnectionList => {

                                                let SocketConnectionSent = []

                                                for (let index = 0; index < ConnectionList.length; index++) {
                                                      const connectionRecord = ConnectionList[index];

                                                      // io.sockets.in(roomId).emit("receiveMessage", {
                                                      //       "initiatorUserId": connectionRecord.initiatorUserId,
                                                      //       "connectionData": connectionRecord
                                                      // });

                                                      console.log('Connection Record')
                                                      console.log(connectionRecord)
                                                      // console.log(connectionRecord.initiatorUserId)

                                                      // SocketConnectionSent.push(io.sockets.in(roomId).emit("connectionRecord", {
                                                      //       "initiatorUserId": connectionRecord.initiatorUserId,
                                                      //       "connectionData": connectionRecord[0]
                                                      // }))

                                                      SocketConnectionSent.push(io.sockets.in(roomId).emit("connectionRecord", connectionRecord[0]))
                                                }

                                                Promise.all(SocketConnectionSent)
                                                      .then(dataSent => {
                                                            resolve(1)
                                                      })
                                                      .catch(err => {
                                                            console.log(err)
                                                            reject(0)
                                                      })


                                          })
                                          .catch(err => {
                                                console.log(err);
                                                reject(0)
                                          })

                              } else {
                                    resolve({
                                          statusCode: "0",
                                          connectionList: []
                                    })
                              }

                        })
                        .catch(err => {
                              console.log(err);
                              reject(0)
                        })
            })

      }



      /************************ ./Chat Routes ***********************/


      return routes;
};




// routes.get('/individual/:teacherId/:groupId/:studentId/:chatId?', checkAuth, VerifyStudent, getIndividualMessages);



// routes.patch('/deleteStatusCheck/:teacherId/:roomId', checkAuth, (req, res, next) => {

//       if (req.params.teacherId && req.params.roomId && req.body.messageIds) {

//             let teacherId = req.params.teacherId;
//             let roomId = req.params.roomId;
//             let messageIdsArray = req.body.messageIds.split(',');

//             // mongoose.set('debug', true);

//             //Verify Teacher and Grade
//             VerifyTeacher(teacherId, "", (error, response) => {

//                   if (response && response.statusCode != "0") {

//                         ChatConversationModel.findOne({
//                               initiatorUserId: teacherId,
//                               roomId,
//                               deleteStatus: false,
//                               isActive: true
//                         }).exec()
//                               .then(conversationExists => {

//                                     if (conversationExists) {

//                                           chatMessageModel.find({
//                                                 _id: {
//                                                       $in: messageIdsArray
//                                                 },
//                                                 roomId,
//                                                 deletedUsers: {
//                                                       $ne: teacherId
//                                                 },
//                                                 isActive: true
//                                           })
//                                                 .exec()
//                                                 .then(messages => {

//                                                       console.log(messages);

//                                                       if (messages.length > 0) {

//                                                             let i = 0;
//                                                             let deleteAllFlag = 1;

//                                                             let today = new Date();

//                                                             today.setMinutes(today.getMinutes() + 330); //Adding Timestamp by 5hr 30 min

//                                                             while (i < messages.length && deleteAllFlag == 1) {

//                                                                   let sMessage = messages[i];

//                                                                   if (String(sMessage.userId) == teacherId && sMessage.deleteAll == false) {

//                                                                         let dateDiff = new DateDiff(today, sMessage.date);

//                                                                         console.log(dateDiff.minutes);
//                                                                         deleteAllFlag = dateDiff.minutes() > 60 ? 1 : 0

//                                                                   }

//                                                                   i++;
//                                                             }

//                                                             res.status(200).json({
//                                                                   statusCode: "1",
//                                                                   showDeleteFlag: deleteAllFlag == 0 ? 2 : 1,
//                                                                   message: "Data Found..!!"
//                                                             })

//                                                       } else {

//                                                             res.status(200).json({
//                                                                   "statusCode": "0",
//                                                                   "message": "Access Denied..!!"
//                                                             })

//                                                       }

//                                                 })
//                                                 .catch(err => {

//                                                       console.log(err);

//                                                       res.status(200).json({
//                                                             "statusCode": "0",
//                                                             "message": "Something Went Wrong. Please Try Later..!!"
//                                                       })

//                                                 })
//                                     } else {

//                                           res.status(200).json({
//                                                 "statusCode": "0",
//                                                 "message": "Access Denied..!!"
//                                           })

//                                     }

//                               })
//                               .catch(err => {

//                                     console.log(err);

//                                     res.status(200).json({
//                                           "statusCode": "0",
//                                           "message": "Something Went Wrong. Please Try Later..!!"
//                                     })

//                               })

//                   } else {

//                         res.status(200).json({
//                               statusCode: "0",
//                               message: "Access Denied.....!!"
//                         })

//                   }

//             })

//       } else {
//             res.status(200).json({
//                   "statusCode": "0",
//                   "message": "All Fields are mandatory...!!"
//             })

//       }

// });





// let error = 1;


//                                                                                                 const messageData = new chatMessageModel({
//                                                                                                       _id: new mongoose.Types.ObjectId(),
//                                                                                                       userId: teacherId,
//                                                                                                       roomId,
//                                                                                                       message,
//                                                                                                       messageType,
//                                                                                                       urls: messageUrls
//                                                                                                 })


//                                                                                                 /**Check if this message is reply to any message above */
//                                                                                                 if (req.body.replyId) {
//                                                                                                       /**If this is the reply for message then these values will be saved */
//                                                                                                       messageData.replyId = req.body.replyId
//                                                                                                       messageData.replyUserId = req.body.replyUserId

//                                                                                                       if (error == 1)
//                                                                                                             error = await checkChat.status(teacherId, roomId, req.body.replyId)


//                                                                                                 }

//                                                                                                 /**Check if this message is for clarity of any assignment */
//                                                                                                 if (req.body.assignmentSchoolId) {
//                                                                                                       /**If this is this is the clarity for above message then these values will be saved */
//                                                                                                       messageData.assignmentSchoolId = req.body.assignmentSchoolId

//                                                                                                       if (error == 1)
//                                                                                                             error = await checkAssignment.status(req.body.assignmentSchoolId)

//                                                                                                 }

//                                                                                                 let PromiseData = [];

//                                                                                                 messageData.save()
//                                                                                                       .then(async GroupMessageSaved => {

//                                                                                                             if (GroupMessageSaved) {

//                                                                                                                   if (error == 1) {

//                                                                                                                         for (let index = 0; index < studentList.length; index++) {
//                                                                                                                               const receiverUserId = studentList[index];

//                                                                                                                               await ChatConversationModel.findOne({
//                                                                                                                                     initiatorUserId: teacherId,
//                                                                                                                                     receiverUserId,
//                                                                                                                                     connectionType: 1,
//                                                                                                                                     deleteStatus: false,
//                                                                                                                                     isActive: true
//                                                                                                                               })
//                                                                                                                                     .exec()
//                                                                                                                                     .then(async Connection => {

//                                                                                                                                           const NewObjMessage = new chatMessageModel({
//                                                                                                                                                 _id: new mongoose.Types.ObjectId(),
//                                                                                                                                                 userId: teacherId,
//                                                                                                                                                 message,
//                                                                                                                                                 messageType,
//                                                                                                                                                 urls: messageUrls
//                                                                                                                                           })


//                                                                                                                                           /**Check if this message is reply to any message above */
//                                                                                                                                           if (req.body.replyId) {
//                                                                                                                                                 /**If this is the reply for message then these values will be saved */
//                                                                                                                                                 NewObjMessage.replyId = req.body.replyId
//                                                                                                                                                 NewObjMessage.replyUserId = req.body.replyUserId

//                                                                                                                                                 if (error == 1)
//                                                                                                                                                       error = await checkChat.status(teacherId, roomId, req.body.replyId)


//                                                                                                                                           }

//                                                                                                                                           /**Check if this message is for clarity of any assignment */
//                                                                                                                                           if (req.body.assignmentSchoolId) {
//                                                                                                                                                 /**If this is this is the clarity for above message then these values will be saved */
//                                                                                                                                                 NewObjMessage.assignmentSchoolId = req.body.assignmentSchoolId

//                                                                                                                                                 if (error == 1)
//                                                                                                                                                       error = await checkAssignment.status(req.body.assignmentSchoolId)

//                                                                                                                                           }

//                                                                                                                                           if (Connection) {
//                                                                                                                                                 NewObjMessage.roomId = Connection.roomId
//                                                                                                                                           } else {
//                                                                                                                                                 NewObjMessage.roomId = await createNewOneToOneChatConnection(teacherId, receiverUserId)
//                                                                                                                                           }

//                                                                                                                                           await NewObjMessage.save()
//                                                                                                                                                 .then(async messageSaved => {
//                                                                                                                                                       console.log(messageSaved)

//                                                                                                                                                       await ChatConversationModel.updateOne({
//                                                                                                                                                             roomId: messageSaved.roomId,
//                                                                                                                                                             initiatorUserId: teacherId
//                                                                                                                                                       }, {
//                                                                                                                                                             $set: {
//                                                                                                                                                                   lastMessageId: messageSaved._id
//                                                                                                                                                             }
//                                                                                                                                                       }).exec()


//                                                                                                                                                       await ChatConversationModel.updateMany({
//                                                                                                                                                             roomId: messageSaved.roomId,
//                                                                                                                                                             initiatorUserId: {
//                                                                                                                                                                   $ne: teacherId
//                                                                                                                                                             }
//                                                                                                                                                       }, {
//                                                                                                                                                             $set: {
//                                                                                                                                                                   lastMessageId: messageSaved._id
//                                                                                                                                                             },
//                                                                                                                                                             $inc: { newMessageCount: 1 }
//                                                                                                                                                       }).exec()

//                                                                                                                                                       // console.log(messageSaved);

//                                                                                                                                                       await getMessageOnId(teacherId, roomId, messageSaved._id, 1) //Check getDetails Flag to 1 to get details
//                                                                                                                                                             .then(messageDetails => {

//                                                                                                                                                                   console.log("emit send message teacher");

//                                                                                                                                                                   let dataPushed = io.sockets.in(roomId).emit("receiveMessage", {
//                                                                                                                                                                         "messageList": messageDetails.messageList
//                                                                                                                                                                   });

//                                                                                                                                                                   PromiseData.push(dataPushed)

//                                                                                                                                                             })
//                                                                                                                                                             .catch(err => {
//                                                                                                                                                                   console.log(err);
//                                                                                                                                                                   error = 0
//                                                                                                                                                             })

//                                                                                                                                                 })
//                                                                                                                                                 .catch(err => {
//                                                                                                                                                       console.log(err);
//                                                                                                                                                       error = 0
//                                                                                                                                                 })

//                                                                                                                                     })
//                                                                                                                                     .catch(err => {
//                                                                                                                                           console.log(err);
//                                                                                                                                           error = 0
//                                                                                                                                     })

//                                                                                                                         }

//                                                                                                                         Promise.all(PromiseData).then(messagesent => {

//                                                                                                                               getMessageOnId(teacherId, roomId, GroupMessageSaved._id, 1) //Check getDetails Flag to 1 to get details
//                                                                                                                                     .then(messageDetails => {

//                                                                                                                                           console.log("emit send message teacher");

//                                                                                                                                           ChatConversationModel.updateOne({
//                                                                                                                                                 roomId,
//                                                                                                                                                 initiatorUserId: teacherId
//                                                                                                                                           }, {
//                                                                                                                                                 $set: {
//                                                                                                                                                       lastMessageId: GroupMessageSaved._id
//                                                                                                                                                 }
//                                                                                                                                           }).exec()
//                                                                                                                                                 .then(updatedLastmessageId => {

//                                                                                                                                                       if (updatedLastmessageId.nModified == 1) {

//                                                                                                                                                             res.status(200).json({
//                                                                                                                                                                   statusCode: "1",
//                                                                                                                                                                   messageList: messageDetails.messageList,
//                                                                                                                                                                   message: "Message Sent Successfully...!!"
//                                                                                                                                                             })

//                                                                                                                                                       } else {

//                                                                                                                                                             res.status(200).json({
//                                                                                                                                                                   statusCode: "0",
//                                                                                                                                                                   message: "Something Went Wrong. Please Try Later..!!"
//                                                                                                                                                             })

//                                                                                                                                                       }
//                                                                                                                                                 })
//                                                                                                                                                 .catch(err => {
//                                                                                                                                                       console.log(err);
//                                                                                                                                                       res.status(200).json({
//                                                                                                                                                             statusCode: "0",
//                                                                                                                                                             message: "Something Went Wrong. Please Try Later..!!"
//                                                                                                                                                       })
//                                                                                                                                                 })


//                                                                                                                                     })
//                                                                                                                                     .catch(err => {
//                                                                                                                                           console.log(err);
//                                                                                                                                           res.status(200).json({
//                                                                                                                                                 statusCode: "0",
//                                                                                                                                                 message: "Something Went Wrong. Please Try Later..!!"
//                                                                                                                                           })
//                                                                                                                                     })
//                                                                                                                         })
//                                                                                                                               .catch(err => {
//                                                                                                                                     console.log(err);

//                                                                                                                                     res.status(200).json({
//                                                                                                                                           statusCode: "0",
//                                                                                                                                           message: "Something Went Wrong. Please Try Later..!!"
//                                                                                                                                     })

//                                                                                                                               })


//                                                                                                                   } else if (error == 2) {

//                                                                                                                         res.status(200).json({
//                                                                                                                               statusCode: "0",
//                                                                                                                               message: "Access Denied.....!!"
//                                                                                                                         })

//                                                                                                                   } else {

//                                                                                                                         res.status(200).json({
//                                                                                                                               statusCode: "0",
//                                                                                                                               message: "Something Went Wrong. Please Try Later..!!"
//                                                                                                                         })

//                                                                                                                   }

//                                                                                                             } else {
//                                                                                                                   res.status(200).json({
//                                                                                                                         statusCode: "0",
//                                                                                                                         message: "Something Went Wrong. Please Try Later..!!"
//                                                                                                                   })
//                                                                                                             }

//                                                                                                       })
//                                                                                                       .catch(err => {
//                                                                                                             console.log(err);

//                                                                                                             res.status(200).json({
//                                                                                                                   statusCode: "0",
//                                                                                                                   message: "Something Went Wrong. Please Try Later..!!"
//                                                                                                             })

//                                                                                                       })



                                                            // const messageData = new chatMessageModel({
                                                            //       _id: new mongoose.Types.ObjectId(),
                                                            //       userId: teacherId,
                                                            //       roomId: roomId,
                                                            //       message,
                                                            //       messageType,
                                                            //       urls: messageUrls
                                                            // })

                                                            // /**Check if this message is reply to any message above */
                                                            // if (req.body.replyId) {
                                                            //       /**If this is the reply for message then these values will be saved */
                                                            //       messageData.replyId = req.body.replyId
                                                            //       messageData.replyUserId = req.body.replyUserId

                                                            //       if (errorData == 1)
                                                            //             errorData = await checkChat.status(teacherId, roomId, req.body.replyId)


                                                            // }

                                                            // /**Check if this message is for clarity of any assignment */
                                                            // if (req.body.assignmentSchoolId) {
                                                            //       /**If this is this is the clarity for above message then these values will be saved */
                                                            //       messageData.assignmentSchoolId = req.body.assignmentSchoolId

                                                            //       if (errorData == 1)
                                                            //             errorData = await checkAssignment.status(req.body.assignmentSchoolId)

                                                            // }

                                                            // //  console.log("error" + error);


                                                            // if (errorData == 1) {

                                                            //       messageData.save()
                                                            //             .then(async messageSaved => {

                                                            //                   await ChatConversationModel.updateOne({
                                                            //                         roomId,
                                                            //                         initiatorUserId: teacherId
                                                            //                   }, {
                                                            //                         $set: {
                                                            //                               lastMessageId: messageSaved._id
                                                            //                         }
                                                            //                   }).exec()


                                                            //                   await ChatConversationModel.updateMany({
                                                            //                         roomId,
                                                            //                         initiatorUserId: {
                                                            //                               $ne: teacherId
                                                            //                         }
                                                            //                   }, {
                                                            //                         $set: {
                                                            //                               lastMessageId: messageSaved._id
                                                            //                         },
                                                            //                         $inc: { newMessageCount: 1 }
                                                            //                   }).exec()

                                                            //                   // console.log(messageSaved);

                                                            //                   getMessageOnId(teacherId, roomId, messageSaved._id, 1) //Check getDetails Flag to 1 to get details
                                                            //                         .then(messageDetails => {

                                                            //                               // console.log(messageDetails);

                                                            //                               if (messageDetails.statusCode == 1) {

                                                            //                                     console.log("emit send message teacher");

                                                            //                                     io.sockets.in(roomId).emit("receiveMessage", {
                                                            //                                           "messageList": messageDetails.messageList
                                                            //                                     });

                                                            //                                     res.status(200).json({
                                                            //                                           statusCode: "1",
                                                            //                                           messageList: messageDetails.messageList,
                                                            //                                           message: "Message Sent Successfully...!!"
                                                            //                                     })

                                                            //                               } else if (messageDetails.statusCode == 2) {

                                                            //                                     res.status(200).json({
                                                            //                                           statusCode: "0",
                                                            //                                           message: "Access Denied....!!"
                                                            //                                     })

                                                            //                               } else {

                                                            //                                     res.status(200).json({
                                                            //                                           statusCode: "0",
                                                            //                                           message: "Something Went Wrong. Please Try Later..!!"
                                                            //                                     })

                                                            //                               }

                                                            //                         })
                                                            //                         .catch(err => {
                                                            //                               console.log(err);

                                                            //                               res.status(200).json({
                                                            //                                     statusCode: "0",
                                                            //                                     message: "Something Went Wrong. Please Try Later..!!"
                                                            //                               })

                                                            //                         })

                                                            //             })
                                                            //             .catch(err => {

                                                            //                   console.log(err);

                                                            //                   res.status(200).json({
                                                            //                         statusCode: "0",
                                                            //                         message: "Something Went Wrong. Please Try Later..!!"
                                                            //                   })

                                                            //             })

                                                            // } else if (errorData == 2) {

                                                            //       res.status(200).json({
                                                            //             statusCode: "0",
                                                            //             message: "Access Denied.....!!"
                                                            //       })

                                                            // } else {

                                                            //       res.status(200).json({
                                                            //             statusCode: "0",
                                                            //             message: "Something Went Wrong. Please Try Later..!!"
                                                            //       })

                                                            // }






                                                // const messageData = new chatMessageModel({
                                                //       _id: new mongoose.Types.ObjectId(),
                                                //       userId: teacherId,
                                                //       roomId: roomId,
                                                //       message,
                                                //       messageType,
                                                //       urls: messageUrls
                                                // })

                                                // /**Check if this message is reply to any message above */
                                                // if (req.body.replyId) {
                                                //       /**If this is the reply for message then these values will be saved */
                                                //       messageData.replyId = req.body.replyId
                                                //       messageData.replyUserId = req.body.replyUserId

                                                //       if (error == 1)
                                                //             error = await checkChat.status(teacherId, roomId, req.body.replyId)


                                                // }

                                                // /**Check if this message is for clarity of any assignment */
                                                // if (req.body.assignmentSchoolId) {
                                                //       /**If this is this is the clarity for above message then these values will be saved */
                                                //       messageData.assignmentSchoolId = req.body.assignmentSchoolId

                                                //       if (error == 1)
                                                //             error = await checkAssignment.status(req.body.assignmentSchoolId)

                                                // }

                                                // //  console.log("error" + error);


                                                // if (error == 1) {

                                                //       messageData.save()
                                                //             .then(async messageSaved => {

                                                //                   await ChatConversationModel.updateOne({
                                                //                         roomId,
                                                //                         initiatorUserId: teacherId
                                                //                   }, {
                                                //                         $set: {
                                                //                               lastMessageId: messageSaved._id
                                                //                         }
                                                //                   }).exec()


                                                //                   await ChatConversationModel.updateMany({
                                                //                         roomId,
                                                //                         initiatorUserId: {
                                                //                               $ne: teacherId
                                                //                         }
                                                //                   }, {
                                                //                         $set: {
                                                //                               lastMessageId: messageSaved._id
                                                //                         },
                                                //                         $inc: { newMessageCount: 1 }
                                                //                   }).exec()

                                                //                   // console.log(messageSaved);



                                                //             })
                                                //             .catch(err => {
                                                //                   console.log(err);

                                                //                   res.status(200).json({
                                                //                         statusCode: "0",
                                                //                         message: "Something Went Wrong. Please Try Later..!!"
                                                //                   })

                                                //             })

                                                // } else if (error == 2) {

                                                //       res.status(200).json({
                                                //             statusCode: "0",
                                                //             message: "Access Denied.....!!"
                                                //       })

                                                // } else {

                                                //       res.status(200).json({
                                                //             statusCode: "0",
                                                //             message: "Something Went Wrong. Please Try Later..!!"
                                                //       })

                                                // }