const UserModel = require('../../models/authentication/userModel');

module.exports = (userId) => {

      return new Promise(async (resolve, reject) => {

            UserModel.updateOne({
                        _id: userId
                  }, {
                        $set: {
                              mindBoxOpendTimestamp: Date.now() + 5.5 * 60 * 60 * 1000
                        }
                  })
                  .exec()
                  .then(timeStampUpdated => {

                        if (timeStampUpdated.nModified == 1) {
                              resolve(1);
                        } else {
                              reject(0);
                        }

                  })
                  .catch(err => {
                        console.log(err);
                        reject(0);
                  })

      });
}