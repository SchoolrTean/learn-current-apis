const UserModel = require('../../../models/authentication/userModel');


const SchoolCoordinatorList = (req, res, next) => {

      console.log(req.params);

      try {
            if (req.params.schoolId) {

                  let schoolId = req.params.schoolId;

                  UserModel.findOne({
                              _id: schoolId,
                              type: 2, //school
                              isActive: true
                        })
                        .exec()
                        .then(schoolData => {

                              if (schoolData) {

                                    UserModel.find({
                                                schoolId,
                                                type: 3, //Coordinator
                                                isActive: true
                                          })
                                          .exec()
                                          .then(coordinatorList => {

                                                let coordinatorDataList = new Array();

                                                if (coordinatorList.length > 0) {

                                                      coordinatorList.forEach(coordinator => {

                                                            coordinatorDataList.push({
                                                                  _id: coordinator._id,
                                                                  firstName: coordinator.firstName,
                                                                  surName: coordinator.surName,
                                                                  emailId: coordinator.emailId,
                                                                  mobileNo: String(coordinator.mobileNo),
                                                                  profilePic: coordinator.profilePic ? coordinator.profilePic : "",
                                                                  invitationStatus: "1", //0-invitation link, 1-Connected
                                                            })

                                                      });


                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            coordinatorDataList,
                                                            message: 'Data Found...!!'
                                                      });

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            coordinatorDataList,
                                                            message: 'No Records Found...!!'
                                                      });

                                                }

                                          }).catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: 'Something Went Wrong. Please Try Later...!!'
                                                });
                                          })

                              } else {

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: 'Something Went Wrong. Please Try Later...!!'
                                    });

                              }

                        }).catch(err => {
                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: 'Something Went Wrong. Please Try Later...!!'
                              });
                        })



            } else {
                  return res.status(200).json({
                        statusCode: "0",
                        message: "All fields are mandatory..!!"
                  });
            }

      } catch (error) {
            res.status(200).json({
                  statusCode: "0",
                  message: 'Something Went Wrong. Please Try Later...!!'
            });
      }

}

module.exports = SchoolCoordinatorList;