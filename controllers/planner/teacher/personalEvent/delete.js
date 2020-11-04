const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const PersonalEventModel = require('../../../../models/planner/personalEventsModel');



const PersonalEvent = (req, res, next) => {

      if (req.params.teacherId, req.params.eventId) {

            let teacherId = req.params.teacherId;
            let eventId = req.params.eventId;

            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        PersonalEventModel.findOne({
                                    _id: eventId,
                                    userId: teacherId,
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
                                                .then(updated => {

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

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}


module.exports = PersonalEvent;