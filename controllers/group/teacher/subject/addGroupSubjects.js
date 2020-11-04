const mongoose = require('mongoose');

const ClassModel = require('../../../../models/classes/classModel');
const ClassTeacherConnectionModel = require('../../../../models/classes/classTeacherConnectionModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');


const addSubjects = (req, res, next) => {

      if (req.body.teacherId && req.body.groupId && req.body.subjectNames) {

            let teacherId = req.body.teacherId;
            let groupId = req.body.groupId;
            let subjectNames = req.body.subjectNames;

            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        let selectedSubjectsArray = subjectNames.replace(/\s/g, '').toLowerCase().split(','); //

                        let formattedSubjectsArray = selectedSubjectsArray.filter(function (el) {
                              return el != "";
                        });


                        ClassModel.updateOne({
                              _id: groupId,
                              isActive: true
                        }, {
                              $set: {
                                    subjects: []
                              }
                        }).then(updated => {

                              console.log(updated);

                              if (updated.ok == 1) {

                                    ClassModel.updateOne({
                                          _id: groupId,
                                          isActive: true
                                    }, {
                                          $set: {
                                                subjects: formattedSubjectsArray
                                          }
                                    }).then(updated => {

                                          console.log(updated);

                                          if (updated.ok == 1) {

                                                ClassTeacherConnectionModel.updateOne({
                                                      classId: groupId,
                                                      teacherId,
                                                      isActive: true
                                                }, {
                                                      $set: {
                                                            subjects: formattedSubjectsArray
                                                      }
                                                }).then(updated => {



                                                      console.log(updated);

                                                      if (updated.ok == 1) {

                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  message: "Subjects Saved Successfully..!!"
                                                            });

                                                      } else {

                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong. Plz try later..!!"
                                                            });

                                                      }

                                                }).catch(err => {
                                                      console.log(err);
                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Something Went Wrong. Plz try later..!!"
                                                      });
                                                })

                                          } else {

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Plz try later..!!"
                                                });

                                          }

                                    }).catch(err => {
                                          console.log(err);
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Plz try later..!!"
                                          });
                                    })

                              } else {

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something Went Wrong. Plz try later..!!"
                                    });

                              }

                        }).catch(err => {
                              console.log(err);
                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something Went Wrong. Plz try later..!!"
                              });
                        })

                        // //Check For any new subject has been added
                        // SubjectModel.find({
                        //             searchableSubjectName: {
                        //                   $in: selectedSubjectsLowerCaseArray
                        //             },
                        //             $or: [{
                        //                   addedBy: true
                        //             }, {
                        //                   addedBy: false,
                        //                   addedByUserId: teacherId
                        //             }],
                        //             isActive: true

                        //       }).exec()
                        //       .then(async subjectsList => {

                        //             let finalSubjectList = subjectsList;
                        //             let newSubjects = [];

                        //             //New Subjects
                        //             if (subjectsList.length != selectedSubjectsArray.length) {

                        //                   for (let index = 0; index < selectedSubjectsLowerCaseArray.length; index++) {
                        //                         const selectedSubject = selectedSubjectsLowerCaseArray[index];

                        //                         let selected = 0;

                        //                         for (let index = 0; index < subjectsList.length; index++) {
                        //                               const subject = subjectsList[index];

                        //                               if (subject.searchableSubjectName == selectedSubject) {
                        //                                     selected = 1;
                        //                               }

                        //                         }

                        //                         if (selected == 0) {
                        //                               newSubjects.push(selectedSubjectsArray[index])
                        //                         }

                        //                   }

                        //                   let subjetSavedData = [];

                        //                   for (let index = 0; index < newSubjects.length; index++) {

                        //                         let insertSubject = new SubjectModel({
                        //                               _id: new mongoose.Types.ObjectId(),
                        //                               subjectName: newSubjects[index],
                        //                               searchableSubjectName: newSubjects[index].toLowerCase(),
                        //                               addedBy: false,
                        //                               addedByUserId: teacherId,
                        //                         })

                        //                         subjetSavedData.push(insertSubject.save());

                        //                   }

                        //                   await Promise.all(subjetSavedData).then(result => {

                        //                               result.forEach(subjectSaved => {
                        //                                     finalSubjectList.push(subjectSaved)
                        //                               });

                        //                         })
                        //                         .catch(err => {
                        //                               console.log(err);

                        //                               res.status(200).json({
                        //                                     statusCode: "0",
                        //                                     message: "Something Went Wrong. Plz try later..!!"
                        //                               });
                        //                         })
                        //             }


                        //             TeacherGroupSubjectModel.updateMany({
                        //                   groupId,
                        //                   isActive: true
                        //             }, {
                        //                   $set: {
                        //                         isActive: false
                        //                   }
                        //             }).then(updated => {

                        //                   console.log(updated);

                        //                   if (updated.ok == 1) {

                        //                         let finalSubjectsListSaved = [];

                        //                         for (let index = 0; index < finalSubjectList.length; index++) {
                        //                               const subject = finalSubjectList[index];

                        //                               let insertGroupSubject = new TeacherGroupSubjectModel({
                        //                                     _id: new mongoose.Types.ObjectId(),
                        //                                     groupId,
                        //                                     subjectId: subject._id,
                        //                                     subjectName: subject.subjectName,

                        //                               })

                        //                               finalSubjectsListSaved.push(insertGroupSubject.save());

                        //                         }

                        //                         Promise.all(finalSubjectsListSaved).then(result => {

                        //                               res.status(200).json({
                        //                                     statusCode: "1",
                        //                                     message: "Subjects Saved Successfully..!!"
                        //                               });


                        //                         }).catch(err => {

                        //                               console.log(err);

                        //                               res.status(200).json({
                        //                                     statusCode: "0",
                        //                                     message: "Something Went Wrong. Plz try later..!!"
                        //                               });
                        //                         })

                        //                   } else {

                        //                         res.status(200).json({
                        //                               statusCode: "0",
                        //                               message: "Something Went Wrong. Plz try later..!!"
                        //                         });

                        //                   }

                        //             }).catch(err => {
                        //                   console.log(err);
                        //                   res.status(200).json({
                        //                         statusCode: "0",
                        //                         message: "Something Went Wrong. Plz try later..!!"
                        //                   });
                        //             })

                        //       })
                        // .catch(err => {

                        //       console.log(err);

                        //       res.status(200).json({
                        //             statusCode: "0",
                        //             message: "Something Went Wrong. Plz try later..!!"
                        //       });

                        // })

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

module.exports = addSubjects;