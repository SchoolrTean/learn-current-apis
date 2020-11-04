const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const ConnectionModel = require('../../../../models/group/connectionModel');
const TeacherGroupModel = require('../../../../models/group/teacherGroupModel');



const list = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;

            //Verify Teacher and Grade
            VerifyTeacher(teacherId, groupId, (error, response) => {

                  mongoose.set('debug', true);

                  if (response && response.statusCode != "0") {

                        TeacherGroupModel.find({
                                    teacherId,
                                    // transferGroup: false,
                                    _id: {
                                          $ne: groupId
                                    },
                                    isActive: true
                              }).exec()
                              .then(groups => {

                                    if (groups.length > 0) {

                                          let groupArray = new Array();

                                          for (let index = 0; index < groups.length; index++) {
                                                groupArray.push(groups[index]);
                                          }

                                          ConnectionModel.find({
                                                      isActive: true,
                                                      connectionStatus: 2,
                                                      groupId: {
                                                            $in: groupArray
                                                      },

                                                }, {
                                                      _id: 1,
                                                      connectionStatus: 1,
                                                      groupId: 1
                                                })
                                                .sort({
                                                      connectionStatus: 1,
                                                })
                                                .populate('groupId', 'groupName grade section')
                                                .populate('studentId', '_id firstName surName mobileNo profilePic', null, {
                                                      sort: {
                                                            'firstName': 1
                                                      }
                                                })
                                                .exec()
                                                .then(connectionsList => {

                                                      console.log(connectionsList)

                                                      if (connectionsList.length > 0) {

                                                            let groupExists = [];
                                                            let groupsData = [];

                                                            for (let index = 0; index < connectionsList.length; index++) {

                                                                  const connection = connectionsList[index];

                                                                  let groupName = connection.groupId.groupName ? connection.groupId.groupName : connection.groupId.grade + "-" + connection.groupId.section;

                                                                  let groupExistsIndex = groupExists.indexOf(groupName);

                                                                  if (groupExists.length == 0 || groupExistsIndex == -1) {

                                                                        let groupObj = {
                                                                              students: []
                                                                        };

                                                                        groupObj.groupName = groupName

                                                                        console.log(connection);

                                                                        groupObj.students.push({
                                                                              studentId: connection.studentId._id,
                                                                              studentFirstName: connection.studentId.firstName,
                                                                              studentSurName: connection.studentId.surName ? connection.studentId.surName : "",
                                                                              profilePic: connection.studentId.profilePic ? connection.studentId.profilePic : ""
                                                                        });

                                                                        groupExists.push(groupObj.groupName);

                                                                        groupsData.push(groupObj);

                                                                  } else {
                                                                        groupsData[groupExistsIndex].students.push({
                                                                              studentId: connection.studentId._id,
                                                                              studentFirstName: connection.studentId.firstName,
                                                                              studentSurName: connection.studentId.surName ? connection.studentId.surName : "",
                                                                              profilePic: connection.studentId.profilePic ? connection.studentId.profilePic : ""
                                                                        })
                                                                  }

                                                            }

                                                            console.log(groupsData);

                                                            res.status(200).json({
                                                                  "statusCode": "1",
                                                                  "groupsData": groupsData,
                                                                  "message": "Data Found"
                                                            })

                                                      } else {

                                                            res.status(200).json({
                                                                  "statusCode": "0",
                                                                  "groupsData": [],
                                                                  "message": "No groups Exist...!!"
                                                            })

                                                      }

                                                })
                                                .catch(notFound => {
                                                      console.log(notFound)
                                                      res.status(200).json({
                                                            "statusCode": "0",
                                                            "groupsData": [],
                                                            "message": "No groups Exist...!!"
                                                      })
                                                })

                                    } else {
                                          res.status(200).json({
                                                "statusCode": "0",
                                                "groupsData": [],
                                                "message": "No groups Exist...!!"
                                          })
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. Please try again..!!"
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

module.exports = list;