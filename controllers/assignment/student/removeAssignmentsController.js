const AssignmentModel = require('../../../models/assignment/assignmentModel');

const ConnectedGroups = require('../../group/student/connectedGroups');

const VerifyStudent = require('../../../middleware/verifyStudent');


/**Remove Cancelled Assignment upto current instance */
exports.Cancelled = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            //Verify Teacher
            VerifyStudent(studentId, "")
                  .then(async response => {

                        if (response && response.statusCode != "0") {

                              /**Connected Group List  */
                              let groupList = await ConnectedGroups.list(studentId)

                              AssignmentModel.updateMany({
                                          groupId: {
                                                $in: groupList
                                          },
                                          isActive: true,
                                          deleted: {
                                                $nin: studentId
                                          },
                                          cancelStatus: true
                                    }, {
                                          $push: {
                                                deleted: studentId,
                                          }

                                    })
                                    .exec()
                                    .then(assignmentsDeleted => {

                                          if (assignmentsDeleted.nModified > 0) {

                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      message: "Deleted..!!"
                                                })

                                          } else {

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Records Exist..!!"
                                                })

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try later..!!"
                                          })
                                    })

                        } else {
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: error.message
                              })
                        }
                  })
                  .catch(err => {
                        console.log(err);
                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try later..!!"
                        })
                  })
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}




/**Remove Delete All Assignment upto current instance */
exports.Deleted = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            //Verify Teacher
            VerifyStudent(studentId, "")
                  .then(async response => {

                        if (response && response.statusCode != "0") {

                              /**Connected Group List  */
                              let groupList = await ConnectedGroups.list(studentId)

                              AssignmentModel.updateMany({
                                          groupId: {
                                                $in: groupList
                                          },
                                          isActive: true,
                                          deleted: {
                                                $nin: studentId
                                          },
                                          teacherDeleteAllStatus: true
                                    }, {
                                          $push: {
                                                deleted: studentId,
                                          }

                                    })
                                    .exec()
                                    .then(assignmentsDeleted => {

                                          if (assignmentsDeleted.nModified > 0) {

                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      message: "Deleted..!!"
                                                })

                                          } else {

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Records Exist..!!"
                                                })

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try later..!!"
                                          })
                                    })

                        } else {
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: error.message
                              })
                        }
                  })
                  .catch(err => {
                        console.log(err);
                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try later..!!"
                        })
                  })
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}