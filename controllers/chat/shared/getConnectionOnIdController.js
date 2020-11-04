const ChatConnectionModel = require('../../../models/chat/chatConnectionModel');
// const ChatMessageModel = require('../../../models/chat/chatMessagesModel');

const ParseConnections = require('./parseConnectionsController');


/**
 * Get all messages thta teacher received based on group.
 * These messages may contain broadcast, individual, reply and join Messages
 */
module.exports = (roomId, userId) => {

    return new Promise((resolve, reject) => {

        ChatConnectionModel.find({
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

                if (Connections.length > 0) {

                    ParseConnections(Connections, teacherId)
                        .then(ConnectionList => {

                            console.log(ConnectionList)
                            resolve({
                                statusCode: "1",
                                connectionList: ConnectionList
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