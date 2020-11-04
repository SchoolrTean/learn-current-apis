const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const verifyTeacher = require('../../../../middleware/verifyTeacher');


const report = async (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.assignmentId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;
            let assignmentId = req.params.assignmentId;

            /**Verify teacher with groupId and get teacher details and group details*/
            verifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        /**Check  Assignment Exists*/
                        AssignmentModel.findOne({
                                    _id: assignmentId,
                                    groupId,
                                    cancelStatus: false,
                                    teacherDeleteStatus: false,
                                    teacherDeleteAllStatus: false
                              }, {
                                    seenStudents: 1
                              })
                              .populate('seenStudents', "firstName surName profilePic")
                              .populate('activeStudentIds', "firstName surName profilePic")
                              .exec()
                              .then(record => {

                                    console.log(record);

                                    if (record) {

                                          let studentList = new Array();
                                          let seenStudentList = new Array();

                                          for (let index = 0; index < record.seenStudents.length; index++) {
                                                const student = record.seenStudents[index];

                                                seenStudentList.push(String(student._id));
                                                
                                                studentList.push({
                                                      "_id": student._id,
                                                      "firstName": student.firstName,
                                                      "surName": student.surName,
                                                      "profilePic": student.profilePic ? student.profilePic : "",
                                                      "seen": "true"
                                                })
                                          }

                                          for (let index = 0; index < record.activeStudentIds.length; index++) {
                                                const student = record.activeStudentIds[index];

                                                if (seenStudentList.indexOf(String(student._id)) == -1) {

                                                      studentList.push({
                                                            "_id": student._id,
                                                            "firstName": student.firstName,
                                                            "surName": student.surName,
                                                            "profilePic": student.profilePic ? student.profilePic : "",
                                                            "seen": "false"
                                                      })

                                                }

                                          }

                                          res.status(200).json({
                                                statusCode: "1",
                                                seenStudentsList: studentList,
                                                message: "No Records Found...!!"
                                          })

                                    } else {
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "No Records Found...!!"
                                          })
                                    }

                              }).catch(err => {
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
            res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}

module.exports = report;