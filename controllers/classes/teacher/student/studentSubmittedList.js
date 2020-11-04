const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const AssignmentModel = require('../../../../models/assignment/assignmentModel');

const AssignmentSubmissionRatingModel = require('../../../../models/assignment/assignmentSubmissionRatingModel')


// const formatDate = require('../../formatDate');


module.exports = (req, res, next) => {

    if (req.params.teacherId && req.params.classId && req.params.assignmentId && req.params.studentId) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let assignmentId = req.params.assignmentId;
        let studentId = req.params.studentId;

        VerifyTeacher(teacherId, classId, (error, response) => {

            if (response && response.statusCode != "0") {

                AssignmentModel.findOne({
                    _id: assignmentId,
                    groupId: classId,
                    sectionType: "HomeWork",
                    "completedStudents.userId": studentId,
                    teacherDeleteAllStatus: false,
                    teacherDeleteStatus: false,
                    isActive: true
                }, {
                    "_id": 1,
                    "title": 1,
                })
                    .exec()
                    .then(async result => {

                        console.log(result);

                        if (result) {

                            AssignmentSubmissionRatingModel.find({
                                studentId,
                                assignmentId,
                                submitted: true
                            })
                                .populate('workSheetId')
                                .populate('exerciseId')
                                .then(submittedAssignmentList => {

                                    if (submittedAssignmentList.length > 0) {

                                        let submittedList = [];

                                        for (let index = 0; index < submittedAssignmentList.length; index++) {
                                            const submittedAssignment = submittedAssignmentList[index];

                                            if (submittedAssignment.exerciseId) {

                                                submittedList.push({
                                                    _id: submittedAssignment._id,
                                                    workSheetId: "",
                                                    exerciseId: submittedAssignment.exerciseId._id,
                                                    chapterId: submittedAssignment.exerciseId.chapterId,
                                                    topicId: submittedAssignment.exerciseId.topicId,
                                                    fileUrl: submittedAssignment.fileUrl ? submittedAssignment.fileUrl : "",
                                                    name: submittedAssignment.exerciseId.exerciseName,
                                                    attachmentType: "exercise", //Files
                                                    rating: submittedAssignment.rating ? submittedAssignment.rating : 0,
                                                    submitted: submittedAssignment.submitted ? submittedAssignment.submitted : false
                                                })

                                            }

                                            if (submittedAssignment.workSheetId) {

                                                submittedList.push({
                                                    _id: submittedAssignment._id,                                                    
                                                    workSheetId: submittedAssignment.workSheetId._id,
                                                    exerciseId: "",
                                                    chapterId: "",
                                                    topicId: "",
                                                    fileUrl: "",
                                                    name: submittedAssignment.workSheetId.testPaperTitle,
                                                    attachmentType: "worksheet", //WorkSheet
                                                    rating: submittedAssignment.rating ? submittedAssignment.rating : 0,
                                                    submitted: submittedAssignment.submitted ? submittedAssignment.submitted : false
                                                })

                                            }

                                            if (submittedAssignment.fileUrl) {

                                                submittedList.push({
                                                    _id: submittedAssignment._id,
                                                    workSheetId: "",
                                                    exerciseId: "",
                                                    chapterId: "",
                                                    topicId: "",
                                                    fileUrl: submittedAssignment.fileUrl,
                                                    name: "Attachment",
                                                    attachmentType: "file", //Files
                                                    rating: submittedAssignment.rating ? submittedAssignment.rating : 0,
                                                    submitted: submittedAssignment.submitted ? submittedAssignment.submitted : false
                                                })

                                            }

                                            if (submittedAssignment.submitAssignmentInClass) {

                                                submittedList.push({
                                                    _id: submittedAssignment._id,
                                                    workSheetId: "",
                                                    exerciseId: "",
                                                    chapterId: "",
                                                    topicId: "",                                                    
                                                    fileUrl: "",
                                                    name: "Submit In Class",
                                                    attachmentType: "submitInClass", //Files
                                                    rating: submittedAssignment.rating ? submittedAssignment.rating : 0,
                                                    submitted: submittedAssignment.submitted ? submittedAssignment.submitted : false
                                                })

                                            }

                                        }

                                        res.status(200).json({
                                            statusCode: "1",
                                            submittedList,
                                            message: "Data Found..!!"
                                        })

                                    } else {

                                        res.status(200).json({
                                            statusCode: "0",
                                            message: "No Record Found..!!"
                                        })

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
