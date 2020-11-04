const UserModel = require('../../../models/authentication/userModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');
const ClassModel = require('../../../models/classes/classModel');


const getSchoolGroup = (req, res, next) => {

      console.log("req.params");
      console.log(req.params);

      try {
            if (req.params.schoolId && req.params.groupId) {

                  let schoolId = req.params.schoolId;
                  let classId = req.params.groupId;

                  UserModel.findOne({
                        _id: schoolId,
                        isActive: true
                  })
                        .exec()
                        .then(schoolData => {

                              if (schoolData) {

                                    ClassModel.findOne({
                                          _id: classId,
                                          createdBy: schoolId,
                                          isActive: true
                                    })
                                          .sort({
                                                date: 1
                                          })
                                          .populate('coordinator')
                                          .exec()
                                          .then(classFound => {

                                                if (classFound) {

                                                      let subjectList = [];
                                                      let secondLanguage = [];
                                                      let thirdLanguage = [];

                                                      ClassTeacherConnectionModel.find({
                                                            schoolId,
                                                            classId,
                                                            isActive: true
                                                      })
                                                            .populate('teacherId')
                                                            .exec()
                                                            .then(teacherList => {

                                                                  if (teacherList.length > 0) {

                                                                        for (let index = 0; index < teacherList.length; index++) {
                                                                              const assignmentGroup = teacherList[index];

                                                                              if (assignmentGroup.subjects.length > 0) {

                                                                                    for (let index = 0; index < assignmentGroup.subjects.length; index++) {
                                                                                          const subject = assignmentGroup.subjects[index];

                                                                                          subjectList.push({
                                                                                                teacherId: assignmentGroup.teacherId._id,
                                                                                                teacherFirstName: assignmentGroup.teacherId.firstName,
                                                                                                teacherSurName: assignmentGroup.teacherId.surName,
                                                                                                subject: subject
                                                                                          })
                                                                                    }

                                                                              }

                                                                              if (assignmentGroup.secondLanguages.length > 0) {

                                                                                    for (let index = 0; index < assignmentGroup.secondLanguages.length; index++) {
                                                                                          const subject = assignmentGroup.secondLanguages[index];

                                                                                          secondLanguage.push({
                                                                                                teacherId: assignmentGroup.teacherId._id,
                                                                                                teacherFirstName: assignmentGroup.teacherId.firstName,
                                                                                                teacherSurName: assignmentGroup.teacherId.surName,
                                                                                                subject: subject
                                                                                          })
                                                                                    }

                                                                              }

                                                                              if (assignmentGroup.thirdLanguages.length > 0) {

                                                                                    for (let index = 0; index < assignmentGroup.thirdLanguages.length; index++) {
                                                                                          const subject = assignmentGroup.thirdLanguages[index];

                                                                                          thirdLanguage.push({
                                                                                                teacherId: assignmentGroup.teacherId._id,
                                                                                                teacherFirstName: assignmentGroup.teacherId.firstName,
                                                                                                teacherSurName: assignmentGroup.teacherId.surName,
                                                                                                subject: subject
                                                                                          })
                                                                                    }

                                                                              }


                                                                        }

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              gradeId: classFound.gradeId,
                                                                              grade: classFound.grade,
                                                                              section: classFound.section,
                                                                              subjectList,
                                                                              secondLanguage,
                                                                              thirdLanguage,
                                                                              coordinatorId: classFound.coordinator._id,
                                                                              coordinatorFirstName: classFound.coordinator.firstName,
                                                                              coordinatorSurName: classFound.coordinator.surName,
                                                                              message: "Data Found...!!"
                                                                        });


                                                                  } else {
                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              message: "Something Went Wrong. Please try later"
                                                                        });
                                                                  }

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something Went Wrong. Please try later"
                                                                  });
                                                            })

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "No Group exists..!!"
                                                      });

                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something went wrong. Please Try later..!!"
                                                });
                                          })

                              } else {

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Access Denied..!!"
                                    });

                              }

                        })
                        .catch(err => {
                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something went wrong. Please Try later..!!"
                              });
                        })

            } else {
                  return res.status(200).json({
                        statusCode: "0",
                        message: "All fields are mandatory..!!"
                  });
            }

      } catch (error) {

            console.log(error);

            res.status(200).json({
                  statusCode: "0",
                  message: "Something went Wrong. Please try later..!!"
            })

      }

}

module.exports = getSchoolGroup;