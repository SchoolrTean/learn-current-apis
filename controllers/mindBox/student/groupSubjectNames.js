const  ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');

const StudentConnectedGroups = require('../../group/student/connectedGroups')

const VerifyStudent = require('../../../middleware/verifyStudent')



module.exports = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            console.log(studentId);

            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              /** Connected Student Groups **/
                              StudentConnectedGroups.list(studentId)
                                    .then(connectedGroupsList => {

                                          if (connectedGroupsList.length > 0) {

                                                ClassTeacherConnectionModel.find({
                                                            classId: {
                                                                  $in: connectedGroupsList
                                                            },
                                                            isActive: true
                                                      })
                                                      .exec()
                                                      .then(TeacherGroupsData => {

                                                            if (TeacherGroupsData.length > 0) {

                                                                  let subjectNamesList = [];
                                                                  TeacherGroupsData.forEach(TeacherGroup => {
                                                                        subjectNamesList = [...subjectNamesList, ...TeacherGroup.subjects, ...TeacherGroup.secondLanguages, ...TeacherGroup.thirdLanguages]
                                                                  });

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        subjectNames: [...new Set(subjectNamesList)], //[...GroupData.subjectsList, ...GroupData.secondLanguage, ...GroupData.thirdLanguage],
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
