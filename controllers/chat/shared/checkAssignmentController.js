const schoolModel = require('../../../models/assignment/assignmentModel');

exports.status = (assignmentId) => {

      return new Promise((resolve, reject) => {

            schoolModel.findOne({
                        _id: assignmentId,
                        cancelStatus: false,
                        teacherDeleteStatus: false,
                        teacherDeleteAllStatus: false,
                        isActive: true
                  }).exec()
                  .then(assignment => {
                        if (assignment) {
                              resolve(1)
                        } else {
                              resolve(2) //No Assignment Exists
                        }
                  })
                  .catch(err => {
                        console.log(err);
                        resolve(0) // internal Error 
                  })
      })

}