const GradesModel = require('../../../../../models/admin/master/academic/gradesModel');




module.exports = (req, res, next) => {

       if (req.params.gradeId) {

              let _gradeId = req.params.gradeId;

              GradesModel.findOne({
                            _id: _gradeId,
                            isActive: true
                     }, {
                            grade: 1
                     }) //check wheather mobile no is verified or not
                     .exec()
                     .then(gradeData => {

                            if (gradeData) {
                                   return res.status(200).json({
                                          statusCode: "1",
                                          gradeDetails: [gradeData],
                                          message: "Data Found"
                                   });
                            } else {
                                   return res.status(200).json({
                                          statusCode: "1",
                                          gradeDetails: [],
                                          message: "No Results Found"
                                   });
                            }
                     })
                     .catch(err => {
                            return res.status(200).json({
                                   statusCode: "0",
                                   message: "Something went wrong. Please try again..!!"
                            })
                     });
       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }
}