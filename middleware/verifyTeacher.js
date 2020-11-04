const TeacherModel = require('../models/authentication/userModel');

const ClassTeacherConnectionModel = require('../models/classes/classTeacherConnectionModel');

const verifyTeacher = (teacherId, groupId = undefined, callback) => {

       console.log(teacherId);
       console.log(groupId);

       if (teacherId) {

              TeacherModel.findOne({
                     _id: teacherId,
                     type: 0,
                     isActive: true
              })
                     .exec()
                     .then(teacherDetails => {

                            if (teacherDetails) {

                                   if (groupId != "") {

                                          let groupArray = groupId.split(',').filter(el => el);

                                          if (groupArray.length == 1) {

                                                 ClassTeacherConnectionModel.findOne({
                                                        classId: groupArray[0],
                                                        teacherId,
                                                        // transferGroup: false,
                                                        isActive: true,
                                                 }, {
                                                        classId: 1,
                                                        // groupName: 1,
                                                        // grade: 1,
                                                        // gradeId: 1,
                                                        // section: 1,
                                                        // groupLink: 1,
                                                        // groupPic: 1,
                                                        // transferGroup: 1
                                                 })
                                                        .populate('classId')
                                                        .exec()
                                                        .then(group => {

                                                               console.log(group);

                                                               if (group) {

                                                                      let success = {
                                                                             statusCode: "1",
                                                                             teacherData: teacherDetails,
                                                                             classData: {
                                                                                    _id: group.classId._id,
                                                                                    groupName: "",
                                                                                    grade: group.classId.grade,
                                                                                    gradeId: group.classId.gradeId,
                                                                                    section: group.classId.section,
                                                                                    groupLink: group.classId.groupLink,
                                                                                    groupPic: group.classId.groupPic ? group.classId.groupPic : "",
                                                                                    transferGroup: "false",
                                                                             },
                                                                             message: "Teacher exists...!!"
                                                                      }

                                                                      console.log(success);

                                                                      callback(undefined, success)

                                                               } else {

                                                                      let error = {
                                                                             statusCode: "0",
                                                                             message: "Access Denied...!!"
                                                                      }

                                                                      callback(error)
                                                               }

                                                        })
                                                        .catch(err => {
                                                               console.log(err);
                                                               let error = {
                                                                      statusCode: "0",
                                                                      message: "Something went wrong please try later..!!"
                                                               }
                                                               callback(error)
                                                        })

                                          } else if (groupArray.length > 1) {

                                                 ClassTeacherConnectionModel.find({
                                                        classId: {
                                                               $in: groupArray
                                                        },
                                                        teacherId,
                                                        // transferGroup: false,
                                                        isActive: true,

                                                 }, {
                                                        classId: 1,
                                                        // groupName: 1,
                                                        // grade: 1,
                                                        // section: 1,
                                                        // groupLink: 1,
                                                        // groupPic: 1,
                                                        // transferGroup: 1
                                                 })
                                                        .populate('classId')
                                                        .exec()
                                                        .then(group => {

                                                               if (group.length == groupArray.length) {

                                                                      console.log("completed");
                                                                      console.log(groupArray);

                                                                      let classData = [];

                                                                      for (let index = 0; index < group.length; index++) {
                                                                             const groupDetails = group[index];

                                                                             classData.push({
                                                                                    _id: groupDetails.classId._id,
                                                                                    groupName: "",
                                                                                    grade: groupDetails.classId.grade,
                                                                                    gradeId: groupDetails.classId.gradeId,
                                                                                    section: groupDetails.classId.section,
                                                                                    groupLink: groupDetails.classId.groupLink,
                                                                                    groupPic: groupDetails.classId.groupPic ? groupDetails.classId.groupPic : "",
                                                                                    transferGroup: "false",
                                                                             })
                                                                      }


                                                                      let success = {
                                                                             statusCode: "1",
                                                                             teacherData: teacherDetails,
                                                                             classData: classData,
                                                                             message: "Teacher exists...!!"
                                                                      }
                                                                      callback(undefined, success)

                                                               } else {

                                                                      let error = {
                                                                             statusCode: "0",
                                                                             message: "Access Denied...!!"
                                                                      }

                                                                      callback(error)
                                                               }

                                                        })
                                                        .catch(err => {
                                                               console.log(err);
                                                               let error = {
                                                                      statusCode: "0",
                                                                      message: "Something went wrong please try later..!!"
                                                               }
                                                               callback(error)
                                                        })
                                          } else {
                                                 let error = {
                                                        statusCode: "0",
                                                        message: "Something went wrong please try later..!!"
                                                 }
                                                 callback(error)
                                          }

                                   } else {
                                          let success = {
                                                 statusCode: "1",
                                                 teacherData: teacherDetails,
                                                 message: "Teacher exists...!!"
                                          }
                                          callback(undefined, success)
                                   }


                            } else {
                                   let error = {
                                          statusCode: "0",
                                          message: "Access Denied..!!"
                                   }
                                   callback(error)
                            }

                     })
                     .catch(err => {
                            console.log(err);
                            let error = {
                                   statusCode: "0",
                                   message: "Access Denied..!!"
                            }
                            callback(error)
                     })
       } else {
              let error = {
                     statusCode: "0",
                     message: "Access Denied..!!"
              }
              callback(error)
       }
}


module.exports = verifyTeacher