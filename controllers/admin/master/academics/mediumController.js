const mongoose = require('mongoose');

const MediumModel = require('../../../../models/admin/master/academic/mediumModel');

exports.insertMedium = (req, res, next) => {

      if (req.body.medium) {

            let medium = req.body.medium;

            MediumModel.findOne({
                        searchMedium: medium.toLowerCase(),
                        isActive: true
                  }).exec()
                  .then(gradeFound => {

                        if (!gradeFound) {

                              const mediumData = new MediumModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    medium,
                                    searchMedium: medium.toLowerCase()
                              });

                              mediumData.save()
                                    .then(result => {
                                          return res.status(200).json({
                                                statusCode: "1",
                                                message: "Medium Added Successfully..!"
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


exports.getMediumList = (req, res, next) => {

      MediumModel.find({
                  isActive: true
            }, {
                  medium: 1
            })
            .sort({
                  _id: 1
            })
            .exec()
            .then(mediumList => {

                  if (mediumList.length >= 1) {
                        res.status(200).json({
                              statusCode: "1",
                              mediumList,
                              message: "Data Found..!!"
                        });
                  } else {
                        res.status(200).json({
                              statusCode: "1",
                              mediumList: [],
                              message: "No Data Found..!!"
                        });
                  }
            })
            .catch(err => {
                  res.status(200).json({
                        statusCode: "0",
                        message: "Something went wrong. Please try later..!!"
                  });
            });
}


exports.getMedium = (req, res, next) => {

      if (req.params.mediumId) {

            let mediumId = req.params.mediumId;

            MediumModel.findOne({
                        _id: mediumId,
                        isActive: true
                  }, {
                        medium: 1
                  }) //check wheather mobile no is verified or not
                  .exec()
                  .then(mediumData => {

                        if (mediumData) {

                              return res.status(200).json({
                                    statusCode: "1",
                                    mediumDetails: [mediumData],
                                    message: "Data Found"
                              });

                        } else {

                              return res.status(200).json({
                                    statusCode: "1",
                                    mediumDetails: [],
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


exports.updateMedium = (req, res, next) => {

      if (req.params.mediumId && req.body.medium) {

            let mediumId = req.params.mediumId;
            let medium = req.body.medium;

            MediumModel.findOne({
                        _id: mediumId,
                        isActive: true
                  }, {
                        medium: 1
                  }) //check wheather School Id Exists
                  .exec()
                  .then(mediumDetails => {

                        if (mediumDetails) {

                              MediumModel.findOne({
                                          searchMedium: medium.toLowerCase(),
                                          isActive: true
                                    }).exec()
                                    .then(gradeFound => {

                                          if (!gradeFound) {

                                                MediumModel.updateOne({
                                                            _id: mediumId
                                                      }, {
                                                            $set: {
                                                                  medium,
                                                                  searchMedium: medium.toLowerCase()
                                                            }
                                                      }, {
                                                            medium: 1
                                                      }) //check wheather School Id Exists
                                                      .exec()
                                                      .then(success => {

                                                            if (success.ok == 1) {
                                                                  return res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "Medium updated successfully..!!"
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
                                                      message: "Already Exists..!!"
                                                })
                                                
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


exports.deleteMedium = (req, res, next) => {

      if (req.params.mediumId) {
            let mediumId = req.params.mediumId;

            MediumModel.findOne({
                        _id: mediumId,
                        isActive: true
                  }) //check wheather School Id Exists
                  .exec()
                  .then(mediumDetails => {

                        if (mediumDetails) {

                              MediumModel.updateOne({
                                          _id: mediumId
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
                                                      message: "Medium has been deleted successfully..!!"
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