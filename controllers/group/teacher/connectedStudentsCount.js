const ConnectionModel = require('../../../models/classes/classStudentConnectionModel');

const count = (classId) => {

      return new Promise((resolve, reject) => {

            if (classId) {

                  ConnectionModel.countDocuments({
                        classId,
                        connectionStatus: 1,
                        isActive: true
                  })
                        .exec()
                        .then(connectionsCount => {

                              resolve(connectionsCount);

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

module.exports = count