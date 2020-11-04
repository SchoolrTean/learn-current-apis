const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const StudentModel = require('../../../../models/authentication/userModel');
const ConnectionModel = require('../../../../models/group/connectionModel');


const ReAdmitUser = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.studentId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;
            let studentId = req.params.studentId;

            //Verify Teacher and Grade
            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        StudentModel.findOne({
                                    _id: studentId,
                                    type: 1,
                                    isActive: true
                              })
                              .exec()
                              .then(student => {

                                    if (student) {

                                          ConnectionModel.findOne({
                                                      studentId,
                                                      groupId,
                                                      connectionStatus: 3,
                                                      isActive: true
                                                })
                                                .exec()
                                                .then(result => {

                                                      if (result) {

                                                            ConnectionModel.updateOne({
                                                                        studentId,
                                                                        groupId,
                                                                        isActive: true
                                                                  }, {
                                                                        $set: {
                                                                              connectionStatus: 2,
                                                                        }
                                                                  })
                                                                  .exec()
                                                                  .then(result => {

                                                                        if (result.nModified > 0) {

                                                                              res.status(200).json({
                                                                                    "statusCode": "1",
                                                                                    "message": "Successfull..!!"
                                                                              })

                                                                        } else {

                                                                              res.status(200).json({
                                                                                    "statusCode": "0",
                                                                                    "message": "Something went wrong. Please try later..!!"
                                                                              })

                                                                        }

                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);

                                                                        res.status(200).json({
                                                                              "statusCode": "0",
                                                                              "message": "Something Went Wrong. Please Tyr Later..!!"
                                                                        })
                                                                  })


                                                      } else {

                                                            res.status(200).json({
                                                                  "statusCode": "0",
                                                                  "message": "Access Denied..!!"
                                                            })

                                                      }

                                                })
                                                .catch(err => {
                                                      console.log(err);

                                                      res.status(200).json({
                                                            "statusCode": "0",
                                                            "message": "Something Went Wrong. Please Tyr Later..!!"
                                                      })
                                                })

                                    } else {
                                          res.status(200).json({
                                                "statusCode": "0",
                                                "message": "Access Denied..!!"
                                          })
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    res.status(200).json({
                                          "statusCode": "0",
                                          "message": "Something Went Wrong. Please Tyr Later..!!"
                                    })
                              })

                  } else {

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied.....!!"
                        })

                  }
            })

      } else {
            res.status(200).json({
                  "statusCode": "0",
                  "message": "All Fields are mandatory...!!"
            })
      }

}

module.exports = ReAdmitUser;