const ChatConnectionModel = require('../../../models/chat/chatConnectionModel');
const mongoose = require('mongoose');

/**Establish Connection b/w students  */

const saveNewConnection = (groupUserIds, groupName, groupPic, userId, roomId) => {

      return new Promise((resolve, reject) => {

            if (Array.isArray(groupUserIds) === true && typeof groupName == 'string') {

                  console.log(groupUserIds);
                  console.log(groupName);

                  // groupUserIds.push(userId);

                  let groupConnections = new Array();

                  for (let index = 0; index < groupUserIds.length; index++) {
                        const initiatorUserId = groupUserIds[index];

                        const groupUserIdsExcludingInitiatorId = [...groupUserIds]

                        groupUserIdsExcludingInitiatorId.splice(index, 1);

                        const NewGroupConnection = new ChatConnectionModel({
                              _id: new mongoose.Types.ObjectId(),
                              initiatorUserId,
                              roomId,
                              groupUserIds: groupUserIdsExcludingInitiatorId,
                              groupAdmins: [userId],
                              groupName,
                              groupPic,
                              connectionType: 2,
                              lastMessageDate: new Date()
                        })

                        console.log(NewGroupConnection)

                        groupConnections.push(NewGroupConnection.save())
                  }


                  Promise.all(groupConnections)
                        .then(saved => {

                              if (saved) {
                                    resolve(1);
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

}

module.exports = saveNewConnection