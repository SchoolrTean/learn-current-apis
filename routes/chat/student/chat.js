const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const DateDiff = require('date-diff');
const fs = require('fs');
const pdf = require("pdf-creator-node");

const checkAuth = require('../../../middleware/auth')

const ChatConversationModel = require('../../../models/chat/chatConnectionModel');
const UserModel = require('../../../models/authentication/userModel');
const chatMessageModel = require('../../../models/chat/chatMessagesModel');
const VerifyStudent = require('../../../middleware/verifyStudent');

const multer = require('multer');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {
            let randNum = Math.round(Math.random() * (999999 - 111111));
            const folderName = './uploads/chat/student/' + fileName + randNum

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
            // let randNum = Math.round(Math.random() * (999999 - 111111));
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

            // cb(null, orginalfileName + "-_-_-_" + fileName + randNum + "." + ext[ext.length - 1]);

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

const AllChatConnections = require('../../../controllers/chat/student/allChatConnectionsController');

const ChatConnectionList = require('../../../controllers/chat/student/chatConnectionsController');

const Conversation = require('../../../controllers/chat/student/conversationController');

const SaveMessage = require('../../../controllers/chat/shared/conversation/saveChatMessage');

const GetMessageOnId = require('../../../controllers/chat/shared/conversation/getMessageOnIdController');

const CreateNewGroup = require('../../../controllers/chat/shared/createNewGroup');

const createNewOneToOneChatConnection = require('../../../controllers/chat/shared/createOneOnOneChatController');

const ParseConnections = require('../../../controllers/chat/shared/parseConnectionsController');


// const checkAssignment = require('../../../controllers/chat/shared/checkAssignmentController');

// const checkChat = require('../../../controllers/chat/shared/checkChatController');

// const updateSeenStatusMessages = require('../../../controllers/chat/student/updateSeenStatusForMessages');


/***************** ./ Contoller Definition Part *******************/

module.exports = (io) => {

      const routes = express.Router();

      /************************ Chat Routes ***********************/

      /**
       * This function works to get all grouplist that students has been connected with
       * Its a common function where all students groups will be displayed
       * They can navigate to one chat group and start messaging  
       */

      routes.get('/allChatConnections/:studentId', checkAuth, AllChatConnections); //VerifyStudent





      /**
       * This function works to get all grouplist that students has been connected with
       * Its a common function where all students groups will be displayed
       * They can navigate to one chat group and start messaging  
       */

      routes.get('/chatConnections/:studentId', checkAuth, ChatConnectionList); //VerifyStudent





      /**
       * This function works to get chat messages of group with a limit of 30 each time
       * lastAssignmentId - last reocrd sent in previous request
       * 
       * When this last record was sent the last 30 messages from passed id will be sent again thats 
       * how process takes place till the all messages completed.
       * 
       * There may be some messages that has been sent from the last request which may be sent through
       * Socket. so taking limit of 30 messages will result in getting same messages again. so we are going with last AssignmentId
       */

      routes.get('/conversation/:studentId/:requestId/:requestType/:messageId?', checkAuth, Conversation);


      /**
       * This function works to save chat messages sent from student
       * 
       * Message will only be individul chat message sent to particuler teacher. 
       * 
       * If its a reply to some messsage shared by teacher then reply items will be sent
       * If its a clarify to assignment then those assignments will be sent
       */

      routes.post('/saveMessage', checkAuth, upload.any('chatDocument'), async (req, res, next) => {

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

                  if (req.body.studentId && req.body.receiverUserId && req.body.messageType && (req.body.message || messageUrls.length > 0)) {

                        let studentId = req.body.studentId;
                        let receiverUserId = req.body.receiverUserId;
                        let message = req.body.message;
                        let messageType = req.body.messageType; //1-message 2-leave letter 3-image 4-attachment 5-School Assignment 6-audio 7-video

                        console.log(req.body);

                        mongoose.set('debug', true);

                        UserModel.findOne({
                              _id: studentId,
                              type: 1,
                              isActive: true
                        }).exec()
                              .then(student => {

                                    console.log(student);

                                    if (student) {

                                          ChatConversationModel.findOne({
                                                initiatorUserId: studentId,
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
                                                            roomId = await createNewOneToOneChatConnection(studentId, receiverUserId)
                                                      }

                                                      SaveMessage(studentId, roomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId)
                                                            .then(messageSavedId => {

                                                                  GetMessageOnId(studentId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details
                                                                        .then(messageDetails => {

                                                                              // console.log(messageDetails);

                                                                              if (messageDetails.statusCode == 1) {

                                                                                    sendConnectionRecordOnSocket(roomId, studentId)
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

                                                                                    // console.log("emit send message student");

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
                                                "statusCode": "0",
                                                "message": "Access Denied...!!"
                                          })
                                    }

                              })
                              .catch(err => {

                                    console.log(err);

                                    res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Something Went Wrong. Please Try Later...!!"
                                    })

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






      routes.post('/saveMessageToGroup', checkAuth, upload.any('chatDocument'), (req, res, next) => {

            try {

                  let messageUrls = new Array();

                  if (req.files) {
                        let _filesArray = req.files;

                        _filesArray.forEach(_file => {
                              let correctPath = _file.path.replace(/\\/g, '/');
                              messageUrls.push(correctPath);
                        });
                  }

                  if (req.body.studentId && req.body.roomId && req.body.messageType && (req.body.message || messageUrls.length > 0)) {

                        let studentId = req.body.studentId;
                        let roomId = req.body.roomId;
                        let message = req.body.message;
                        let messageType = req.body.messageType; //1-message 2-leave letter 3-image 4-attachment 5-School Assignment 6-audio 7-video

                        console.log(req.body);

                        mongoose.set('debug', true);

                        UserModel.findOne({
                              _id: studentId,
                              type: 1,
                              isActive: true
                        }).exec()
                              .then(student => {

                                    console.log(student);

                                    if (student) {

                                          ChatConversationModel.findOne({
                                                initiatorUserId: studentId,
                                                roomId,
                                                deleteStatus: false,
                                                isActive: true
                                          })
                                                .exec()
                                                .then(async Connection => {

                                                      if (Connection) {

                                                            if (Connection.connectionType == 2) {

                                                                  console.log(Connection)

                                                                  SaveMessage(studentId, roomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId)
                                                                        .then(messageSavedId => {

                                                                              console.log(messageSavedId);

                                                                              GetMessageOnId(studentId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details
                                                                                    .then(messageDetails => {

                                                                                          // console.log(messageDetails);

                                                                                          if (messageDetails.statusCode == 1) {

                                                                                                sendConnectionRecordOnSocket(roomId, studentId)
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
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something Went Wrong. Please Try Later..!!"
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
                                                "statusCode": "0",
                                                "message": "Access Denied...!!"
                                          })
                                    }

                              })
                              .catch(err => {

                                    console.log(err);

                                    res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Something Went Wrong. Please Try Later...!!"
                                    })

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

                  if (req.body.studentId && req.body.receiverUserIds && req.body.receiverUserIds.split(',').length > 0 && req.body.messageType && (req.body.message || messageUrls.length > 0)) {

                        let studentId = req.body.studentId;
                        let receiverUserIds = req.body.receiverUserIds;
                        let message = req.body.message;
                        let messageType = req.body.messageType; //1-message 2-leave letter 3-image 4-attachment 5-School Assignment 6-audio 7-video

                        console.log(req.body);

                        let splitReceiverUserIds = receiverUserIds.split(',');

                        mongoose.set('debug', true);

                        VerifyStudent(studentId, "")
                              .then(async response => {

                                    if (response && response.statusCode != "0") {

                                          let alreadyConnectedList = [];

                                          for (let index = 0; index < splitReceiverUserIds.length; index++) {
                                                const receiverUserId = splitReceiverUserIds[index];

                                                let Connection = ChatConversationModel.findOne({
                                                      initiatorUserId: studentId,
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
                                                                        roomIds.push(createNewOneToOneChatConnection(studentId, splitReceiverUserIds[index]))
                                                                  } else {
                                                                        roomIds.push(connection.roomId)
                                                                  }

                                                            }

                                                      } else {

                                                            for (let index = 0; index < splitReceiverUserIds.length; index++) {
                                                                  roomIds.push(createNewOneToOneChatConnection(studentId, splitReceiverUserIds[index]))
                                                            }
                                                      }


                                                      Promise.all(roomIds)
                                                            .then(async allRoomRecords => {

                                                                  console.log(allRoomRecords);

                                                                  let error = 0;

                                                                  for (let index = 0; index < allRoomRecords.length; index++) {
                                                                        const roomId = allRoomRecords[index];

                                                                        const messageSavedId = await SaveMessage(studentId, roomId, message, messageType, messageUrls, req.body.replyId, req.body.replyUserId, req.body.assignmentSchoolId);

                                                                        const messageDetails = await GetMessageOnId(studentId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details

                                                                        if (messageDetails.statusCode == 1) {

                                                                              await sendConnectionRecordOnSocket(roomId, studentId)
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

                                                                              // console.log("emit send message teacher");

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

                                    } else {
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: error.message
                                          })
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    return res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. Please try later..!!"
                                    })
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

                  filesArray.forEach(file => {
                        let correctPath = file.path.replace(/\\/g, '/');
                        leaveLetterUrls.push(correctPath);
                  });
            }

            console.log(req.body);

            if (req.body.studentId && req.body.receiverUserIds && req.body.subject && req.body.message) { // && req.body.subject //&& req.body.receiverUserIds.trim().split(',') > 0 

                  let studentId = req.body.studentId;

                  let receiverUserIdList = req.body.receiverUserIds.trim().split(',');

                  let mailSubject = req.body.subject;

                  let message = req.body.message;


                  UserModel.findOne({
                        _id: studentId,
                        type: 1,
                        isActive: true
                  }).exec()
                        .then(studentDetails => {

                              if (studentDetails) {

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
                                                                        user: studentDetails.firstName + " " + studentDetails.surName
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
                                                                  initiatorUserId: studentId,
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
                                                                              roomId = await createNewOneToOneChatConnection(studentId, receiverUserId)
                                                                        }

                                                                        SaveMessage(studentId, roomId, message = "", messageType = 2, messageUrls = ['uploads/chat/student/leaveLetter/' + fileName + randNum + '.pdf'], "", "", "", 1, 1)
                                                                              .then(messageSavedId => {

                                                                                    GetMessageOnId(studentId, roomId, messageSavedId, 1) //Check getDetails Flag to 1 to get details
                                                                                          .then(messageDetails => {

                                                                                                // console.log(messageDetails);

                                                                                                if (messageDetails.statusCode == 1) {

                                                                                                      sendConnectionRecordOnSocket(roomId, studentId)
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

                                                                                                      // console.log("emit send message student");

                                                                                                      // let MessageEmitted = io.sockets.in(roomId).emit("receiveMessage", {
                                                                                                      //       "messageList": messageDetails.messageList
                                                                                                      // });

                                                                                                      // promiseData.push(MessageEmitted);

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






      routes.post('/createGroup', checkAuth, upload.single('groupPic'), (req, res, next) => {

            try {

                  let groupPic = req.file ? req.file.path.replace(/\\/g, '/') : "";

                  console.log(req.body)

                  if (req.body.studentId && req.body.groupName && req.body.groupUserIds && req.body.groupUserIds.split('%-%').length > 0) {

                        let studentId = req.body.studentId;
                        let groupName = req.body.groupName;
                        // let groupUserIds = req.body.groupUserIds;
                        let splitedGroupUserIds = req.body.groupUserIds.split('%-%');

                        mongoose.set('debug', true);

                        //Verify Student
                        UserModel.findOne({
                              _id: studentId,
                              type: 1, // 1- Student
                              isActive: true
                        }).exec()
                              .then(student => {

                                    console.log(student);

                                    if (student) {

                                          UserModel.find({
                                                _id: {
                                                      $in: splitedGroupUserIds
                                                },
                                                isActive: true
                                          })
                                                .then(splitedUsers => {

                                                      if (splitedUsers.length == splitedGroupUserIds.length) {

                                                            CreateNewGroup(splitedGroupUserIds, groupName, groupPic, studentId)
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
                                                "statusCode": "0",
                                                "message": "Access Denied...!!"
                                          })
                                    }

                              })
                              .catch(err => {

                                    console.log(err);

                                    res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Something Went Wrong. Please Try Later...!!"
                                    })

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
       * This function is called when get messages response has been received by student.
       * 
       * When this function is called all individual messages will be updated to seen.
       * All broadcast messages will also updated to seen if users sent messages and seen messages are same.
       * 
       * Once all messages were updated as seen then emitting of student status happens which is sent to teacher
       * if the teacher is online then she will be known that messages were seen by the student for indivuidual and 
       */

      routes.patch('/updateSeenStatus/:studentId/:roomId', checkAuth, async (req, res, next) => {

            if (req.params.studentId && req.params.roomId) {

                  let studentId = req.params.studentId;
                  let roomId = req.params.roomId;

                  //Verify Teacher and Grade
                  UserModel.findOne({
                        _id: studentId,
                        type: 1, // 1- Student
                        isActive: true
                  }).exec()
                        .then(student => {

                              console.log(student);

                              if (student) {

                                    ChatConversationModel.findOne({
                                          initiatorUserId: studentId,
                                          roomId,
                                          isActive: true
                                    }).exec()
                                          .then(async ChatConnection => {

                                                if (ChatConnection) {

                                                      if (ChatConnection.newMessageCount > 0 || ChatConnection.newMailCount > 0) {

                                                            let MessageRecords = [];

                                                            if (ChatConnection.connectionType == 1) {

                                                                  MessageRecords = await chatMessageModel.find({
                                                                        userId: {
                                                                              $ne: studentId
                                                                        },
                                                                        roomId,
                                                                        deleteAllStatus: false,
                                                                        seenStatus: false,
                                                                        isActive: true
                                                                  })

                                                            } else {

                                                                  MessageRecords = await chatMessageModel.find({
                                                                        userId: {
                                                                              $ne: studentId
                                                                        },
                                                                        roomId,
                                                                        deleteAllStatus: false,
                                                                        seenUsers: {
                                                                              $ne: studentId
                                                                        },
                                                                        isActive: true
                                                                  })

                                                            }

                                                            console.log(MessageRecords)

                                                            if (MessageRecords.length > 0) {

                                                                  let messageIds = MessageRecords.map(chat => chat._id);

                                                                  console.log("messageIds")
                                                                  console.log(messageIds)

                                                                  let updateQuery = {
                                                                        $set: {
                                                                              seenStatus: true
                                                                        }
                                                                  }

                                                                  if (ChatConnection.connectionType != 1) {
                                                                        updateQuery = {
                                                                              $push: {
                                                                                    seenUsers: studentId
                                                                              }
                                                                        }
                                                                  }

                                                                  /**
                                                                   * Update individual messages seen status which were greater than last messageId saved
                                                                   */
                                                                  chatMessageModel.updateMany({
                                                                        _id: {
                                                                              $in: messageIds
                                                                        }
                                                                  }, updateQuery)
                                                                        .exec()
                                                                        .then(individualChatsUpdated => {

                                                                              if (individualChatsUpdated.ok == 1) {

                                                                                    ChatConversationModel.updateMany({
                                                                                          initiatorUserId: studentId,
                                                                                          roomId,
                                                                                          deleteStatus: false,
                                                                                          isActive: true
                                                                                    }, {
                                                                                          $set: {
                                                                                                newMessageCount: 0,
                                                                                                newMailCount: 0
                                                                                          }
                                                                                    }).exec()
                                                                                          .then(async chatNewMessageCount => {

                                                                                                if (chatNewMessageCount.nModified > 0) {
                                                                                                      console.log('emit student seen status');

                                                                                                      await io.sockets.to(roomId).emit("studentEmitSeenStatus", { //io.
                                                                                                            roomId,
                                                                                                            messageIds: messageIds
                                                                                                      });

                                                                                                      res.status(200).json({
                                                                                                            statusCode: "1",
                                                                                                            message: "Update Successful...!!"
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
                                                                        message: "Update Successful...!!"
                                                                  })

                                                            }

                                                      } else {
                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  message: "Update Successful...!!"
                                                            })
                                                      }

                                                } else {
                                                      res.status(200).json({
                                                            "statusCode": "0",
                                                            "message": "Access Denied...!!"
                                                      })
                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      "statusCode": "0",
                                                      "message": "Something Went Wrong. Please Try Later...!!"
                                                })

                                          })
                              } else {
                                    res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Access Denied...!!"
                                    })
                              }

                        })
                        .catch(err => {
                              console.log(err);

                              res.status(200).json({
                                    "statusCode": "0",
                                    "message": "Something Went Wrong. Please Try Later...!!"
                              })

                        })



            } else {
                  res.status(200).json({
                        "statusCode": "0",
                        "message": "All Fields are mandatory...!!"
                  })

            }

      });





      /**
       * This function is used to perform delete Status check i.e to show delete and delete all options.
       */

      routes.get('/delete/StatusCheck/:studentId/:roomId', checkAuth, (req, res, next) => {

            if (req.params.studentId && req.params.roomId && req.body.messageIds) {

                  let studentId = req.params.studentId;
                  let roomId = req.params.roomId;

                  let messageIdsArray = req.body.messageIds.split(',');

                  chatMessageModel.find({
                        _id: {
                              $in: messageIdsArray
                        },
                        roomId,
                        deletedUsers: {
                              $ne: studentId
                        },
                        isActive: true
                  })
                        .exec()
                        .then(messages => {

                              // console.log(messages);

                              if (messages.length > 0) {

                                    if (messages.length == messageIdsArray.length) {

                                          let i = 0;
                                          let deleteAllFlag = 1;

                                          let today = new Date();

                                          today.setMinutes(today.getMinutes() + 330); //Adding Timestamp by 5hr 30 min

                                          while (i < messages.length && deleteAllFlag == 1) {

                                                let sMessage = messages[i];

                                                if (String(sMessage.userId) == studentId && sMessage.deleteAllStatus == false) {

                                                      let dateDiff = new DateDiff(today, sMessage.date);

                                                      // console.log(dateDiff.minutes);
                                                      deleteAllFlag = dateDiff.minutes() > 60 ? 1 : 0

                                                } else { }

                                                i++;
                                          }

                                          res.status(200).json({
                                                statusCode: "1",
                                                showDeleteFlag: deleteAllFlag == 0 ? 2 : 1,
                                                message: "Data Found..!!"
                                          })


                                    } else {

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later..!!"
                                          })
                                    }

                              } else {

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Access Denied.....!!"
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
                        "statusCode": "0",
                        "message": "All Fields are mandatory...!!"
                  })

            }

      });




      /**
       * This function is used to perform delete and delete all tasks for the messageIds passed to it.
       * 
       * Once messageIds are passed if it is delete for self where deleteType = 1 then all messages will be deleted
       * 
       * if deleteType = 2 then its delete for all now we will check wheather passed msgs were b/w specified time limit for delete all i.e 1 hour or half an hour
       * once all meet the criteria then they will be deleted and emitted through the socket for deleting to the sender  
       */

      routes.patch('/delete/:studentId/:roomId/:deleteType', checkAuth, (req, res, next) => {

            try {

                  if (req.params.studentId && req.params.roomId && req.body.messageIds && req.params.deleteType) {

                        let studentId = req.params.studentId;
                        let roomId = req.params.roomId;

                        let messageIdsArray = req.body.messageIds.split(',');
                        let deleteType = req.params.deleteType; //1- delete 2- delete All

                        let query = "";

                        if (deleteType == 1) {

                              query = {
                                    _id: {
                                          $in: messageIdsArray
                                    },
                                    roomId,
                                    deletedUsers: {
                                          $ne: studentId
                                    },
                                    isActive: true
                              }

                        } else {
                              query = {
                                    _id: {
                                          $in: messageIdsArray
                                    },
                                    userId: studentId,
                                    roomId,
                                    deletedUsers: {
                                          $ne: studentId
                                    },
                                    isActive: true
                              }
                        }

                        chatMessageModel.find(query)
                              .populate('replyId')
                              .populate('assignmentSchoolId')
                              .exec()
                              .then(messages => {

                                    // console.log(messages);

                                    if (messages.length > 0) {

                                          if (messages.length == messageIdsArray.length) {

                                                let updateData = "";
                                                let error = 0;

                                                if (deleteType == 2) {


                                                      let i = 0;

                                                      while (i < messages.length && error == 0) {

                                                            let sMessage = messages[i];

                                                            if (String(sMessage.userId) == studentId && sMessage.deleteAllStatus == false) {

                                                                  let today = new Date();

                                                                  today.setMinutes(today.getMinutes() + 330); //Adding Timestamp by 5hr 30 min

                                                                  // console.log(today);
                                                                  // console.log(sMessage.date);

                                                                  let dateDiff = new DateDiff(today, sMessage.date);

                                                                  // console.log(dateDiff.minutes);

                                                                  if (dateDiff.minutes() <= 60) {

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
                                                                  deletedUsers: studentId
                                                            }

                                                      };
                                                }

                                                if (error == 0) {

                                                      // console.log(updateData);

                                                      chatMessageModel.updateMany({

                                                            _id: {
                                                                  $in: messageIdsArray
                                                            }

                                                      }, updateData)
                                                            .exec()
                                                            .then(async deletedUpdatedSuccessfullly => {

                                                                  // console.log(updated);

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

                                                                                                // io.sockets.in(roomId).emit("deleteAllMessageIds", {
                                                                                                //       "roomId": roomId,
                                                                                                //       "messageIdsList": messageIdsArray
                                                                                                // });

                                                                                                sendConnectionRecordOnSocket(roomId, studentId)
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
                                                      message: "Access Denied.....!!"
                                                })
                                          }

                                    } else {

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied.....!!"
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

                              console.log(Connections);
                              let sentSocketConnection = [];

                              if (Connections.length > 0) {

                                    for (let index = 0; index < Connections.length; index++) {
                                          const connection = Connections[index];
                                          sentSocketConnection.push(ParseConnections([connection], connection.initiatorUserId))
                                    }

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
                                                      //       "connectionData": connectionRecord
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



      return routes;
};



/** Post Message */


// let _cfilesArray = new Array();

//             if (req.files) {
//                   let _filesArray = req.files;

//                   _filesArray.forEach(_file => {
//                         let correctPath = _file.path.replace(/\\/g, '/');
//                         _cfilesArray.push(correctPath);
//                   });
//             }

//             console.log(req.body);

//             //(req.body.messageType == 2 && req.body.toTeacherIds && req.body.reason && req.body.fromDate && req.body.toDate && (req.body.message || _cfilesArray.length > 0))
//             if (req.body.studentId && req.body.conversationId && req.body.messageType != 3 && (req.body.messageType > 0 && req.body.messageType < 8) && (req.body.message || _cfilesArray.length > 0)) {

//                   let studentId = req.body.studentId;
//                   let conversationId = req.body.conversationId;
//                   let message = req.body.message;
//                   let messageType = req.body.messageType; //1-message 2-image 2-attachment 3-leave letter 4-School Assignment 5-audio
//                   // let toTeacherIds = req.body.toTeacherIds;
//                   // let ccTeacherIds = req.body.ccTeacherIds;
//                   // let reason = req.body.reason;
//                   // let fromDate = req.body.fromDate;
//                   // let toDate = req.body.toDate;


//                   let error = 1;

//                   const messageData = new chatMessageModel({
//                         _id: new mongoose.Types.ObjectId(),
//                         userId: studentId,
//                         conversationId,
//                         message,
//                         messageType,
//                         urls: _cfilesArray,
//                   })

//                   /**Check if this message is for clarity of asny assignment */
//                   if (req.body.assignmentSchoolId) {
//                         /**If this is this is the clarity for above message then these values will be saved */
//                         messageData.assignmentSchoolId = req.body.assignmentSchoolId

//                         if (error == 1)
//                               error = await checkAssignment.status(req.body.assignmentSchoolId)

//                   }

//                   /**Check if this message is reply to any message above */
//                   if (req.body.replyId) {
//                         /**If this is the reply for message then these values will be saved */
//                         messageData.replyId = req.body.replyId
//                         messageData.replyUserId = req.body.replyUserId

//                         if (error == 1)
//                               error = await checkChat.status(studentId, conversationId, req.body.replyId)

//                   }


//                   if (error == 1) {

//                         messageData.save()
//                               .then(async messageSaved => {

//                                     await ChatConversationModel.updateOne({
//                                           _id: conversationId
//                                     }, {
//                                           $set: {
//                                                 studentLastMessageId: messageSaved._id,
//                                                 teacherLastMessageId: messageSaved._id
//                                           }
//                                     }).exec()

//                                     GetMessageOnId(studentId, conversationId, messageSaved._id, 1) //get Details of message was set to 1 
//                                           .then(async messageDetails => {

//                                                 if (messageDetails.statusCode == 1) {

//                                                       // console.log(messageDetails.messageList);

//                                                       console.log('emit send message')

//                                                       await io.sockets.in(conversationId).emit("receiveMessage", {
//                                                             "messageList": messageDetails.messageList
//                                                       });

//                                                       res.status(200).json({
//                                                             statusCode: "1",
//                                                             messageList: messageDetails.messageList,
//                                                             message: "Message Sent Successfully...!!"
//                                                       })

//                                                 } else if (messageDetails.statusCode == 2) {

//                                                       res.status(200).json({
//                                                             statusCode: "0",
//                                                             message: "Access Denied....!!"
//                                                       })

//                                                 } else {

//                                                       res.status(200).json({
//                                                             statusCode: "0",
//                                                             message: "Something Went Wrong. Please Try Later..!!"
//                                                       })

//                                                 }

//                                           })
//                                           .catch(err => {

//                                                 console.log(err);
//                                                 res.status(200).json({
//                                                       statusCode: "0",
//                                                       message: "Something Went Wrong. Please Try Later..!!"
//                                                 })

//                                           })


//                               })
//                               .catch(err => {

//                                     console.log(err);

//                                     res.status(200).json({
//                                           statusCode: "0",
//                                           message: "Something Went Wrong. Please Try Later..!!"
//                                     })

//                               })

//                   } else if (error == 2) {

//                         res.status(200).json({
//                               statusCode: "0",
//                               message: "Access Denied.....!!"
//                         })

//                   } else {

//                         res.status(200).json({
//                               statusCode: "0",
//                               message: "Something Went Wrong. Please Try Later..!!"
//                         })

//                   }

//             } else {
//                   res.status(200).json({
//                         "statusCode": "0",
//                         "message": "All Fields are mandatory...!!"
//                   })

//             }



                  // let updateBroadCastMessagesToSeenQuery = {
                  //       individualUserId: studentId,
                  //       messageType: 1,
                  //       deleteAll: false,
                  //       isActive: true,
                  //       seenUsers: {
                  //             $nin: studentId
                  //       }
                  // };

                  // if (getLastMessageIdForUpdating.lastChatMessageIdSeen) {

                  //       updateIndividualMessagesToSeenQuery._id = {
                  //             $gt: getLastMessageIdForUpdating.lastChatMessageIdSeen
                  //       };

                  //       updateBroadCastMessagesToSeenQuery._id = {
                  //             $gt: getLastMessageIdForUpdating.lastChatMessageIdSeen
                  //       };

                  // }

/**
 * GET all individual messages seen status which were greater than last messageId saved
 */



                  // let broadcastChatData = chatMessageModel.find(
                  //             updateBroadCastMessagesToSeenQuery
                  //       )
                  //       .exec()
                  //       .then(broadCastMessages => {

                  //             if (broadCastMessages.length > 0) {
                  //                   /**
                  //                    * Update group messages seen status which were greater than last messageId saved
                  //                    */
                  //                   chatMessageModel.updateMany(
                  //                               updateBroadCastMessagesToSeenQuery, {
                  //                                     $addToSet: {
                  //                                           seenUsers: studentId
                  //                                     }
                  //                               })
                  //                         .exec()
                  //                         .then(broadCastMessageUpdate => {

                  //                               if (broadCastMessageUpdate.ok == 1) {

                  //                                     for (let index = 0; index < broadCastMessages.length; index++) {
                  //                                           const broadCastMessage = broadCastMessages[index];

                  //                                           io.sockets.in(groupId).emit("studentEmitSeenStatus", {
                  //                                                 messageId: broadCastMessage._id,
                  //                                                 individualUserId: broadCastMessage.userId,
                  //                                                 groupId: broadCastMessage.groupId
                  //                                           });

                  //                                     }

                  //                                     /**
                  //                                      * Update last message Id which is used for next update of seen status of student
                  //                                      */

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

                  //             }

                  //       })
                  //       .catch(err => {
                  //             console.log(err);

                  //             res.status(200).json({
                  //                   statusCode: "0",
                  //                   message: "Something Went Wrong. Please Try Later..!!"
                  //             })
                  //       })


                  // await Promise.all(individualChatData, broadcastChatData)
                  //       .then(success => {

                  //             res.status(200).json({
                  //                   statusCode: "1",
                  //                   message: "Update Successful...!!"
                  //             })

                  //       })
                  //       .catch(err => {
                  //             console.log(err);

                  //             res.status(200).json({
                  //                   statusCode: "0",
                  //                   message: "Something Went Wrong. Please Try Later..!!"
                  //             })
                  //       })

