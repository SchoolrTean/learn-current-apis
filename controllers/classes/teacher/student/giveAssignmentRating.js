const mongoose = require('mongoose');
const DateDiff = require('date-diff');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');
const AssignmentModel = require('../../../../models/assignment/assignmentModel')


const formatDate = require('../../formatDate');
const AssignmentSubmissionRatingModel = require('../../../../models/assignment/assignmentSubmissionRatingModel')


module.exports = (req, res, next) => {

    if (req.params.teacherId && req.params.classId && req.params.assignmentId && req.params.submissionId && req.body.rating) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let assignmentId = req.params.assignmentId;
        let submissionId = req.params.submissionId;
        let rating = req.body.rating;

        let howCompleteWereTheAnswers = req.body.howCompleteWereTheAnswers
        let howWellStudentUnderstandConcept = req.body.howWellStudentUnderstandConcept
        let doYouThinkStudentNeedExtraRevision = req.body.doYouThinkStudentNeedExtraRevision

        VerifyTeacher(teacherId, classId, (error, response) => {

            if (response && response.statusCode != "0") {

                AssignmentModel.findOne({
                    _id: assignmentId,
                    groupId: classId,
                    sectionType: "HomeWork",
                    teacherDeleteAllStatus: false,
                    teacherDeleteStatus: false,
                    isActive: true
                })
                    .then(async result => {

                        console.log(result);

                        if (result) {

                            let updateData = {
                                rating
                            }

                            if (howCompleteWereTheAnswers) {
                                updateData.howCompleteWereTheAnswers = howCompleteWereTheAnswers;
                            }

                            if (howWellStudentUnderstandConcept) {
                                updateData.howWellStudentUnderstandConcept = howWellStudentUnderstandConcept;
                            }

                            if (doYouThinkStudentNeedExtraRevision) {
                                updateData.doYouThinkStudentNeedExtraRevision = doYouThinkStudentNeedExtraRevision;
                            }

                            AssignmentSubmissionRatingModel.updateOne({
                                _id: submissionId,
                                isActive: true
                            }, {
                                $set: updateData
                            })
                                .then(updated => {

                                    res.status(200).json({
                                        statusCode: "1",
                                        message: "Successfull...!"
                                    });

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
