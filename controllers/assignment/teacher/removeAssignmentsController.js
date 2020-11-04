const AssignmentModel = require('../../../models/assignment/assignmentModel');

const GroupList = require('../../group/teacher/activeGroupsList');

const VerifyTeacher = require('../../../middleware/verifyTeacher');


/**Remove Cancelled Assignment upto current instance */
exports.Cancelled = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            //Verify Teacher
            VerifyTeacher(teacherId, "", async (error, response) => {

                  if (response && response.statusCode != "0") {

                        let groupList = await GroupList(teacherId);

                        AssignmentModel.updateMany({
                                    groupId: {
                                          $in: groupList
                                    },
                                    isActive: true,
                                    teacherDeleteStatus: false,
                                    cancelStatus: true
                              }, {
                                    $set: {
                                          teacherDeleteStatus: true,
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

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}


/**Remove Delete All Assignment upto current instance */
exports.Deleted = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            //Verify Teacher
            VerifyTeacher(teacherId, "", async (error, response) => {

                  if (response && response.statusCode != "0") {

                        let groupList = await GroupList(teacherId);

                        AssignmentModel.updateMany({

                                    groupId: {
                                          $in: groupList
                                    },
                                    isActive: true,
                                    teacherDeleteStatus: false,
                                    teacherDeleteAllStatus: true
                              }, {
                                    $set: {
                                          teacherDeleteStatus: true,
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

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}