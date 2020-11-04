const mongoose = require('mongoose');

const TeacherModel = require('../../../models/authentication/userModel');

const ConnectionModel = require('../../../models/group/connectionModel');

const VerifyStudent = require('../../../middleware/verifyStudent');



const list = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            VerifyStudent(studentId, "")
                  .then(response => {

                        if (response && response.statusCode == 1) {

                              ConnectionModel.aggregate([{
                                          $match: {
                                                studentId: mongoose.Types.ObjectId(studentId),
                                                connectionStatus: 2,
                                                isActive: true
                                          },
                                    }, {
                                          $group: {
                                                _id: "$teacherId"
                                          }
                                    }])
                                    .exec()
                                    .then(teacherIdsObjArray => {

                                          console.log(teacherIdsObjArray);

                                          let teacherIdsArray = teacherIdsObjArray.map(teacherObj => teacherObj._id);

                                          TeacherModel.find({
                                                      _id: {
                                                            $in: teacherIdsArray
                                                      },
                                                      isActive: true
                                                }, {
                                                      firstName: 1,
                                                      surName: 1,
                                                      profilePic: 1
                                                })
                                                .exec()
                                                .then(teacherList => {

                                                      let teacherListData = teacherList.map(teacher => {
                                                            return {
                                                                  _id: teacher._id,
                                                                  firstName: teacher.firstName,
                                                                  surName: teacher.surName,
                                                                  profilePic: teacher.profilePic ? teacher.profilePic : "",
                                                            }
                                                      });

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            teacherList: teacherListData,
                                                            message: "Data Found...!!"
                                                      });

                                                })
                                                .catch(err => {
                                                      console.log(err);
                                                      return res.status(200).json({
                                                            statusCode: "0",
                                                            message: 'Soomething Went Wrong. Please Try Later...!!'
                                                      });

                                                })
                                    })

                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: response.message
                              });

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: 'Soomething Went Wrong. Please Try Later...!!'
                        });

                  })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = list;