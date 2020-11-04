const mongoose = require('mongoose');

const NoteImage = require('../../models/notes/noteImageModel');
const UserModel = require('../../models/authentication/userModel');

const SaveImage = (req, res) => {

      if (req.file && req.body.userId) {

            let userId = req.body.userId;

            let fileUrl = req.file.path.replace(/\\/g, '/');

            UserModel.findOne({
                  _id: userId,
                  isActive: true
            }).exec()
                  .then(userRegistered => {

                        if (userRegistered) { //&& userRegistered.isConfirmed == true && userRegistered.status == true

                              const NewImage = new NoteImage({
                                    _id: new mongoose.Types.ObjectId(),
                                    userId,
                                    noteUrl: fileUrl,
                              })

                              NewImage.save()
                                    .then(saved => {
                                          return res.status(200).json({
                                                statusCode: "1",
                                                link: fileUrl,
                                                message: "Data Found...!!"
                                          });
                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try later..!!"
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
                  message: "All fields are mandatory...!!"
            });
      }


}

module.exports = SaveImage