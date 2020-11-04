const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');


exports.list = (studentId) => {

      return new Promise((resolve, reject) => {

            if (studentId) {

                  ClassStudentConnectionModel.find({
                              studentId,
                              connectionStatus: 1,
                              isActive: true
                        }, {
                              "classId": 1,
                        })
                        .exec()
                        .then(connections => {
                              console.log("connections" + connections);

                              if (connections.length > 0) {
                                    let connectionsList = connections.map(connection => connection.classId);

                                    resolve(connectionsList);
                              } else {
                                    resolve([]);
                              }

                        })
                        .catch(err => {
                              console.log(err);
                              reject(1) //Something Went Wrong
                        })
            } else {
                  console.log(err);
                  reject(1) //Something Went Wrong
            }

      })

}


exports.singleRecord = (studentId, groupId) => {

      return new Promise((resolve, reject) => {

            if (studentId) {

                  ClassStudentConnectionModel.findOne({
                              studentId,
                              classId : groupId,
                              connectionStatus: 1,
                              isActive: true
                        }, {
                              "classId": 1,
                        })
                        .exec()
                        .then(connection => {
                              console.log("connection" + connection);

                              if (connection) {
                                    resolve(connection.classId);
                              } else {
                                    resolve(0);
                              }

                        })
                        .catch(err => {
                              console.log(err);
                              reject(1) //Something Went Wrong
                        })
            } else {
                  console.log(err);
                  reject(1) //Something Went Wrong
            }

      })

}
