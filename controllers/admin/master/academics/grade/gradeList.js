const GradesModel = require('../../../../../models/admin/master/academic/gradesModel');



module.exports = (req, res, next) => {

       GradesModel.find({
                     isActive: true
              }, {
                     grade: 1
              })
              .sort({
                     _id: 1
              })
              .exec()
              .then(gradeList => {

                     if (gradeList.length >= 1) {
                            res.status(200).json({
                                   statusCode: "1",
                                   gradeList: gradeList,
                                   message: "Data Found..!!"
                            });
                     } else {
                            res.status(200).json({
                                   statusCode: "1",
                                   gradeList: [],
                                   message: "No Data Found..!!"
                            });
                     }
              })
              .catch(err => {
                     res.status(200).json({
                            statusCode: "0",
                            message: "Something went wrong. Please try later..!!"
                     });
              });
}