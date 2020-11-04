const mongoose = require('mongoose');

const SchoolAssignmentModel = require('../../../models/assignment/assignmentModel');

/**
 * assignmentId - This id may be assignment id or schoolId depending on calling function
 * userId - this id is studentId or teacherId depending on calling function
 * section type - section from which this condition was called
 * idType - defining which id was it like assignment or schoolId 
 */

exports.checkStared = (assignmentId, userId, sectionType) => { //

      mongoose.set('debug', true);

      return new Promise((resolve, reject) => {

            try {

                  SchoolAssignmentModel.find({
                              _id: assignmentId,
                              sectionType,
                              "stared.userId": userId
                        }, {
                              "stared.$.userId": 1
                        })
                        .exec()
                        .then(staredExists => {

                              console.log(staredExists);

                              console.log(staredExists[0]);

                              if (staredExists[0]) {

                                    resolve({
                                          starTypeId: staredExists[0].stared[0].starTypeId,
                                          starNote: staredExists[0].stared[0].starNote,
                                    })

                              } else {

                                    resolve(1)

                              }

                        })
                        .catch(err => {
                              console.log(err);
                              reject("Something Went Wrong");
                        })
            } catch {
                  reject("Something Went Wrong");
            }

      });
}