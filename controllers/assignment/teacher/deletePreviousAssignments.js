const AssignmentModel = require('../../../models/assignment/assignmentModel');

const deleteAssignment = (assignmentId) => {

      return new Promise(async (resolve, reject) => {

            AssignmentModel.updateOne({
                        _id: assignmentId
                  }, {
                        $set: {
                              isActive: false
                        }
                  })
                  .exec()
                  .then(activityDeleted => {

                        if (activityDeleted.ok > 0) {
                              resolve(1);
                        } else {
                              reject(1);
                        }

                  })
                  .catch(err => {
                        console.log(err);
                        reject(1);
                  });

      });
}

module.exports = deleteAssignment