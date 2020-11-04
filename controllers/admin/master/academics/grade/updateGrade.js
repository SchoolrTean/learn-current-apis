const GradesModel = require('../../../../../models/admin/master/academic/gradesModel');



module.exports = (req, res) => {

       if (req.body.grade && req.params.gradeId) {
              let _gradeId = req.params.gradeId;
              let _grade = req.body.grade;

              GradesModel.findOne({
                            _id: _gradeId,
                            isActive: true
                     }, {
                            grade: 1
                     }) //check wheather School Id Exists
                     .exec()
                     .then(gradeData => {

                            if (gradeData) {

                                   GradesModel.findOne({
                                                 searchGrade: _grade.toLowerCase(),
                                                 isActive: true
                                          }, {
                                                 grade: 1
                                          }) //check wheather School Id Exists
                                          .exec()
                                          .then(gradeData => {

                                                 if (!gradeData) {

                                                        GradesModel.updateOne({
                                                                      _id: _gradeId
                                                               }, {
                                                                      $set: {
                                                                             grade: _grade
                                                                      }
                                                               }, {
                                                                      grade: 1
                                                               }) //check wheather School Id Exists
                                                               .exec()
                                                               .then(success => {

                                                                      if (success.ok == 1) {
                                                                             return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    message: "Grade updated successfully..!!"
                                                                             });
                                                                      } else {
                                                                             return res.status(403).json({
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
                                                        res.status(200).json({
                                                               statusCode: "0",
                                                               message: "Already Exists..!!"
                                                        })
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