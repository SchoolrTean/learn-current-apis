const DateDiff = require('date-diff');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const PersonalEventModel = require('../../../../models/planner/personalEventsModel');



const PersonalEvent = (req, res) => {

      let fileUrls = req.files && req.files.length > 0 ? req.files.map(file => file.path.replace(/\\/g, '/')) : []

      if (req.params.teacherId && req.params.eventId && req.body.eventTitle && req.body.eventStartTimestamp && req.body.eventEndTimestamp && req.body.eventBody) {

            let teacherId = req.params.teacherId;
            let eventId = req.params.eventId;
            let eventStartTimestamp = req.body.eventStartTimestamp;
            let eventEndTimestamp = req.body.eventEndTimestamp;
            let eventTitle = req.body.eventTitle;
            let eventBody = req.body.eventBody;
            let reminderTimeStamp = req.body.reminderTimeStamp
            let reminderNote = req.body.reminderNote
            fileUrls = req.body.previousUrl ? req.body.previousUrl.split(',') : fileUrls


            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {


                        let today = new Date();

                        today.setMinutes(today.getMinutes() + 330);

                        let formattedEventStart = new Date(new Date(eventStartTimestamp).setMinutes(new Date(eventStartTimestamp).getMinutes() + 330));

                        let eventStartDateDiff = new DateDiff(today, formattedEventStart);

                        let eventStartDateDiffInMinutes = Math.floor(eventStartDateDiff.minutes());



                        let formattedEventEnd = new Date(new Date(eventEndTimestamp).setMinutes(new Date(eventEndTimestamp).getMinutes() + 330));

                        let eventEndDateDiff = new DateDiff(today, formattedEventEnd);

                        let eventEndDateDiffInMinutes = Math.floor(eventEndDateDiff.minutes());




                        let reminderDiffInMinutes = "";

                        let formattedReminder = "";

                        if (reminderTimeStamp) {

                              formattedReminder = new Date(new Date(reminderTimeStamp).setMinutes(new Date(reminderTimeStamp).getMinutes() + 330));

                              let reminderDiff = new DateDiff(today, formattedReminder);

                              reminderDiffInMinutes = Math.floor(reminderDiff.minutes());

                        }

                        console.log(reminderDiffInMinutes);

                        console.log(eventStartDateDiffInMinutes);

                        console.log(eventEndDateDiffInMinutes);

                        console.log(reminderTimeStamp + "reminderTimeStamp");


                        if ((eventEndDateDiffInMinutes < eventStartDateDiffInMinutes && eventStartDateDiffInMinutes < 0) && (!reminderTimeStamp || reminderDiffInMinutes < 0)) {

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
                                                            title: eventTitle,
                                                            body: eventBody,
                                                            fileUrls,
                                                            eventStartTimestamp: formattedEventStart,
                                                            eventEndTimestamp: formattedEventEnd,
                                                            reminder: formattedReminder,
                                                            reminderNote: reminderNote
                                                      }
                                                })
                                                      .exec()
                                                      .then(success => {

                                                            if (success.ok) {

                                                                  let remDate = record.date

                                                                  let splitedDate = remDate.toString().split(' ');
                                                                  let splitTimestamp = splitedDate[4].split(':');

                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        eventId: eventId,
                                                                        groupId: "",
                                                                        groupName: "",
                                                                        subject: "",
                                                                        eventType: "PE",
                                                                        eventTitle: eventTitle,
                                                                        eventbody: eventBody ,
                                                                        fileUrls: fileUrls,
                                                                        eventStartTimestamp: formattedEventStart ,
                                                                        eventEndTimestamp: formattedEventEnd,
                                                                        reminderDate: formattedReminder ? formattedReminder : "",
                                                                        reminderNote: reminderNote ? reminderNote : "",
                                                                        reminderId: String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2])),
                                                                        completedStatus: false,
                                                                        cancelStatus: false,
                                                                        type: "MSG",
                                                                        // reminderId: String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2])),
                                                                        message: "Personal event has been updated..!!"
                                                                  })
                                                            } else {
                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something went wrong..!!"
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
                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Cannot set event for Past days...!!"
                              });
                        }

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