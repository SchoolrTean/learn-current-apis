const chatMessageModel = require('../../../../models/chat/chatMessagesModel');

const parseMessages = require('./parseMessagesController');

/**
 * Get all messages thta teacher received based on group.
 * These messages may contain broadcast, individual, reply and join Messages
 */
module.exports = (teacherId, roomId, messageId, getDetails = null) => { //getDetails null-to know this Message exists with Id and its activeStatus 1- TO get Infomration of this message

      return new Promise((resolve, reject) => {

            try {

                  if (teacherId && messageId && roomId) {

                        chatMessageModel.findOne({
                                    _id: messageId,
                                    roomId,
                                    deleteAllStatus: false,
                                    deletedUsers: {
                                          $ne: teacherId
                                    },
                                    isActive: true
                              })
                              .populate('userId', 'firstName surName profilePic isActive')
                              .populate('replyId')
                              .populate('replyUserId', 'firstName surName profilePic isActive')
                              .populate('assignmentSchoolId')
                              .exec()
                              .then(message => {

                                    console.log(message);

                                    if (message) {

                                          if (getDetails) {

                                                parseMessages([message])
                                                      .then(messagesListResponse => {

                                                            resolve({
                                                                  statusCode: "1",
                                                                  messageList: messagesListResponse,
                                                            })

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            reject("Something Went Wrong...!!")
                                                      })
                                          } else {

                                                resolve({
                                                      statusCode: "1",
                                                })

                                          }

                                    } else {
                                          resolve({
                                                statusCode: "2" //No Records Found
                                          })
                                    }

                              })
                              .catch(err => {

                                    console.log(err);

                                    reject("Something Went Wrong...!!")

                              })

                  } else {
                        resolve({
                              statusCode: "3" //All Fields Are Mandatory
                        })
                  }

            } catch (error) {

                  console.log(error);
                  reject('Something Went Wrong...!!!')

            }

      });

}