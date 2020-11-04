const UserModel = require('../../models/authentication/userModel');
const NotesModel = require('../../models/notes/notesModel');


const DeleteNote = (req, res) => {

      if (req.params.userId && req.params.noteId) {

            let userId = req.params.userId;
            let noteId = req.params.noteId


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
                                                            isActive: false
                                                      }
                                                }).exec()
                                                      .then(NoteData => {

                                                            if (NoteData) {
                                                                  return res.status(200).json({
                                                                        statusCode: "1",
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

module.exports = DeleteNote