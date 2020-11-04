const mongoose = require('mongoose');

const AssignmentModel = require('../../../models/assignment/assignmentModel');
const AssignmentStudentSubmissionRatingModel = require('../../../models/assignment/assignmentSubmissionRatingModel');
const VerifyStudent = require('../../../middleware/verifyStudent');


module.exports = (req, res, next) => {

    console.log(req.params);

    if (req.params.studentId && req.params.classId && req.params.assignmentId && (req.body.submissionIds)) {

        let studentId = req.params.studentId;
        let classId = req.params.classId;
        let assignmentId = req.params.assignmentId;

        let submissionIdSplited = req.body.submissionIds.trim() ? req.body.submissionIds.trim().split(',') : [];

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
                    })
                        .exec()
                        .then(async result => {

                            console.log(result);

                            if (result) {

                                let alreadySubmittedFlag = 0;
                                let PromiseData = [];
                                let notSubmittedCount = 0;

                                if (result.exerciseId) {

                                    let checkExerciseSubmitted = await AssignmentStudentSubmissionRatingModel.findOne({
                                        studentId,
                                        subject: result.subject,
                                        assignmentId,
                                        exerciseId: result.exerciseId,
                                        submitted: true
                                    })
                                        .exec()

                                    console.log(checkExerciseSubmitted)

                                    if (submissionIdSplited.indexOf(String(result.exerciseId)) != -1 && checkExerciseSubmitted) {
                                        alreadySubmittedFlag++ //= 1;
                                    } else if (submissionIdSplited.indexOf(String(result.exerciseId)) != -1 && !checkExerciseSubmitted) {

                                        const ExerciseSubmitted = new AssignmentStudentSubmissionRatingModel({
                                            _id: mongoose.Types.ObjectId(),
                                            studentId,
                                            subject: result.subject,
                                            assignmentId,
                                            exerciseId: result.exerciseId,
                                            submitted: true
                                        })

                                        PromiseData.push(ExerciseSubmitted.save())
                                        notSubmittedCount++;

                                    } else if (!checkExerciseSubmitted) {
                                        notSubmittedCount++;
                                    }

                                }

                                
                                console.log("notSubmittedCount")
                                console.log(notSubmittedCount)


                                if (result.workSheetIds && result.workSheetIds.length > 0) { // && notSubmittedCount == 0 && alreadySubmittedFlag == 0

                                    for (let index = 0; index < result.workSheetIds.length; index++) {
                                        const workSheetId = result.workSheetIds[index];

                                        let checkWorkSheetSubmitted = await AssignmentStudentSubmissionRatingModel.findOne({
                                            studentId,
                                            subject: result.subject,
                                            assignmentId,
                                            workSheetId,
                                            submitted: true
                                        })
                                            .exec()

                                        if (submissionIdSplited.indexOf(String(workSheetId)) != -1 && checkWorkSheetSubmitted) {
                                            alreadySubmittedFlag++ //= 1;
                                        } else if (submissionIdSplited.indexOf(String(workSheetId)) != -1 && !checkWorkSheetSubmitted) {

                                            const WorkSheetSubmitted = new AssignmentStudentSubmissionRatingModel({
                                                _id: mongoose.Types.ObjectId(),
                                                studentId,
                                                subject: result.subject,
                                                assignmentId,
                                                workSheetId,
                                                submitted: true
                                            })

                                            PromiseData.push(WorkSheetSubmitted.save())
                                            notSubmittedCount++;

                                        } else if (!checkWorkSheetSubmitted) {
                                            notSubmittedCount++;
                                        }

                                    }

                                }
                                
                                console.log("notSubmittedCount")
                                console.log(notSubmittedCount)


                                let alreadySubmittedInClass = 0

                                if (alreadySubmittedFlag == 0) { //&& notSubmittedCount == 0

                                    await AssignmentStudentSubmissionRatingModel.find({
                                        studentId,
                                        subject: result.subject,
                                        assignmentId,
                                        exerciseId: {
                                            $exists: false,
                                        },
                                        workSheetId: {
                                            $exists: false,
                                        },
                                        // submitted: true
                                    })
                                        .exec()
                                        .then(submittedData => {

                                            if (submittedData.length > 0) {

                                                for (let index = 0; index < submittedData.length; index++) {
                                                    const submittedRecord = submittedData[index];

                                                    if (submittedRecord.fileUrl) {

                                                        if (submissionIdSplited.indexOf(String(submittedRecord._id)) != -1) {

                                                            if (submittedRecord.submitted == true) {
                                                                alreadySubmittedFlag++ //= 1;
                                                            } else {
                                                                let filesSubmitted = AssignmentStudentSubmissionRatingModel.updateOne({
                                                                    _id: submittedRecord._id,
                                                                    isActive: true
                                                                }, {
                                                                    $set: {
                                                                        submitted: true
                                                                    }
                                                                })
                                                                    .exec()

                                                                PromiseData.push(filesSubmitted);

                                                                notSubmittedCount++;
                                                            }

                                                        } else {
                                                            notSubmittedCount++;
                                                        }

                                                    } else if (submittedRecord.submitAssignmentInClass && submittedRecord.submitted == true) {

                                                        alreadySubmittedInClass = 1;
                                                        alreadySubmittedFlag++;

                                                    }

                                                }

                                            }

                                        })

                                }

                                
                                console.log("notSubmittedCount")
                                console.log(notSubmittedCount)

                                // console.log("alreadySubmittedInClass")
                                // console.log(alreadySubmittedInClass)
                                // console.log("alreadySubmittedFlag")
                                // console.log(alreadySubmittedFlag)

                                // if (alreadySubmittedFlag == 0 && notSubmittedCount == 0 && alreadySubmittedInClass == 1) {

                                if (submissionIdSplited.indexOf(String('submitInClass')) != -1 && alreadySubmittedInClass == 0) { //submitInClass == "yes"

                                    const ExerciseSubmitted = new AssignmentStudentSubmissionRatingModel({
                                        _id: mongoose.Types.ObjectId(),
                                        studentId,
                                        subject: result.subject,
                                        assignmentId,
                                        submitAssignmentInClass: true,
                                        submitted: true
                                    })

                                    PromiseData.push(ExerciseSubmitted.save())

                                    notSubmittedCount++;
                                }

                                // }

                                console.log("notSubmittedCount")
                                console.log(notSubmittedCount)

                                console.log("PromiseData.length")
                                console.log(PromiseData.length)

                                if (PromiseData.length > 0) {

                                    Promise.all(PromiseData)
                                        .then(allAttachmentsSubmitted => {

                                            if (notSubmittedCount == PromiseData.length) {

                                                AssignmentModel.findOne({
                                                    _id: assignmentId,
                                                    "completedStudents.userId": studentId
                                                })
                                                    .then(assignmentFound => {

                                                        if (assignmentFound) {

                                                            AssignmentModel.updateOne({
                                                                _id: assignmentId,
                                                                "completedStudents.userId" : studentId
                                                            }, {
                                                                $set: {
                                                                    "completedStudents.$.completionTimeStamp": new Date(new Date().setMinutes(new Date().getMinutes() + 330))
                                                                }
                                                            })
                                                                .then(assignmentsubmitted => {
                                                                    res.status(200).json({
                                                                        statusCode: "1",
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

                                                            AssignmentModel.updateOne({
                                                                _id: assignmentId
                                                            }, {
                                                                $push: {
                                                                    completedStudents: {
                                                                        userId: studentId
                                                                    },
                                                                    completedStudentList: studentId
                                                                }
                                                            })
                                                                .then(assignmentsubmitted => {
                                                                    res.status(200).json({
                                                                        statusCode: "1",
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
                                                    statusCode: "1",
                                                    message: "Successful..!!"
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
                                        message: "Already Submitted..!!"
                                    });
                                }

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