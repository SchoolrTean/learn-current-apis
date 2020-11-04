const SchoolModel = require('../../../models/assignment/assingmentListModel');
const AssignmentsModel = require('../../../models/assignment/assignmentModel');

const cancelPreviousAssignment = (assignmentIds, schoolId) => {

      return new Promise((resolve, reject) => {

            AssignmentsModel.updateMany({
                        _id: {
                              $in: assignmentIds
                        },
                  }, {
                        $set: {
                              cancelStatus: true,
                        }

                  })
                  .then(cancelledAssignments => {

                        if (cancelledAssignments.nModified > 0) {

                              SchoolModel.updateOne({
                                          _id: schoolId,
                                    }, {
                                          $set: {
                                                cancelStatus: true,
                                          }
                                    })
                                    .then(async cancelledAssignment => {

                                          if (cancelledAssignment.nModified > 0) {
                                                resolve(1)
                                          } else {
                                                reject(1)
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          reject(1)
                                    })
                        } else {
                              reject(1)
                        }

                  })
                  .catch(err => {
                        console.log(err);
                        reject(1)
                  })
      })

}

module.exports = cancelPreviousAssignment;