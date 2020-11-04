const GradesModel = require('../../../../../models/admin/master/academic/gradesModel');




module.exports = (req, res, next) => {

       if (req.params.gradeId) {
              let _gradeId = req.params.gradeId;

              GradesModel.find({
                            _id: _gradeId,
                            isActive: true
                     }) //check wheather School Id Exists
                     .exec()
                     .then(chapterData => {

                            if (chapterData.length >= 1) {

                                   GradesModel.updateOne({
                                                 _id: _gradeId
                                          }, {
                                                 $set: {
                                                        isActive: false
                                                 }
                                          }) //check wheather School Id Exists
                                          .exec()
                                          .then(success => {

                                                 if (success.ok == 1) {
                                                        return res.status(200).json({
                                                               statusCode: "1",
                                                               message: "Grade has been deleted successfully..!!"
                                                        });
                                                 } else {
                                                        return res.status(200).json({
                                                               statusCode: "0",
                                                               message: "Something went wrong. Please try again..!!"
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
                                   return res.status(403).json({
                                          statusCode: "0",
                                          message: "Access Denied..!"
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