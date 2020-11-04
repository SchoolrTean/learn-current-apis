const VerifyStudent = require('../../../middleware/verifyStudent');
const ConnectionModel = require('../../../models/group/connectionModel');

const acceptConnectionRequest = (req, res, next) => {

      if (req.params.studentId && req.params.connectionId) {

            let studentId = req.params.studentId;
            let connectionId = req.params.connectionId;

            //check wheather student exists and isActive
            VerifyStudent(studentId, "")
                  .then((response) => {

                        console.log(response);

                        if (response && response.statusCode != "0") {

                              ConnectionModel.findOne({
                                          _id: connectionId,
                                          studentMobileNo: response.studentData.mobileNo,
                                          connectionStatus: 1,
                                          isActive: true
                                    })
                                    .populate('teacherId')
                                    .populate('groupId')
                                    .exec()
                                    .then(connectionRequest => {

                                          console.log(connectionRequest);

                                          if (connectionRequest && connectionRequest.connectionStatus == 1) {

                                                ConnectionModel.updateOne({
                                                            _id: connectionId
                                                      }, {
                                                            $set: {
                                                                  studentId,
                                                                  connectionStatus: 2
                                                            }
                                                      })
                                                      .populate('teacherId')
                                                      .populate('groupId')
                                                      .exec()
                                                      .then(connectionUpdated => {

                                                            console.log(connectionUpdated);

                                                            if (connectionUpdated.nModified == 1) {

                                                                  return res.status(200).json({
                                                                        "statusCode": "1",
                                                                        "message": "Connection Established..!!"
                                                                  });

                                                            } else {

                                                                  return res.status(200).json({
                                                                        "statusCode": "0",
                                                                        "message": "Something Went Wrong. Please try later..!!"
                                                                  });

                                                            }

                                                      })
                                                      .catch(err => {

                                                            console.log(err);

                                                            return res.status(200).json({
                                                                  "statusCode": "0",
                                                                  "message": "Something Went Wrong. Please try later..!!"
                                                            });

                                                      })

                                          } else {

                                                return res.status(200).json({
                                                      "statusCode": "0",
                                                      "message": "Access Denied..!!"
                                                });

                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                "statusCode": "0",
                                                "message": "Something Went Wrong. Please try later..!!"
                                          });
                                    })

                        } else {

                              return res.status(200).json({
                                    "statusCode": "0",
                                    "message": error.message
                              })

                        }

                  })
                  .catch(err => {
                        console.log(err);
                        return res.status(200).json({
                              "statusCode": "0",
                              "message": "Something Went Wrong. Please try later..!!"
                        });
                  });

      } else {

            return res.status(200).json({
                  "statusCode": "0",
                  "message": "All fields are mandatory..!!"
            });

      }
}


module.exports = acceptConnectionRequest