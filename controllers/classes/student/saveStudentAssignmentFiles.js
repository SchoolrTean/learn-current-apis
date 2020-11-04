const mongoose = require('mongoose');

const AssignmentModel = require('../../../models/assignment/assignmentModel');
const AssignmentStudentSubmissionRatingModel = require('../../../models/assignment/assignmentSubmissionRatingModel');
const VerifyStudent = require('../../../middleware/verifyStudent');

module.exports = (req, res, next) => {

    let fileUrls = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : []

    if (req.body.studentId && req.body.classId && req.body.assignmentId) {

        let studentId = req.body.studentId;
        let classId = req.body.classId;
        let assignmentId = req.body.assignmentId;

        VerifyStudent(studentId, classId)
            .then(response => {

                if (response && response.statusCode != "0") {

                    AssignmentModel.findOne({
                        _id: assignmentId,
                        groupId: classId,
                        $or: [{
                            sectionType: "HomeWork",
                        }, {
                            sectionType: "ProjectWork",
                        }],
                        cancelStatus: false,
                        teacherDeleteAllStatus: false,
                        teacherDeleteStatus: false,
                        isActive: true
                    }, {
                        "_id": 1,
                        "subject": 1,
                    })
                        .exec()
                        .then(async result => {

                            console.log(result);

                            if (result) {

                                let PromiseData = []
                                let SavedFiles = [];

                                for (let index = 0; index < fileUrls.length; index++) {
                                    const fileUrl = fileUrls[index];

                                    const HomeworkFileSubmitted = new AssignmentStudentSubmissionRatingModel({
                                        _id: new mongoose.Types.ObjectId(),
                                        studentId,
                                        subject: result.subject,
                                        assignmentId: assignmentId,
                                        fileUrl
                                    })

                                    PromiseData.push(HomeworkFileSubmitted.save().then(fileSaved => { SavedFiles.push({ fileId : fileSaved._id, fileUrl : fileSaved.fileUrl }) }))
                                }

                                Promise.all(PromiseData)
                                    .then(allFilesSaved => {

                                        res.status(200).json({
                                            statusCode: "1",
                                            SavedFiles,
                                            message: "Successful..!!"
                                        })

                                    })
                                    .catch(err => {
                                        console.log(err)

                                        res.status(200).json({
                                            statusCode: "0",
                                            message: "Something went wrong. Please try again..!!"
                                        })
                                    })

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
                        message: response.message
                    })
                }

            })
            .catch(err => {
                console.log(err)
                res.status(200).json({
                    statusCode: "0",
                    message: "Something went wrong. Please try again..!!"
                })
            })

    } else {
        res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }
}
