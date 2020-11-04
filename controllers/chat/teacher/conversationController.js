const mongoose = require('mongoose');

const VerifyTeacher = require('../../../middleware/verifyTeacher');

const UserModel = require('../../../models/authentication/userModel');
const ChatMessageModel = require('../../../models/chat/chatMessagesModel');
const ChatConnectionModel = require('../../../models/chat/chatConnectionModel')

// const OneOnOneConversation = require('../shared/conversation/oneOnOneConversation');
// const GroupConversation = require('../shared/conversation/groupConversation');

const ParseMessages = require('../shared/conversation/parseMessagesController');

/**
 * Get all messages thta teacher received based on group.
 * These messages may contain broadcast, individual, reply and join Messages
 */
module.exports = (req, res, next) => { //, upload.any('messageDocument')

      if (req.params.teacherId && req.params.requestId && (req.params.requestType == 1 || req.params.requestType == 2)) {

            let teacherId = req.params.teacherId;
            let requestId = req.params.requestId;
            let requestType = req.params.requestType; //1-One On One 2-Group
            let messageId = req.params.messageId; // used for loadmore

            mongoose.set('debug', true);

            //Verify Teacher and Grade
            VerifyTeacher(teacherId, "", async (error, response) => {

                  if (response && response.statusCode != "0") {

                        console.log("teacherId" + teacherId);
                        console.log("requestId" + requestId);
                        console.log("requestType" + requestType);

                        let RecordQuery = {};
                        let UserData = "";

                        if (requestType == 1) {

                              RecordQuery = {
                                    initiatorUserId: teacherId,
                                    receiverUserId: requestId,
                                    deleteStatus: false,
                                    isActive: true
                              }

                              UserData = await UserModel.findOne({
                                    _id: requestId,
                                    isActive: true
                              })

                        } else {

                              RecordQuery = {
                                    initiatorUserId: teacherId,
                                    roomId: requestId,
                                    deleteStatus: false,
                                    isActive: true
                              }

                        }

                        console.log(UserData);

                        if ((requestType == 1 && UserData) || requestType == 2) {

                              ChatConnectionModel.findOne(RecordQuery)
                                    .exec()
                                    .then(connection => {

                                          if (connection) {

                                                let query = {
                                                      roomId: connection.roomId,
                                                      deletedUsers: {
                                                            $ne: teacherId
                                                      },
                                                      // deleteAllStatus: false,
                                                      isActive: true
                                                }

                                                if (messageId && messageId.trim()) {
                                                      query._id = {
                                                            $lt: messageId // Last Chat Id received during previous request
                                                      };
                                                }

                                                ChatMessageModel.find(query)
                                                      .sort({
                                                            'date': -1
                                                      })
                                                      .populate('userId', 'firstName surName profilePic isActive')
                                                      .populate('replyId')
                                                      .populate('replyUserId', 'firstName surName profilePic isActive')
                                                      .populate('assignmentSchoolId')
                                                      .exec()
                                                      .then(messages => {

                                                            if (messages.length > 0) {

                                                                  ParseMessages(messages)
                                                                        .then(messagesListResponse => {

                                                                              // ChatMessageModel.updateMany({
                                                                              //             userId: {
                                                                              //                   $ne: teacherId
                                                                              //             },
                                                                              //             conversationId,
                                                                              //             deletedUsers: {
                                                                              //                   $ne: teacherId
                                                                              //             },
                                                                              //             seenStatus: false,
                                                                              //             isActive: true
                                                                              //       }, {
                                                                              //             $set: {
                                                                              //                   seenStatus: true
                                                                              //             }
                                                                              //       })
                                                                              //       .exec()
                                                                              //       .then(updateData => {


                                                                              //Seen Status Update and emit

                                                                              // if (updateData.ok == 1) {

                                                                              if (requestType == 1) {

                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          userId: UserData._id,
                                                                                          roomId: connection ? connection.roomId : "",
                                                                                          name: UserData.firstName + " " + UserData.surName,
                                                                                          profilePic: UserData.profilePic ? UserData.profilePic : "",
                                                                                          chatOnlineStatus: UserData.chatOnlineStatus,
                                                                                          chatType: "User",
                                                                                          messageList: messagesListResponse,
                                                                                          message: "Data Found.....!!"
                                                                                    })

                                                                              } else {

                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          userId: "",
                                                                                          roomId: connection.roomId,
                                                                                          name: connection.groupName,
                                                                                          profilePic: UserData.groupPic ? UserData.groupPic : "",
                                                                                          chatOnlineStatus: "false",
                                                                                          chatType: "Group",
                                                                                          messageList: messagesListResponse,
                                                                                          message: "Data Found.....!!"
                                                                                    })

                                                                              }

                                                                              // } else {
                                                                              //       res.status(200).json({
                                                                              //             statusCode: "0",
                                                                              //             message: "Something Went Wrong. Please Try Later..!!"
                                                                              //       })
                                                                              // }

                                                                              // })
                                                                              // .catch(err => {

                                                                              //       console.log(err);

                                                                              //       res.status(200).json({
                                                                              //             statusCode: "0",
                                                                              //             message: "Something Went Wrong. Please Try Later..!!"
                                                                              //       })

                                                                              // })

                                                                        })
                                                                        .catch(err => {
                                                                              console.log(err);
                                                                              res.status(200).json({
                                                                                    statusCode: "0",
                                                                                    message: "Something Went Wrong. Please Try Later.....!!"
                                                                              })
                                                                        })


                                                            } else {

                                                                  if (requestType == 1) {

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              userId: UserData._id,
                                                                              roomId: "",
                                                                              name: UserData.firstName + " " + UserData.surName,
                                                                              profilePic: UserData.profilePic ? UserData.profilePic : "",
                                                                              chatOnlineStatus: UserData.chatOnlineStatus,
                                                                              chatType: "User",
                                                                              messageList: [],
                                                                              message: "Data Found.....!!"
                                                                        })

                                                                  } else {

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              userId: "",
                                                                              roomId: connection.roomId,
                                                                              name: connection.groupName,
                                                                              profilePic: UserData.groupPic ? UserData.groupPic : "",
                                                                              chatOnlineStatus: "false",
                                                                              chatType: "Group",
                                                                              messageList: [],
                                                                              message: "Data Found.....!!"
                                                                        })

                                                                  }

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Please Try Later.....!!"
                                                            })
                                                      })

                                          } else {

                                                if (requestType == 1) {

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            userId: UserData._id,
                                                            roomId: "",
                                                            name: UserData.firstName + " " + UserData.surName,
                                                            profilePic: UserData.profilePic ? UserData.profilePic : "",
                                                            chatOnlineStatus: UserData.chatOnlineStatus,
                                                            chatType: "User",
                                                            messageList: [],
                                                            message: "Data Found.....!!"
                                                      })

                                                } else {
                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Access Denied.....!!"
                                                      })
                                                }

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later.....!!"
                                          })
                                    })
                        } else {
                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Access Denied.....!!"
                              })
                        }




                        // OneOnOneConversation(teacherId, requestId, messageId)
                        //       .then(messagesListResponse => {
                        //             res.status(200).json({
                        //                   statusCode: "1",
                        //                   messageList: messagesListResponse,
                        //                   message: "Data Found...!!"
                        //             })
                        //       })
                        //       .catch(err => {
                        //             console.log(err)
                        //             res.status(200).json({
                        //                   statusCode: "0",
                        //                   message: "Something Went Wrong. Please try later...!!"
                        //             })
                        //       })

                        // GroupConversation(teacherId, requestId, messageId)
                        //       .then(messagesListResponse => {
                        //             res.status(200).json({
                        //                   statusCode: "1",
                        //                   messageList: messagesListResponse,
                        //                   message: "Data Found...!!"
                        //             })
                        //       })
                        //       .catch(err => {
                        //             console.log(err)
                        //             res.status(200).json({
                        //                   statusCode: "0",
                        //                   message: "Something Went Wrong. Please try later...!!"
                        //             })
                        //       })


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

}