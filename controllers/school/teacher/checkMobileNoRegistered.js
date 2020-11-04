const UserModel = require('../../../models/authentication/userModel');

exports.checkEmailIdRegistered = (req, res, next) => {

      if (req.body.SchoolId && req.body.mobileNo) {

            let schoolId = req.body.SchoolId;
            let mobileNo = req.body.mobileNo;

            UserModel.findOne({
                        _id: schoolId,
                        type: 2, //School
                        isActive: true
                  })
                  .exec()
                  .then(schoolExists => {

                        if (schoolExists) {

                              UserModel.findOne({
                                          mobileNo,
                                          $or: [{
                                                type: 2, //School
                                          }, {
                                                type: 3, //Coordinater
                                          }],
                                          isActive: true
                                    })
                                    .exec()
                                    .then(emailIdExists => {

                                          if (!emailIdExists) {

                                                res.status(200).json({
                                                      statusCode: "1",
                                                      message: 'No Records Found...!!'
                                                });

                                          } else {

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: emailIdExists.type == 2 ? 'MobilNo Registered as School...!!' : 'MobileNo Registered as Coordinator...!!'
                                                });
                                                
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: 'Something Went Wrong. Please Try Later...!!'
                                          });

                                    })

                        } else {
                              res.status(200).json({
                                    statusCode: "0",
                                    message: 'Access Denied...!!'
                              });
                        }

                  })
                  .catch(err => {
                        console.log(err);

                        res.status(200).json({
                              statusCode: "0",
                              message: 'Something Went Wrong. Please Try Later...!!'
                        });

                  })

      } else {
            res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }


}