const ConnectionModel = require('../../../models/group/connectionModel')
const mongoose = require('mongoose');

mongoose.set('debug', true);

const ConnectionDetails = (connectionId) => {

      return new Promise((resolve, reject) => {

            ConnectionModel.findOne({
                        _id: connectionId,
                        isActive: true
                  })
                  .populate('teacherId')
                  .populate('groupId')
                  .exec()
                  .then(connectionRequest => {

                        console.log(connectionRequest);

                        resolve({
                              connectionId: connectionRequest._id,
                              connectionStatus: connectionRequest.connectionStatus,
                              teacherProfilePic: connectionRequest.teacherId.profilePic,
                              teacherName: connectionRequest.teacherId.name,
                              groupname: connectionRequest.groupId.grade + " - " + connectionRequest.groupId.section
                        });

                  })
                  .catch(err => {
                        console.log(err);
                        reject(0)
                  })
      });

}


module.exports = ConnectionDetails