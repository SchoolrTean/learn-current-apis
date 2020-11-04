const UserModel = require('../../models/authentication/userModel');
const NotesModel = require('../../models/notes/notesModel');


const UpdateNote = (req, res) => {

      let fileUrls = new Array();

      if (req.files) {
            let filesArray = req.files;

            filesArray.forEach(file => {
                  let correctPath = file.path.replace(/\\/g, '/');
                  fileUrls.push(correctPath);
            });
      }

      if (req.params.userId && req.params.noteId && req.body.title && req.body.content && req.body.color) {

            let userId = req.params.userId;
            let noteId = req.params.noteId
            let title = req.body.title;
            let content = req.body.content;
            let color = req.body.color;
            let reminderDate = req.body.reminderDate;

            let noteUrls = req.body.noteUrls;

            if (noteUrls) {
                  noteUrls.forEach(url => {
                        fileUrls.push(url)
                  });
            }


            UserModel.findOne({
                  _id: userId,
                  isActive: true
            }).exec()
                  .then(userRegistered => {

                        if (userRegistered) { //&& userRegistered.isConfirmed == true && userRegistered.status == true

                              NotesModel.findOne({
                                    _id: noteId,
                                    userId,
                                    isActive: true
                              }).exec()
                                    .then(NoteData => {

                                          if (NoteData) {

                                                NotesModel.updateOne({
                                                      _id: noteId,
                                                      userId,
                                                      isActive: true
                                                }, {
                                                      $set: {
                                                            title,
                                                            content,
                                                            color,
                                                            reminderDate: reminderDate ? new Date(new Date(reminderDate).setMinutes(new Date(reminderDate).getMinutes() + 330)) : "",
                                                            lastSavedDate: new Date(new Date().setMinutes(new Date().getMinutes() + 330)),
                                                            noteUrls: fileUrls
                                                      }
                                                }).exec()
                                                      .then(NoteDataUpdated => {

                                                            if (NoteDataUpdated.ok == 1) {

                                                                  console.log(NoteData);
                                                                  let splitedDate = NoteData.date.toString().split(' ');
                                                                  let splitTimestamp = splitedDate[4].split(':')

                                                                  //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                                                  let remId = String(parseInt(NoteData.date.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))


                                                                  return res.status(200).json({
                                                                        statusCode: "1",
                                                                        reminderId: remId,
                                                                        message: "Successful..!!"
                                                                  });
                                                            } else {
                                                                  return res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "No Record Found ..!!"
                                                                  });
                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);
                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!"
                                                            });

                                                      })

                                          } else {
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Record Found ..!!"
                                                });
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          });

                                    })

                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: !userRegistered ? "Access Denied..!!" : userRegistered && userRegistered.isConfirmed == false ? "Please Confirm your account..!!" : "Please Activate Your Account...!!"
                              });

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: err.name == "ValidationError" ? "Please fill all fields correctly..!!" : "Something went wrong. Please try again..!!"
                        });

                  });

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = UpdateNote