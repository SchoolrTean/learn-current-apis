
const mongoose = require('mongoose');

const chatMessageModel = require('../../../../models/chat/chatMessagesModel');
const ChatConversationModel = require('../../../../models/chat/chatConnectionModel');

const checkAssignment = require('../../shared/checkAssignmentController');
const checkChat = require('../../shared/checkChatController');

module.exports = (userId, roomId, message, messageType, messageUrls, replyId, replyUserId, assignmentSchoolId, dontIncrementNewMessageFlag = 0, incremenNewMailFlag = 0) => {

    return new Promise(async (resolve, reject) => {

        try {

            let checkError = 1;

            const messageData = new chatMessageModel({
                _id: new mongoose.Types.ObjectId(),
                userId,
                roomId,
                message,
                messageType,
                urls: messageUrls
            })

            /**Check if this message is reply to any message above */
            if (replyId) {
                /**If this is the reply for message then these values will be saved */
                messageData.replyId = replyId
                messageData.replyUserId = replyUserId

                if (checkError == 1)
                    checkError = await checkChat.status(userId, roomId, replyId)


            }

            /**Check if this message is for clarity of any assignment */
            if (assignmentSchoolId) {
                /**If this is this is the clarity for above message then these values will be saved */
                messageData.assignmentSchoolId = assignmentSchoolId

                if (checkError == 1)
                    checkError = await checkAssignment.status(assignmentSchoolId)

            }

            //  console.log("error" + error);


            if (checkError == 1) {

                messageData.save()
                    .then(messageSaved => {

                        // ChatConversationModel.updateMany({
                        //     roomId
                        // }, {
                        //     $set: {
                        //         lastMessageId: messageSaved._id
                        //     },
                        //     $inc: {
                        //         newMessageCount: 1
                        //     }
                        // })
                        //     .exec()
                        //     .then(newMessageCountUpdated => {

                        if (messageSaved) {
                            let LastMessageUpdateWithNewMessageCount = 1;

                            let LastMessageUpdate = ChatConversationModel.updateOne({
                                initiatorUserId: userId,
                                roomId
                            }, {
                                $set: {
                                    lastMessageId: messageSaved._id
                                }
                            }).exec()

                            if (dontIncrementNewMessageFlag == 0) {

                                LastMessageUpdateWithNewMessageCount = ChatConversationModel.updateMany({
                                    roomId,
                                    initiatorUserId: {
                                        $ne: userId
                                    }
                                }, {
                                    $set: {
                                        lastMessageId: messageSaved._id
                                    },
                                    $inc: { newMessageCount: 1 }
                                }).exec()

                            }

                            if (incremenNewMailFlag == 1) {

                                LastMessageUpdateWithNewMessageCount = ChatConversationModel.updateMany({
                                    roomId,
                                    initiatorUserId: {
                                        $ne: userId
                                    }
                                }, {
                                    $set: {
                                        lastMessageId: messageSaved._id
                                    },
                                    $inc: { newMailCount: 1 }
                                }).exec()

                            }


                            Promise.all([LastMessageUpdate, LastMessageUpdateWithNewMessageCount])
                                .then(updateSuccessful => {

                                    console.log(updateSuccessful);

                                    if (updateSuccessful.length > 0) {
                                        resolve(messageSaved._id)
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

                    })
                    .catch(err => {
                        console.log(err);
                        reject(0);
                    })

                // })
                // .catch(err => {
                //     console.log(err);
                //     reject(0);
                // })

            } else {
                reject(0);
            }

        } catch (error) {
            reject(0);
        }

    })
};