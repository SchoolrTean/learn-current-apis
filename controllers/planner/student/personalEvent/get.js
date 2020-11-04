const StudentModel = require('../../../../models/authentication/userModel');

const PersonalEventModel = require('../../../../models/planner/personalEventsModel');



const PersonalEvent = (req, res) => {

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

                        if (studentDetails) {

                              PersonalEventModel.findOne({
                                          _id: eventId,
                                          userId: studentId,
                                          isActive: true
                                    })
                                    .exec()
                                    .then(record => {

                                          if (record) {

                                                let remDate = record.date

                                                let splitedDate = remDate.toString().split(' ');
                                                let splitTimestamp = splitedDate[4].split(':');

                                                res.status(200).json({
                                                      "statusCode": "1",
                                                      "eventStartTimestamp": record.eventStartTimestamp ? record.eventStartTimestamp : "",
                                                      "eventEndTimestamp": record.eventEndTimestamp ? record.eventEndTimestamp : "",
                                                      "title": record.title ? record.title : "",
                                                      "body": record.body ? record.body : "",
                                                      "fileUrls": record.fileUrls ? record.fileUrls : [],
                                                      "reminder": record.reminder ? record.reminder : "",
                                                      "reminderId": String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2])),
                                                      "reminderNote": record.reminderNote ? record.reminderNote : "",
                                                      "message": "Data Found..!!"
                                                })

                                          } else {

                                                res.status(200).json({
                                                      "statusCode": "0",
                                                      "message": "No Record Found..!!"
                                                })
                                          }
                                    })
                                    .catch(err => {
                                          console.log(err);

                                          res.status(200).json({
                                                "statusCode": "0",
                                                "message": "Something Went Wrong..!!"
                                          })
                                    })

                        } else {
                              return res.status(200).json({
                                    "statusCode": "0",
                                    "message": "Access Denied..!!"
                              });
                        }
                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              "statusCode": "0",
                              "message": "Something went wrong. Please try again..!!"
                        })
                  });

      } else {
            return res.status(200).json({
                  "statusCode": "0",
                  "message": "All fields are mandatory..!!"
            });
      }
}


module.exports = PersonalEvent;