const UserModel = require('../../models/authentication/userModel');
const NotesModel = require('../../models/notes/notesModel');


const GetNoteList = (req, res) => {

      if (req.params.userId) {

            let userId = req.params.userId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered) { // && userRegistered.isConfirmed == true && userRegistered.status == true

                              NotesModel.find({
                                          userId,
                                          isActive: true
                                    })
                                    .sort({
                                          lastSavedDate: -1
                                    })
                                    .exec()
                                    .then(NoteList => {

                                          console.log(NoteList);

                                          if (NoteList.length > 0) {

                                                let NoteListData = NoteList.map(note => {

                                                      let splitedDate = note.date.toString().split(' ');
                                                      let splitTimestamp = splitedDate[4].split(':')

                                                      //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                                      let remId = String(parseInt(note.date.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))

                                                      return {
                                                            _id: note._id,

                                                            title: note.title,

                                                            content: note.content ? note.content : "",

                                                            color: note.color,

                                                            reminderDate: note.reminderDate ? note.reminderDate : "",

                                                            lastSavedDate: note.lastSavedDate ? note.lastSavedDate : "",

                                                            noteUrls: note.noteUrls ? note.noteUrls : [],

                                                            reminderId: remId
                                                      }
                                                })

                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      noteList: NoteListData,
                                                      message: "Successful..!!"
                                                });

                                          } else {

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      noteList: [],
                                                      message: "No Notes..!!"
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

module.exports = GetNoteList