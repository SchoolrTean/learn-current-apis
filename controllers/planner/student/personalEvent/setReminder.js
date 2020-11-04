const DateDiff = require('date-diff');

const StudentModel = require('../../../../models/authentication/userModel');

const PersonalEventModel = require('../../../../models/planner/personalEventsModel');


const PersonalEvent = (req, res, next) => {

      if (req.params.studentId, req.params.eventId, req.body.reminderDateAndTime, req.body.reminderNote) {

            let studentId = req.params.studentId;
            let eventId = req.params.eventId;
            let reminder = req.body.reminderDateAndTime;
            let reminderNote = req.body.reminderNote;

            let today = new Date();

            //today.setMinutes(today.getMinutes() + 330);

            let diff = new DateDiff(today, new Date(reminder));
            let minutesDiff = Math.floor(diff.minutes());

            if (minutesDiff <= 0) {

                  StudentModel.findOne({
                              _id: studentId,
                              isActive: true
                        })
                        .exec()
                        .then(studentDetails => {

                              console.log(studentDetails);

                              if (studentDetails) {

                                    StudentModel.find({
                                                loginId: studentDetails.loginId,
                                                isActive: true
                                          })
                                          .exec()
                                          .then(studentsDetails => {

                                                if (studentsDetails.length > 0) {

                                                      let studentArray = new Array();

                                                      for (let index = 0; index < studentsDetails.length; index++) {
                                                            studentArray.push(studentsDetails[index]._id);

                                                      }

                                                      PersonalEventModel.findOne({
                                                                  _id: eventId,
                                                                  userId: {
                                                                        $in: studentArray
                                                                  },
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
                                                                                          reminder: reminder,
                                                                                          reminderNote: reminderNote
                                                                                    }
                                                                              })
                                                                              .exec()
                                                                              .then(success => {
                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          message: "Reminder set successfully..!!"
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
                                                console.log(err);

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something went wrong. Please try again..!!"
                                                })
                                          });

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
                  res.status(200).json({
                        statusCode: "0",
                        message: "Cannot set event for Past days...!!"
                  });
            }

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = PersonalEvent;