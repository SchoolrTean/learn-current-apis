const VerifyTeacher = require('../../../middleware/verifyTeacher');
const ChatConnectionModel = require('../../../models/chat/chatConnectionModel');
// const ChatMessageModel = require('../../../models/chat/chatMessagesModel');

const ParseConnections = require('../shared/parseConnectionsController');


/**
 * Get all messages thta teacher received based on group.
 * These messages may contain broadcast, individual, reply and join Messages
 */
module.exports = (req, res, next) => { //, upload.any('messageDocument')

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            // mongoose.set('debug', true);


            //Verify Teacher and Grade
            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        ChatConnectionModel.find({
                              initiatorUserId: teacherId,
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

                                    if (Connections.length > 0) {

                                          ParseConnections(Connections, teacherId)
                                                .then(ConnectionList => {

                                                      console.log(ConnectionList)

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            connectionList: ConnectionList,
                                                            message: "Data Found...!!"
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
                                                connectionList: [],
                                                message: "No Records Found...!!"
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

}