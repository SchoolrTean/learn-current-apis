const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');

const StudentConnectedGroups = require('../../../group/student/connectedGroups')

const VerifyStudent = require('../../../../middleware/verifyStudent')



module.exports = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            console.log(studentId);

            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              StudentConnectedGroups.list(studentId)
                                    .then(connectedGroupsList => {

                                          if (connectedGroupsList.length > 0) {

                                                MindBoxQuestionModel.find({
                                                            groupId: {
                                                                  $in: connectedGroupsList
                                                            },
                                                            deletedUsers: {
                                                                  $ne: studentId
                                                            },
                                                            isActive: true
                                                      })
                                                      .distinct("subjectName")
                                                      .exec()
                                                      .then(subjectNames => {

                                                            if (subjectNames.length > 0) {

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        subjectNames: subjectNames,
                                                                        // subjectNames: ['science', 'social', 'english'],
                                                                        message: "Data Found..!!"
                                                                  })

                                                            } else {

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        subjectNames: [],
                                                                        message: "No Records Found..!!"
                                                                  })
                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err)
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong...!!"
                                                            })

                                                      })


                                          } else {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Please check connection with teacher..!!!"
                                                })
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied..!!"
                                          })
                                    });

                        } else {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: success.message
                              })

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please Try Later..!!"
                        })
                  })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}