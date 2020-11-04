const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const ClassTeacherConnectionModel = require('../../../../models/classes/classTeacherConnectionModel');

module.exports = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        ClassTeacherConnectionModel.find({
                                    teacherId,
                                    isActive: true
                              })
                              .exec()
                              .then(groups => {

                                    if (groups.length > 0) {

                                          console.log(groups);

                                          let groupArray = new Array();

                                          groups.forEach(group => {
                                                groupArray.push(group.classId);
                                          });

                                          MindBoxQuestionModel.find({
                                                      groupId: {
                                                            $in: groupArray
                                                      },
                                                      deletedUsers: {
                                                            $ne: teacherId
                                                      },
                                                      questionDeletedStatus: false,
                                                      isActive: true
                                                })
                                                .distinct("subjectName")
                                                .exec()
                                                .then(subjectNamesList => {

                                                      if (subjectNamesList.length > 0) {
                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  subjectList: subjectNamesList,
                                                                  message: "Data Found..!!"
                                                            })
                                                      } else {
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  subjectList: [],
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
                                                message: "No Grades or Group Names ...!!"
                                          })
                                    }
                              })
                              .catch(err => {
                                    console.log(err);
                                    res.status(200).json({
                                          statusCode: "0",
                                          subjectNames: [],
                                          message: "Something went wrong...!!"
                                    })
                              })

                  } else {

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied.....!!"
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