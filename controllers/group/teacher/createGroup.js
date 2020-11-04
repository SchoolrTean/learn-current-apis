const mongoose = require('mongoose');
const randomize = require('randomatic');

const VerifyTeacher = require('../../../middleware/verifyTeacher');

const Grades = require('../../../models/admin/master/academic/gradesModel')

const ClassModel = require('../../../models/classes/classModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');

const create = (req, res, next) => {

      let groupPic = req.file ? req.file.path.replace(/\\/g, '/') : "";

      if (req.body.teacherId && (req.body.gradeId || req.body.groupName)) {

            let teacherId = req.body.teacherId;
            let gradeId = req.body.gradeId;
            let section = req.body.section;
            let groupName = req.body.groupName;


            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, "", async (error, response) => {

                  console.log(response);

                  if (response && response.statusCode != "0") {

                        Grades.findOne({
                              _id: gradeId,
                              isActive: true
                        }).then(gradeRecord => {

                              console.log(gradeRecord);

                              if (gradeRecord) {

                                    let Query = {
                                          createdBy: teacherId,
                                          isActive: true,
                                    }

                                    if (gradeId) {
                                          Query.gradeId = gradeId
                                    }

                                    if (section) {
                                          Query.section = section.toUpperCase()
                                          // Query.section = {
                                          //       $regex: section,
                                          //       $options: "i"
                                          // }
                                    }

                                    if (groupName) {
                                          Query.groupName = groupName
                                    }

                                    //check wheather teacher grades exists and isActive
                                    ClassModel.findOne(Query)
                                          .exec()
                                          .then(teacherGradesDetails => {

                                                if (teacherGradesDetails) {

                                                      return res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Already registered this Group Name...!!"
                                                      });

                                                } else {

                                                      const ClassCreated = new ClassModel({
                                                            _id: new mongoose.Types.ObjectId(),
                                                            grade: gradeRecord.grade,
                                                            gradeId,
                                                            section: section.toUpperCase(),
                                                            groupPic,
                                                            groupName,
                                                            groupLink: randomize('a0', 10),
                                                            createdBy: teacherId,
                                                            creator: teacherId,
                                                            coordinator :teacherId
                                                      });

                                                      ClassCreated.save()
                                                            .then(ClassSaved => {

                                                                  if (ClassSaved) {

                                                                        const AssignTeacherToClass = new ClassTeacherConnectionModel({
                                                                              _id: new mongoose.Types.ObjectId(),
                                                                              classId: ClassSaved._id,
                                                                              teacherId,
                                                                        });

                                                                        AssignTeacherToClass.save()
                                                                              .then(TeacherAssigned => {

                                                                                    return res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          groupId: ClassSaved._id,
                                                                                          message: ClassSaved.grade ? ClassSaved.section ? ClassSaved.grade + " - " + ClassSaved.section + " Created Successfully...!!" : ClassSaved.grade + " Created Successfully...!!" : ClassSaved.groupName + " Created Successfully...!!"
                                                                                    });

                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);
                                                                                    return res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "Something Went Wrong. Please try later..!!"
                                                                                    });
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
                                          })
                                          .catch(err => {
                                                console.log(err);
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Please try later..!!"
                                                });
                                          })

                              } else {

                                    return res.status(200).json({
                                          statusCode: "0",
                                          message: "Access Denied...!!!"
                                    });

                              }


                        }).catch(err => {
                              console.log(err);
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: "Something went wrong. Please try later...!!"
                              });
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

module.exports = create