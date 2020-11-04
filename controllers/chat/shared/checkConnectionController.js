const connectionModel = require('../../../models/common/connection');

exports.status = (studentId, groupId) => {

      return new Promise((resolve, reject) => {

            connectionModel.findOne({
                        studentId,
                        groupId,
                        isActive: true,
                        connectionStatus: 2
                  }, {
                        _id : 1
                  }).exec()
                  .then(connection => {
                        if (connection) {
                              resolve(1)
                        } else {
                              resolve(2) //No Connection Exists
                        }
                  })
                  .catch(err => {
                        console.log(err);
                        resolve(3) // internal Error 
                  })

      })

}