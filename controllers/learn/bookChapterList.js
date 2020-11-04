const UserModel = require('../../models/user/authentication/userModel');
const BookModel = require('../../models/admin/learn/academic/bookModel');
const ChapterModel = require('../../models/admin/learn/academic/chaptersModel');

const ChapterCompletedPercentage = require('./academic/completedStatusCalculation/chapter')


const SubjectBookChapterList = (req, res) => {

      if (req.params.userId && req.params.bookId) {

            let userId = req.params.userId;
            let bookId = req.params.bookId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              BookModel.findOne({
                                          _id: bookId,
                                          isActive: true,
                                    })
                                    .exec()
                                    .then(book => {

                                          if (book) {

                                                ChapterModel.find({
                                                            bookId,
                                                            isActive: true
                                                      })
                                                      .exec()
                                                      .then(async chapterList => {

                                                            if (chapterList.length > 0) {

                                                                  let chapterData = [];

                                                                  for (let index = 0; index < chapterList.length; index++) {
                                                                        const chapter = chapterList[index];

                                                                        chapterData.push({
                                                                              chapterId: chapter._id,
                                                                              chapterName: chapter.chapterName,
                                                                              chapterCompletedStatus: String(await ChapterCompletedPercentage(userId, chapter._id)),
                                                                        })

                                                                  }


                                                                  return res.status(200).json({
                                                                        statusCode: "1",
                                                                        chapterListData: chapterData,
                                                                        message: "Data Found..!!"
                                                                  });

                                                            } else {
                                                                  return res.status(200).json({
                                                                        statusCode: "0",
                                                                        chapterListData: [],
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
                                                      message: "Something went wrong. Please try again..!!"
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

module.exports = SubjectBookChapterList