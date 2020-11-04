const VerifyTeacher = require('../../../middleware/verifyTeacher');

const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');
// const TransferGroupModel = require('../../../models/group/teacher/tranferGroupModel');
const ConnectionCount = require('./connectedStudentsCount');

const list = (req, res, next) => {

      if (req.params.teacherId) {

            let teacherId = req.params.teacherId;

            VerifyTeacher(teacherId, "", (error, response) => {

                  if (response && response.statusCode != "0") {

                        let MyGroups = ClassTeacherConnectionModel.find({
                              teacherId,
                              // transferGroup: false,
                              isActive: true
                        }, {

                              teacherId: 1,
                              grade: 1,
                              section: 1,
                              groupPic: 1,
                              date: 1
                        })
                              .populate('classId')
                              .exec()

                        let TransferedGroups = []

                        // TransferGroupModel.find({
                        //             fromTeacherId: teacherId,
                        //             isActive: true
                        //       }, {
                        //             groupId: 1,
                        //             toTeacherId: 1,
                        //             date: 1
                        //       })
                        //       .populate('groupId')
                        //       .populate('toTeacherId')
                        //       .exec()

                        Promise.all([MyGroups, TransferedGroups])
                              .then(async groups => {

                                    let myGroups = new Array();

                                    let tranferedGroups = new Array();

                                    try {

                                          if (groups[0].length > 0) {

                                                for (let index = 0; index < groups[0].length; index++) {

                                                      const group = groups[0][index];

                                                      let groupObj = {};

                                                      groupObj._id = group.classId._id;

                                                      groupObj.gradeId = group.classId.gradeId;

                                                      groupObj.groupName =  group.classId.section ?  group.classId.grade + " - " +  group.classId.section :  group.classId.grade;

                                                      groupObj.connectionsCount = await ConnectionCount(group.classId._id);

                                                      groupObj.transferGroup = "false";

                                                      groupObj.groupPic = group.classId.groupPic ? group.classId.groupPic : "";

                                                      groupObj.date = group.date ? group.date : "";

                                                      myGroups.push(groupObj);

                                                }

                                          }

                                          //Transferred Groups By This Teacher i.e Groups That was transfered by this Teahcer
                                          if (groups[1].length > 0) {

                                                for (let index = 0; index < groups[1].length; index++) {

                                                      const group = groups[1][index];

                                                      let groupObj = {};

                                                      groupObj._id = group.groupId._id;

                                                      groupObj.groupName = group.groupId.section ? group.groupId.grade + " - " + group.groupId.section : group.groupId.grade;

                                                      groupObj.transferGroupStatus = group.transferGroup ? String(group.transferGroup) : "false";

                                                      groupObj.groupPic = group.groupPic ? group.groupPic : "";

                                                      // groupObj.studentExist = studentCount == 0 ? "false" : "true"

                                                      groupObj.date = group.date ? group.date : "";

                                                      groupObj.teacher = group.toTeacherId ? group.toTeacherId.name : group.toMobileNo;

                                                      tranferedGroups.push(groupObj);
                                                }

                                          }

                                          res.status(200).json({
                                                statusCode: "1",
                                                myGroups: myGroups,
                                                tranferedGroups: tranferedGroups,
                                                message: "Data Found..!!"
                                          })

                                    } catch (error) {
                                          console.log(error);
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
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
                        res.status(200).json({
                              statusCode: "0",
                              message: error.message
                        })
                  }

            })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}

module.exports = list