const verifyTeacher = require('../../../../middleware/verifyTeacher');

const ExerciseModel = require('../../../../models/admin/learn/academic/exercise/exerciseModel')


module.exports = (req, res, next) => {

       try {

              if (req.params.teacherId && req.params.chapterId) //&& req.body.date
              {

                     let teacherId = req.params.teacherId; //
                     let chapterId = req.params.chapterId; //Old HomeWorkId for check its not out of date

                     verifyTeacher(teacherId, "", (error, response) => {

                            if (response && response.statusCode != "0") {

                                   ExerciseModel.find({
                                          chapterId,
                                          isActive: true
                                   }, {
                                          exerciseName: 1
                                   })
                                          .exec()
                                          .then(exerciseList => {

                                                 if (exerciseList.length > 0) {

                                                        res.status(200).json({
                                                               statusCode: "1",
                                                               exerciseList,
                                                               message: "Data Found..!!"
                                                        });

                                                 } else {
                                                        res.status(200).json({
                                                               statusCode: "0",
                                                               exerciseList : [],
                                                               message: "No Records Found..!!"
                                                        });
                                                 }

                                          })
                                          .catch(err => {
                                                 console.log(err)
                                                 res.status(200).json({
                                                        statusCode: "0",
                                                        message: "Something went wrong. Please Try Later..!!"
                                                 });
                                          })


                            } else {
                                   res.status(200).json({
                                          statusCode: "0",
                                          message: error.message
                                   })
                            }
                     })

              } else {
                     res.status(200).json({
                            statusCode: "0",
                            message: "All fields are mandatory..!!"
                     });
              }

       } catch (error) {

              console.log(error)
              res.status(200).json({
                     statusCode: "0",
                     message: "Something went wrong. Please Try Later..!!"
              });

       }


}
