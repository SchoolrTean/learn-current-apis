const mongoose = require('mongoose');

const GradesModel = require('../../../../../models/admin/master/academic/gradesModel');



module.exports = (req, res, next) => {

       if (req.body.grade) {
              let _grade = req.body.grade;

              GradesModel.findOne({
                            searchGrade: _grade.toLowerCase(),
                            isActive: true
                     }).exec()
                     .then(gradeFound => {

                            if (!gradeFound) {

                                   const gradeData = new GradesModel({
                                          _id: new mongoose.Types.ObjectId(),
                                          grade: _grade,
                                          searchGrade: _grade.toLowerCase()
                                   });

                                   gradeData.save()
                                          .then(result => {
                                                 return res.status(200).json({
                                                        statusCode: "1",
                                                        message: "Grade Added Successfully..!"
                                                 });
                                          })
                                          .catch(err => {
                                                 return res.status(200).json({
                                                        statusCode: "0",
                                                        message: "Something went wrong please try later..!!"
                                                 });
                                          })
                            } else {
                                   res.status(200).json({
                                          statusCode: "0",
                                          message: "Already Exists..!!"
                                   });
                            }

                     }).catch(err => {

                            console.log(err);

                            return res.status(200).json({
                                   statusCode: "0",
                                   message: "Something went wrong please try later..!!"
                            });
                     })

       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }
}