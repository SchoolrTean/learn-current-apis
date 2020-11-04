const DateDiff = require('date-diff');

const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const PersonalEventModel = require('../../../../models/planner/personalEventsModel');



const personalEvent = (req, res) => {

      let fileUrls = req.files && req.files.length > 0 ? req.files.map(file => file.path.replace(/\\/g, '/')) : []

      if (req.body.teacherId && req.body.eventTitle && req.body.eventStartTimestamp && req.body.eventEndTimestamp && req.body.eventBody) {

            let teacherId = req.body.teacherId;
            let eventStartTimestamp = req.body.eventStartTimestamp;
            let eventEndTimestamp = req.body.eventEndTimestamp;
            let eventTitle = req.body.eventTitle;
            let eventBody = req.body.eventBody;
            let reminderTimeStamp = req.body.reminderTimeStamp
            let reminderNote = req.body.reminderNote

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

                        if ((eventEndDateDiffInMinutes < eventStartDateDiffInMinutes && eventStartDateDiffInMinutes < 0) && (reminderTimeStamp == "" || reminderDiffInMinutes < 0)) {


                              const personalEvent = new PersonalEventModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    userId: teacherId,
                                    eventStartTimestamp: formattedEventStart,
                                    eventEndTimestamp: formattedEventEnd,
                                    title: eventTitle,
                                    body: eventBody,
                                    fileUrls,
                                    reminder: formattedReminder,
                                    reminderNote: reminderNote
                              })

                              personalEvent.save()
                                    .then(personalEventSaved => {
                                          
                                          //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                          let remDate = personalEventSaved.date

                                          let splitedDate = remDate.toString().split(' ');
                                          let splitTimestamp = splitedDate[4].split(':');


                                          res.status(200).json({
                                                statusCode: "1",
                                                eventId: personalEventSaved._id,
                                                groupId: "",
                                                groupName: "",
                                                subject: "",
                                                eventType: "PE",
                                                eventTitle: personalEventSaved.title,
                                                eventbody: personalEventSaved.body,
                                                fileUrls : personalEventSaved.fileUrls,
                                                eventStartTimestamp: personalEventSaved.eventStartTimestamp,
                                                eventEndTimestamp: personalEventSaved.eventEndTimestamp,
                                                reminderDate: personalEventSaved.reminder ? personalEventSaved.reminder : "",
                                                reminderNote: personalEventSaved.reminderNote ? personalEventSaved.reminderNote : "",
                                                reminderId: String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2])),
                                                completedStatus: false,
                                                cancelStatus: false,
                                                type: "MSG",
                                                message: "Personal Event Saved Successfully..!!"
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
                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Cannot set event for Past Date & Time..!!"
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


module.exports = personalEvent