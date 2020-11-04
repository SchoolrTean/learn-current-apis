const VerifyTeacher = require('../../../middleware/verifyTeacher');

const Grades = require('../../../models/admin/master/academic/gradesModel')

const TeacherGroupModel = require('../../../models/group/teacherGroupModel');

const editGroup = (req, res, next) => {

      let groupPic = "";

      if (req.file) {
            groupPic = req.file.path.replace(/\\/g, '/');
      }

      console.log(req.params);
      console.log(req.body);


      if (req.params.teacherId && req.params.groupId && ((req.body.gradeId && req.body.editType == 1) || (groupPic != "" && req.body.editType == 2))) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;
            let gradeId = req.body.gradeId;
            let section = req.body.section;
            let editType = req.body.editType


            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, groupId, async (error, response) => {

                  if (response && response.statusCode != "0") {

                        let error = 1;

                        let updateQuery = {};

                        if (editType == 1) {

                              //check wheather grades exists and isActive
                              let gradeExists = Grades.findOne({
                                    _id: gradeId,
                                    isActive: true
                              }).exec();

                              //check wheather teacher grades exists and isActive
                              let groupExists = TeacherGroupModel.findOne({
                                          teacherId,
                                          gradeId,
                                          section: section.toLowerCase(),
                                          isActive: true
                                    })
                                    .exec()

                              await Promise.all([gradeExists, groupExists])
                                    .then(result => {

                                          if (result[0]) {

                                                if (result[1]) {

                                                      return res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Already registered this Group Name...!!"
                                                      });

                                                } else {

                                                      error = 0;
                                                      updateQuery = {
                                                            grade: result[0].grade,
                                                            gradeId,
                                                            section,
                                                      }

                                                }

                                          } else {
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Access Denied...!!!"
                                                });
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please try later..!!"
                                          });
                                    }) 

                        } else {

                              error = 0;

                              updateQuery = {
                                    groupPic
                              }

                        }

                        console.log(error + "error");

                        if (error == 0) {

                              TeacherGroupModel.updateOne({
                                          _id: groupId
                                    }, {
                                          $set: updateQuery
                                    })
                                    .then(groupUpdated => {

                                          if (groupUpdated.ok == 1) {

                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      message: "Update Successful..!!"
                                                });

                                          } else {

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Please try later..!"
                                                });

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please try later..!!"
                                          });
                                    });

                        }


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

module.exports = editGroup