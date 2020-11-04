const chatMessageModel = require('../../../models/chat/chatMessagesModel');

exports.status = (userId, roomId, messageId) => {

      return new Promise((resolve, reject) => {

            chatMessageModel.findOne({
                        _id: messageId,
                        roomId,
                        deleteAllStatus: false,
                        deletedUsers: {
                              $ne: userId
                        },
                        isActive: true
                  }).exec()
                  .then(chat => {
                        if (chat) {
                              resolve(1)
                        } else {
                              resolve(2) //No Record Exists with given Id
                        }
                  })
                  .catch(err => {
                        console.log(err);
                        resolve(0) //Internal Server Error
                  })

      })

}