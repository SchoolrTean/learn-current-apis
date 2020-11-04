const UserModel = require('../../models/authentication/userModel');
const NotesModel = require('../../models/notes/notesModel');


const GetNote = (req, res) => {

      if (req.params.userId && req.params.noteId) {

            let userId = req.params.userId;
            let noteId = req.params.noteId;

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
                              })
                                    .sort({
                                          lastSavedDate: -1
                                    })
                                    .exec()
                                    .then(NoteData => {

                                          console.log(NoteData);

                                          if (NoteData) {

                                                let splitedDate = NoteData.date.toString().split(' ');
                                                let splitTimestamp = splitedDate[4].split(':')

                                                //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                                let remId = String(parseInt(NoteData.date.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))

                                                return res.status(200).json({
                                                      statusCode: "1",

                                                      _id: NoteData._id,

                                                      title: NoteData.title,

                                                      content: NoteData.content ? NoteData.content : "",

                                                      color: NoteData.color,

                                                      reminderDate: NoteData.reminderDate ? NoteData.reminderDate : "",

                                                      lastSavedDate: NoteData.lastSavedDate ? NoteData.lastSavedDate : "",

                                                      noteUrls: NoteData.noteUrls ? NoteData.noteUrls : [],

                                                      reminderId: remId,

                                                      message: "Successful..!!"
                                                });

                                          } else {

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Records Found..!!"
                                                });
                                          }
                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          });

                                    });


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

module.exports = GetNote