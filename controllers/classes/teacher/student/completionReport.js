const DateDiff = require('date-diff');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const AssignmentModel = require('../../../../models/assignment/assignmentModel')


const formatDate = require('../../formatDate');


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
                    sectionType: "HomeWork",
                    teacherDeleteAllStatus: false,
                    teacherDeleteStatus: false,
                    isActive: true
                }, {
                    "groupId": 1,
                    "title": 1,
                    "eventDate": 1,
                    "completedStudents": 1,
                    "notCompletedStudents": 1,
                    "activeStudentIds": 1,
                })
                    .populate('groupId', 'grade section gradeId groupPic')
                    .populate('completedStudents.userId', 'firstName surName profilePic')
                    .populate('notCompletedStudents.userId', 'firstName surName profilePic')
                    .populate('activeStudentIds', 'firstName surName profilePic')
                    .exec()
                    .then(async result => {

                        console.log(result);

                        if (result) {

                            let completedStudentList = [];
                            let notCompletedStudentList = [];
                            let alreadyRespondedStudentList = [];
                            let yetToRepondStudentList = [];

                            if (result.completedStudents.length > 0) {

                                for (let index = 0; index < result.completedStudents.length; index++) {
                                    const studentDetails = result.completedStudents[index];

                                    alreadyRespondedStudentList.push(String(studentDetails.userId._id))

                                    let dateDiff = new DateDiff(await formatDate(result.eventDate), await formatDate(studentDetails.completionTimeStamp));
                                    let diffInDays = dateDiff.days();

                                    completedStudentList.push({
                                        "userId" : studentDetails.userId._id,
                                        "firstName": studentDetails.userId.firstName,
                                        "surName": studentDetails.userId.surName,
                                        "profilePic": studentDetails.userId.profilePic ? studentDetails.userId.profilePic : "",
                                        "status": diffInDays > 0 ? "Before Time" : diffInDays == 0 ? "On Time" : "Late By " + diffInDays + " days",
                                    })
                                }

                            }

                            if (result.notCompletedStudents.length > 0) {

                                for (let index = 0; index < result.notCompletedStudents.length; index++) {
                                    const studentDetails = result.notCompletedStudents[index];

                                    alreadyRespondedStudentList.push(String(studentDetails.userId._id))

                                    notCompletedStudentList.push({
                                        "userId" : studentDetails.userId._id,
                                        "firstName": studentDetails.userId.firstName,
                                        "surName": studentDetails.userId.surName,
                                        "profilePic": studentDetails.userId.profilePic ? studentDetails.userId.profilePic : "",
                                        "status": studentDetails.reason,
                                    })
                                }

                            }


                            if (result.activeStudentIds.length > 0) {

                                for (let index = 0; index < result.activeStudentIds.length; index++) {
                                    const studentDetails = result.activeStudentIds[index];

                                    if ((alreadyRespondedStudentList.length > 0 && alreadyRespondedStudentList.indexOf(String(studentDetails._id)) == -1) || alreadyRespondedStudentList.length == 0) {

                                        yetToRepondStudentList.push({
                                            "userId" : studentDetails._id,
                                            "firstName": studentDetails.firstName,
                                            "surName": studentDetails.surName,
                                            "profilePic": studentDetails.profilePic ? studentDetails.profilePic : "",
                                            "status": "",
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
                                studentsRespondedYes: completedStudentList,
                                studentsRespondedNo: notCompletedStudentList,
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
