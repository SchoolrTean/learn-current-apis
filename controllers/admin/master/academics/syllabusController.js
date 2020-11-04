const mongoose = require('mongoose');

const SyllabusModel = require('../../../../models/admin/master/academic/syllabusModel');



exports.saveSyllabus = (req, res, next) => {

      if (req.body.syllabus) {

            let syllabus = req.body.syllabus;

            SyllabusModel.findOne({
                        searchSyllabus: syllabus.toLowerCase(),
                        isActive: true
                  }).exec()
                  .then(gradeFound => {

                        if (!gradeFound) {

                              const syllabusData = new SyllabusModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    syllabus,
                                    searchSyllabus: syllabus.toLowerCase()
                              });

                              syllabusData.save()
                                    .then(result => {
                                          return res.status(200).json({
                                                statusCode: "1",
                                                message: "Syllabus Added Successfully..!"
                                          });
                                    })
                                    .catch(err => {
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong please try later..!!"
                                          });
                                    })
                        } else {
                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Already Exists..!!"
                              });
                        }

                  }).catch(err => {

                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong please try later..!!"
                        });
                  })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}



exports.getSyllabusList = (req, res, next) => {

      SyllabusModel.find({
                  isActive: true
            }, {
                  syllabus: 1
            })
            .sort({
                  syllabus: 1
            })
            .exec()
            .then(syllabusList => {

                  if (syllabusList.length >= 1) {
                        res.status(200).json({
                              statusCode: "1",
                              syllabusList,
                              message: "Data Found..!!"
                        });
                  } else {
                        res.status(200).json({
                              statusCode: "1",
                              syllabusList: [],
                              message: "No Data Found..!!"
                        });
                  }
            })
            .catch(err => {
                  console.log(err);
                  res.status(200).json({
                        statusCode: "0",
                        message: "Something went wrong. Please try later..!!"
                  });
            });
}



exports.getSyllabus = (req, res, next) => {

      if (req.params.syllabusId) {

            let syllabusId = req.params.syllabusId;

            SyllabusModel.findOne({
                        _id: syllabusId,
                        isActive: true
                  }, {
                        syllabus: 1
                  }) //check wheather mobile no is verified or not
                  .exec()
                  .then(syllabusData => {

                        if (syllabusData) {

                              return res.status(200).json({
                                    statusCode: "1",
                                    syllabusData: [syllabusData],
                                    message: "Data Found"
                              });

                        } else {

                              return res.status(200).json({
                                    statusCode: "1",
                                    syllabusData: [],
                                    message: "No Results Found"
                              });

                        }
                  })
                  .catch(err => {
                        console.log(err);
                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try again..!!"
                        })
                  });
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}



exports.updateSyllabus = (req, res, next) => {

      if (req.params.syllabusId && req.body.syllabus) {

            let syllabusId = req.params.syllabusId;
            let syllabus = req.body.syllabus;

            SyllabusModel.findOne({
                        _id: syllabusId,
                        isActive: true
                  }, {
                        syllabus: 1
                  }) //check wheather School Id Exists
                  .exec()
                  .then(syllabusData => {

                        if (syllabusData) {

                              SyllabusModel.findOne({
                                          searchSyllabus: syllabus.toLowerCase(),
                                          isActive: true
                                    }).exec()
                                    .then(gradeFound => {

                                          if (!gradeFound) {

                                                SyllabusModel.updateOne({
                                                            _id: syllabusId
                                                      }, {
                                                            $set: {
                                                                  syllabus,
                                                                  searchSyllabus: syllabus.toLowerCase()
                                                            }
                                                      }, {
                                                            syllabus: 1
                                                      }) //check wheather School Id Exists
                                                      .exec()
                                                      .then(success => {

                                                            if (success.ok == 1) {
                                                                  return res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "syllabus updated successfully..!!"
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
                                                            })
                                                      });

                                          } else {
                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Already Exists..!!"
                                                });
                                          }

                                    }).catch(err => {

                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong please try later..!!"
                                          });
                                    })

                        } else {
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: "Access Denied..!"
                              });
                        }
                  })
                  .catch(err => {
                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try again..!!"
                        })
                  });
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}



exports.deleteSyllabus = (req, res, next) => {

      if (req.params.syllabusId) {

            let syllabusId = req.params.syllabusId;

            SyllabusModel.findOne({
                        _id: syllabusId,
                        isActive: true
                  }) //check wheather School Id Exists
                  .exec()
                  .then(syllabusData => {

                        if (syllabusData) {

                              SyllabusModel.updateOne({
                                          _id: syllabusId
                                    }, {
                                          $set: {
                                                isActive: false
                                          }
                                    }) //check wheather School Id Exists
                                    .exec()
                                    .then(success => {

                                          if (success.ok == 1) {
                                                return res.status(200).json({
                                                      statusCode: "1",
                                                      message: "syllabus has been deleted successfully..!!"
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
                                          })
                                    });

                        } else {
                              return res.status(200).json({
                                    statusCode: "0",
                                    message: "Access Denied..!"
                              });
                        }
                  })
                  .catch(err => {
                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try again..!!"
                        })
                  });
      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}