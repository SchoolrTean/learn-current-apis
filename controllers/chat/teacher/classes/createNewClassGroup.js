const ChatConnectionModel = require('../../../../models/chat/chatConnectionModel');
const mongoose = require('mongoose');

/**Establish Connection b/w students  */

const saveNewConnection = (teacherId, groupId, groupName) => {

      return new Promise((resolve, reject) => {

            try {

                  if (teacherId && groupId && groupName) {

                        const NewAssignmentGroupConnection = new ChatConnectionModel({
                              _id: new mongoose.Types.ObjectId(),
                              initiatorUserId: teacherId,
                              groupName,
                              roomId: groupId,
                              // relationId: groupId,
                              connectionType: 3,
                        })

                        NewAssignmentGroupConnection.save()
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

            } catch (error) {
                  console.log(error);
                  reject(0);
            }

      })

}

module.exports = saveNewConnection