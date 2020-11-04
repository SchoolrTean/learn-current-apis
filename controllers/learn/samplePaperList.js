const mongoose = require('mongoose');

const UserModel = require('../../models/user/authentication/userModel');
const SamplePaperModel = require('../../models/admin/learn/academic/samplePaperModel');

mongoose.set('debug', true);

const TestPapersList = (req, res) => {

      if (req.params.userId && req.params.subjectId) {

            let userId = req.params.userId;
            let subjectId = req.params.subjectId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              SamplePaperModel.find({
                                          syllabusId: userRegistered.syllabusId,
                                          mediumId: userRegistered.mediumId,
                                          gradeId: userRegistered.gradeId,
                                          subjectId,
                                          isActive: true,
                                    })
                                    .sort({
                                          date: -1
                                    })
                                    .exec()
                                    .then(SamplePaperList => {

                                          if (SamplePaperList.length > 0) {

                                                let SamplePaperDataList = SamplePaperList.map(samplePaper => {
                                                      return {
                                                            samplePaperId: samplePaper._id,
                                                            samplePaperUrls: samplePaper.samplePaperUrls
                                                      }
                                                })

                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      SamplePaperList: SamplePaperDataList,
                                                      message: "Data Found..!!"
                                                });

                                          } else {
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      SamplePaperList: [],
                                                      message: "No Record Found..!!"
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

module.exports = TestPapersList