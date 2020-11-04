const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const PersonalEventModel = require('../../../../models/planner/personalEventsModel');



const PersonalEvent = (req, res) => {

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

                                          console.log(err);

                                          res.status(200).json({
                                                "statusCode": "0",
                                                "message": "Access Denied..!!"
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
                              statusCode: "0",
                              message: "Access Denied..!!"
                        });
                  }
            })

      } else {
            return res.status(200).json({
                  "statusCode": "0",
                  "message": "All fields are mandatory..!!"
            });
      }
}


module.exports = PersonalEvent;