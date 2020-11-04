const ChatMessageModel = require('../../../models/chat/chatMessagesModel')

module.exports = (Connections, teacherId) => {

    return new Promise(async (resolve, reject) => {

        try {

            let ConnectionsDataList = new Array();

            for (let index = 0; index < Connections.length; index++) {

                const Connection = Connections[index];

                let ConnectionObj = {
                    connectionId: Connection._id,
                    roomId: Connection.roomId,
                    initiatorUserId: teacherId,
                    connectionType: Connection.connectionType == 2 ? 3 : Connection.connectionType, //1-One2One 2-Group 3-Teacher Class Group

                    receiverUserId: Connection.receiverUserId ? Connection.receiverUserId._id : "",
                    receiverFirstName: Connection.receiverUserId ? Connection.receiverUserId.firstName : "",
                    receiverSurName: Connection.receiverUserId ? Connection.receiverUserId.surName : "",
                    receiverProfilePic: Connection.receiverUserId ? Connection.receiverUserId.profilePic ? Connection.receiverUserId.profilePic : "" : "",
                    onlineStatus: Connection.receiverUserId ? String(Connection.receiverUserId.chatOnlineStatus) : "",

                    groupName: Connection.groupName ? Connection.groupName : "",
                    groupPic: Connection.groupPic ? Connection.groupPic : "",

                    lastMessage: Connection.lastMessageId ? Connection.lastMessageId.message : "",
                    lastMessageUrls: Connection.lastMessageId ? Connection.lastMessageId.urls : [],
                    lastMessageUserId: Connection.lastMessageId ? Connection.lastMessageId.userId._id : "",
                    lastMessageUserFirstName: Connection.lastMessageId ? Connection.lastMessageId.userId.firstName : "",
                    lastMessageUserSurName: Connection.lastMessageId ? Connection.lastMessageId.userId.surName : "",
                    lastMessagetype: Connection.lastMessageId ? String(Connection.lastMessageId.messageType) : "", //1-message 2-leave letter 3-image 4-attachment 5-School Assignment 6-audio
                    lastMessageDeleteAllStatus: Connection.lastMessageId ? String(Connection.lastMessageId.deleteAllStatus) : "false",
                    lastMessageDate: Connection.lastMessageId ? Connection.lastMessageId.date : "",

                    newMessageCount: Connection.newMessageCount,
                    newMailCount: Connection.newMailCount,
                    typingStatus: "false"
                }

                if (Connection.lastMessageId) {

                    //Same user has sent the last message seen and not seen status                        
                    if (String(Connection.lastMessageId.userId) == String(teacherId)) {

                        if (Connection.lastMessageId.seenStatus == true) {
                            ConnectionObj.lastMessageStatus = 2 //Seen i.e double tick with color
                        } else {
                            ConnectionObj.lastMessageStatus = 1 //Not Seen i.e single tick
                        }

                        ConnectionObj.lastMessageStatus = 0 //dont show anything

                    } else {

                        if (Connection.lastMessageId.seenStatus == true) {
                            ConnectionObj.lastMessageStatus = 0 //show nothing but message
                        } else {

                            ConnectionObj.lastMessageStatus = 3 //Show New Message Count
                            ConnectionObj.messageCount = await ChatMessageModel.countDocuments({
                                roomId: Connection.roomId,
                                userId: {
                                    $ne: teacherId
                                },
                                isActive: true,
                                seenStatus: false
                            })
                        }

                    }
                } else {
                    ConnectionObj.lastMessageStatus = 0;
                }

                ConnectionsDataList.push(ConnectionObj);

            }

            resolve(ConnectionsDataList)


        } catch (error) {

            console.log(error);
            reject('Something Went Wrong...!!!')

        }

    });

}