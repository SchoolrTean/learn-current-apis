const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const AssignmentModel = require('../../../../models/assignment/assignmentModel')


module.exports = (req, res, next) => {

    if (req.params.teacherId && req.params.classId && req.params.assignmentId) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let assignmentId = req.params.assignmentId;

        VerifyTeacher(teacherId, classId, (error, response) => {

            if (response && response.statusCode != "0") {

                AssignmentModel.findOne({
                    _id: assignmentId,
                    groupId: classId,
                    sectionType: "Announcement",
                    teacherDeleteAllStatus: false,
                    teacherDeleteStatus: false,
                    isActive: true
                }, {
                    "groupId": 1,
                    "title": 1,
                    "eventDate": 1,
                    "coming": 1,
                    "notComing": 1,
                    "activeStudentIds": 1,
                })
                    .populate('groupId', 'grade section gradeId groupPic')
                    .populate('coming', 'firstName surName profilePic')
                    .populate('notComing', 'firstName surName profilePic')
                    .populate('activeStudentIds', 'firstName surName profilePic')
                    .exec()
                    .then(async result => {

                        console.log(result);

                        if (result) {

                            let yesStudentList = [];
                            let noStudentList = [];
                            let alreadyRespondedStudentList = [];
                            let yetToRepondStudentList = [];

                            if (result.coming.length > 0) {

                                for (let index = 0; index < result.coming.length; index++) {
                                    const studentDetails = result.coming[index];

                                    alreadyRespondedStudentList.push(String(studentDetails._id))

                                    yesStudentList.push({
                                        "firstName": studentDetails.firstName,
                                        "surName": studentDetails.surName,
                                        "profilePic": studentDetails.profilePic ? studentDetails.profilePic : "",
                                    })
                                }

                            }

                            if (result.notComing.length > 0) {

                                for (let index = 0; index < result.notComing.length; index++) {
                                    const studentDetails = result.notComing[index];

                                    alreadyRespondedStudentList.push(String(studentDetails._id))

                                    noStudentList.push({
                                        "firstName": studentDetails.firstName,
                                        "surName": studentDetails.surName,
                                        "profilePic": studentDetails.profilePic ? studentDetails.profilePic : "",
                                    })
                                }

                            }


                            if (result.activeStudentIds.length > 0) {

                                for (let index = 0; index < result.activeStudentIds.length; index++) {
                                    const studentDetails = result.activeStudentIds[index];

                                    if ((alreadyRespondedStudentList.length > 0 && alreadyRespondedStudentList.indexOf(String(studentDetails._id)) == -1) || alreadyRespondedStudentList.length == 0) {

                                        yetToRepondStudentList.push({
                                            "firstName": studentDetails.firstName,
                                            "surName": studentDetails.surName,
                                            "profilePic": studentDetails.profilePic ? studentDetails.profilePic : "",
                                        })

                                    }

                                }

                            }


                            res.status(200).json({
                                statusCode: "1",
                                title: result.title,
                                grade: result.groupId.grade,
                                section: result.groupId.section,
                                groupPic: result.groupId.groupPic,
                                studentsRespondedYes: yesStudentList,
                                studentsRespondedNo: noStudentList,
                                studentsNotReponded: yetToRepondStudentList,
                                message: "Data Found...!"
                            });


                        } else {
                            res.status(200).json({
                                statusCode: "0",
                                message: "No Record Found..!!"
                            });
                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(200).json({
                            statusCode: "0",
                            message: "Something went wrong. Please try again..!!"
                        })
                    });
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
