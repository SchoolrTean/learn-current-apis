const ChatConnectionModel = require('../../../models/chat/chatConnectionModel');
const mongoose = require('mongoose');

const saveNewConnection = (initiatorId, receiverId) => {

      return new Promise((resolve, reject) => {

            ChatConnectionModel.find({
                        $or: [{
                              $and: [{
                                    initiatorUserId: initiatorId
                              }, {
                                    receiverUserId: receiverId
                              }]
                        }, {
                              $and: [{
                                    initiatorUserId: receiverId
                              }, {
                                    receiverUserId: initiatorId
                              }]
                        }],
                        connectionType: 1,
                        isActive: true
                  })
                  .exec()
                  .then(connections => {

                        console.log("student -student connections");
                        console.log(connections);

                        if (connections.length == 0) {

                              let roomId = new mongoose.Types.ObjectId();

                              let initiatorNewConnection = new ChatConnectionModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    initiatorUserId: initiatorId,
                                    receiverUserId: receiverId,
                                    roomId,
                                    connectionType: 1,

                              })

                              let recevierNewConnection = new ChatConnectionModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    initiatorUserId: receiverId,
                                    receiverUserId: initiatorId,
                                    roomId,
                                    connectionType: 1,
                              })

                              Promise.all([initiatorNewConnection.save(), recevierNewConnection.save()])
                                    .then(saved => {

                                          if (saved) {
                                                resolve(roomId);
                                          } else {
                                                reject(0);
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          reject(0);
                                    })

                        } else {

                              if (connections.length == 1) {

                                    let newConnection = "";

                                    if (String(connections[0].initiatorUserId) == String(initiatorId)) {

                                          newConnection = new ChatConnectionModel({
                                                _id: new mongoose.Types.ObjectId(),
                                                initiatorUserId: receiverId,
                                                receiverUserId: initiatorId,
                                                roomId: connections[0].roomId,
                                                connectionType: 1,
                                          })

                                    } else {
                                          newConnection = new ChatConnectionModel({
                                                _id: new mongoose.Types.ObjectId(),
                                                initiatorUserId: initiatorId,
                                                receiverUserId: receiverId,
                                                roomId: connections[0].roomId,
                                                connectionType: 1,
                                          })
                                    }

                                    newConnection.save()
                                          .then(saved => {

                                                if (saved) {
                                                      resolve(connections[0].roomId);
                                                } else {
                                                      reject(0);
                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);
                                                reject(0);
                                          })

                              } else {
                                    reject(0);
                              }

                        }

                  })
                  .catch(err => {
                        console.log(err);
                        reject(0);
                  })

      })

}

module.exports = saveNewConnection