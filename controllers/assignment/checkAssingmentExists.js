const AssignmentModel = require('../../models/assignment/assignmentModel');

exports.checkAssignmentExists = (assignmentId, groupId, sectionType) => {

      return new Promise((resolve, reject) => {

            try {

                  AssignmentModel.findOne({
                              _id: assignmentId,
                              groupId: groupId,
                              sectionType: sectionType,
                              cancelStatus: false,
                              teacherDeleteStatus: false,
                              teacherDeleteAllStatus: false,
                              isActive: true
                        }).exec()
                        .then(record => {
                              if (record) {
                                    resolve(record)
                              } else {
                                    resolve(0)
                              }
                        }).catch(err => {
                              console.log(err);
                              resolve(formattedDate);
                        })

            } catch (error) {
                  reject(0);
            }

      })

}
