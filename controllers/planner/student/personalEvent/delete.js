const StudentModel = require('../../../../models/authentication/userModel');

const PersonalEventModel = require('../../../../models/planner/personalEventsModel');



const PersonalEvent = (req, res, next) => {

      if (req.params.studentId, req.params.eventId) {

            let studentId = req.params.studentId;
            let eventId = req.params.eventId;

            StudentModel.findOne({
                        _id: studentId,
                        type: true, //Student
                        isActive: true
                  })
                  .exec()
                  .then(studentDetails => {

                        console.log(studentDetails);

                        if (studentDetails) {

                              PersonalEventModel.findOne({
                                          _id: eventId,
                                          userId: studentId,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(record => {

                                          if (record) {

                                                PersonalEventModel.updateOne({
                                                            _id: eventId,
                                                            isActive: true
                                                      }, {
                                                            $set: {
                                                                  isActive: false
                                                            }
                                                      })
                                                      .exec()
                                                      .then(success => {
                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  message: "Personal event has been deleted..!!"
                                                            })
                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something Went Wrong..!!"
                                                            })
                                                      })
                                          } else {
                                                console.log(err);
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No record Found..!!"
                                                })
                                          }
                                    })
                                    .catch(err => {
                                          console.log(err);
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong..!!"
                                          })
                                    })



                        } else {
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: "Access Denied..!!"
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


module.exports = PersonalEvent;