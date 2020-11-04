const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');

const ConnectedStudentsList = (classId, listType, subjectName = null) => {

      return new Promise((resolve, reject) => {

            if (classId) {

                  if (subjectName) {

                        Query = {
                              classId,
                              $or: [
                                    { subjects: { $in: subjectName } },
                                    { secondLanguage: subjectName },
                                    { thirdLanguage: subjectName }
                              ],
                              connectionStatus: 1,
                              isActive: true
                        }
                  } else {
                        Query = {
                              classId,
                              connectionStatus: 1,
                              isActive: true
                        }
                  }

                  ClassStudentConnectionModel.find(Query)
                        .populate('studentId', 'firstName surName profilePic notificationId')
                        .exec()
                        .then(connectionList => {

                              let connectionsListArray = [];

                              let connectionsArray = [];

                              if (connectionList.length > 0) {

                                    for (let index = 0; index < connectionList.length; index++) {
                                          const connection = connectionList[index];

                                          connectionsListArray.push({
                                                studentId: connection.studentId._id ? connection.studentId._id : "",
                                                firstName: connection.studentId.firstName,
                                                lastName: connection.studentId.lastName,
                                                profilePic: connection.studentId.profilePic,
                                                notificationId: connection.studentId.notificationId
                                          })

                                          connectionsArray.push(connection.studentId._id);

                                    }

                                    if (listType == 1) {
                                          resolve(connectionsArray);
                                    } else {
                                          resolve(connectionsListArray);
                                    }

                              } else {
                                    resolve(connectionsArray);
                              }

                        })
                        .catch(err => {
                              console.log(err);
                              reject(1) //Something Went Wrong
                        })

            } else {
                  reject(2) // All fields are Mandatory
            }

      })

}

module.exports = ConnectedStudentsList