const ChatConnectionModel = require('../../../../models/chat/chatConnectionModel');
const mongoose = require('mongoose');

/**Establish Connection b/w students  */

const saveNewConnection = (groupId, studentId) => {

      return new Promise((resolve, reject) => {

            try {

                  if (groupId && studentId) {

                        console.log(groupId);
                        console.log(studentId);

                        ChatConnectionModel.findOne({
                                    roomId: groupId,
                                    deleteStatus: false,
                                    isActive: true
                              }).exec()
                              .then(connectionExists => {

                                    if (connectionExists) {

                                          ChatConnectionModel.updateOne({
                                                      _id: connectionExists._id
                                                }, {
                                                      $push: {
                                                            groupUserIds: studentId
                                                      }
                                                })
                                                .exec()
                                                .then(studentAdded => {

                                                      console.log(studentAdded);

                                                      if (studentAdded.nModified == 1) {
                                                            resolve(1);
                                                      } else {
                                                            reject(0);
                                                      }
                                                })

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
                  reject(0);
            }

      })

}

module.exports = saveNewConnection