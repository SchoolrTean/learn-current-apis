const mongoose = require('mongoose');

const SubjectModel = require('../../../../../models/admin/master/academic/subjectsModel');




exports.saveSubject = (req, res, next) => {

       if (req.body.subjectName) {

              let _subjectName = req.body.subjectName;

              SubjectModel.findOne({
                            searchableSubjectName: _subjectName.toLowerCase(),
                            isActive: true
                     }).exec()
                     .then(subjectExists => {

                            if (!subjectExists) {

                                   const subjects = new SubjectModel({
                                          _id: new mongoose.Types.ObjectId(),
                                          subjectName: _subjectName,
                                          searchableSubjectName: _subjectName.toLowerCase()
                                   });

                                   subjects.save()
                                          .then(subjectsData => {

                                                 // console.log(subjectsData);

                                                 res.status(200).json({
                                                        statusCode: "1",
                                                        subjectId: subjectsData._id,
                                                        message: "Subject Saved Successfully...!!"
                                                 });

                                          })
                                          .catch(err => {

                                                 console.log(err);

                                                 res.status(200).json({
                                                        statusCode: "0",
                                                        message: "Something went wrong. Please try again...!!"
                                                 })
                                          });

                            } else {

                                   res.status(200).json({
                                          statusCode: "0",
                                          message: "Subject Name Already Exists...!!"
                                   })

                            }

                     })
                     .catch(err => {

                            console.log(err);

                            res.status(200).json({
                                   statusCode: "0",
                                   message: "Something went wrong. Please try again..!!"
                            })
                     })


       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }

}



exports.getSubjects = (req, res, next) => {

       SubjectModel.find({
                     isActive: true
              }, {
                     subjectName: 1
              })
              .sort({
                     subjectName: 1
              })
              .exec()
              .then(subjectData => {

                     if (subjectData.length > 0) {

                            res.status(200).json({
                                   statusCode: "1",
                                   subjectList: subjectData,
                                   message: "Data Found"
                            });

                     } else {

                            res.status(200).json({
                                   statusCode: "1",
                                   subjectList: [],
                                   message: "No Records Found..!"
                            });

                     }
              })
              .catch(err => {

                     console.log(err);

                     return res.status(200).json({
                            statusCode: "0",
                            message: "Something Went Wrong...!!"
                     });
              })

}



exports.updateSubject = (req, res, next) => {

       if (req.body.subjectName && req.params.subjectId) {

              let _subjectName = req.body.subjectName;
              let _subjectId = req.params.subjectId;

              SubjectModel.findOne({
                            searchableSubjectName: _subjectName.toLowerCase(),
                            isActive: true
                     }).exec()
                     .then(subjectExists => {

                            if (!subjectExists) {

                                   SubjectModel.updateOne({
                                                 _id: _subjectId,
                                                 isActive: true
                                          }, {
                                                 $set: {
                                                        subjectName: _subjectName,
                                                        searchableSubjectName: _subjectName.toLowerCase()
                                                 }
                                          })
                                          .exec()
                                          .then(Updated => {

                                                 if (Updated.nModified == 1) {

                                                        return res.status(200).json({
                                                               statusCode: "1",
                                                               message: "Subject Updated Successfully...!!"
                                                        });

                                                 }

                                          })
                                          .catch(err => {
                                                 console.log(err);
                                                 return res.status(200).json({
                                                        statusCode: "0",
                                                        message: "Something went wrong. Please try again..!!"
                                                 })
                                          });

                            } else {

                                   res.status(200).json({
                                          statusCode: "0",
                                          message: "Subject Name Already Exists...!!"
                                   })

                            }

                     })
                     .catch(err => {

                            console.log(err);

                            res.status(200).json({
                                   statusCode: "0",
                                   message: "Something went wrong. Please try again..!!"
                            })
                     })

       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }

}