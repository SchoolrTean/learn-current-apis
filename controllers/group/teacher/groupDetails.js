const VerifyTeacher = require('../../../middleware/verifyTeacher');

const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');
const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');


const details = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;

            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        let GroupDetails = ClassTeacherConnectionModel.findOne({
                                    classId: groupId,
                                    teacherId,
                                    isActive: true
                              }, {

                                    teacherId: 1,
                                    classId :1,
                                    subjects :1,
                                    secondLanguages:1,
                                    thirdLanguages:1,
                                    date: 1
                              })
                              .populate({
                                    path: 'classId',
                                    select: 'grade section groupPic creator',
                                    populate: {
                                          path: 'creator',
                                          select: 'firstName surname schoolName type',
                                    }
                              })
                              .exec()

                        let StudentList = ClassStudentConnectionModel.find({
                                    classId: groupId,
                                    isActive: true
                              })
                              .populate('studentId')
                              .exec()

                        Promise.all([GroupDetails, StudentList])
                              .then(async result => {

                                    console.log(result);

                                    if (result[0] != null) {

                                          let studentsArray = new Array();

                                          // let subjectListArray = new Array();

                                          if (result[1].length > 0) {


                                                for (let index = 0; index < result[1].length; index++) {
                                                      const student = result[1][index];

                                                      studentsArray.push({
                                                            connectionId: student._id,
                                                            connectionStatus: String(student.connectionStatus),
                                                            studentMobileNo: student.studentMobileNo ? String(student.studentMobileNo) : student.studentId.mobileNo,
                                                            studentId: student.studentId._id,
                                                            firstName: student.studentId.firstName,
                                                            surName: student.studentId.surName,
                                                            profilePic: student.studentId.profilePic ? student.studentId.profilePic : "",
                                                      });

                                                }

                                          }

                                          res.status(200).json({
                                                statusCode: "1",
                                                gradeId: result[0].classId.gradeId,
                                                grade: result[0].classId.grade,
                                                section: result[0].classId.section ? result[0].classId.section : "",
                                                groupName: result[0].classId.section ? result[0].classId.grade + '-' + result[0].classId.section : result[0].classId.grade,
                                                createdDate: result[0].date,
                                                createdBy: "Creator Name",//result[0].createdBy.surName ? result[0].createdBy.firstName + " " + result[0].createdBy.surName : result[0].createdBy.firstName,
                                                groupPic: result[0].groupPic,
                                                subjectsList: (result[0].subjects.length > 0 || result[0].secondLanguages.length > 0 || result[0].thirdLanguages.length > 0) ? [...result[0].subjects, ...result[0].secondLanguages, ...result[0].thirdLanguages] : [],
                                                studentsArray: studentsArray,
                                                message: "Data Found..!!"

                                          })

                                    } else {

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

module.exports = details