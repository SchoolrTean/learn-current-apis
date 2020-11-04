
const mongoose = require('mongoose');

const WorkSheetModel = require('../../../models/questionBank/worksheet/workSheetModel');
const WorkSheetQuestionModel = require('../../../models/questionBank/worksheet/workSheetQuestionModel');
const WorkSheetUserAnswerModel = require('../../../models/user/workSheetUserAnswerModel');
const VerifyStudent = require('../../../middleware/verifyStudent');


module.exports = (req, res) => {

    let answerUrls = new Array();

    if (req.files) {
        let filesArray = req.files;

        filesArray.forEach(file => {
            let correctPath = file.path.replace(/\\/g, '/');
            answerUrls.push(correctPath);
        });
    }

    console.log(req.body);

    if (req.body.studentId && req.body.assignmentId && req.body.workSheetId && req.body.workSheetQuestionId && (req.body.answer || answerUrls.length > 0 || req.body.savedUrls)) {

        let userId = req.body.studentId;
        let assignmentId = req.body.assignmentId;
        let workSheetId = req.body.workSheetId;
        let workSheetQuestionId = req.body.workSheetQuestionId;
        let answer = req.body.answer;
        let savedUrls = req.body.savedUrls;

        if (savedUrls && savedUrls.trim()) {
            savedUrls.split(',').forEach(url => {
                answerUrls.push(url);
            });
        }


        VerifyStudent(userId, "")
            .then(response => {

                if (response && response.statusCode != "0") {

                    WorkSheetModel.findOne({
                        _id: workSheetId,
                        isActive: true
                    })
                        .exec()
                        .then(workSheetFound => {

                            if (workSheetFound) {

                                WorkSheetQuestionModel.findOne({
                                    _id: workSheetQuestionId,
                                    // worksheetId,
                                    isActive: true
                                })
                                    .exec()
                                    .then(ExerciseQuestion => {

                                        if (ExerciseQuestion) {

                                            WorkSheetUserAnswerModel.updateOne({
                                                userId,
                                                assignmentId,
                                                workSheetQuestionId,
                                                isActive: true
                                            }, {
                                                $set: {
                                                    isActive: false
                                                }
                                            })
                                                .exec()
                                                .then(previousAnswerRemoved => {

                                                    if (previousAnswerRemoved.ok == 1) {

                                                        const SaveExerciseAnswer = new WorkSheetUserAnswerModel({
                                                            _id: new mongoose.Types.ObjectId(),
                                                            userId,
                                                            assignmentId,
                                                            workSheetId,
                                                            workSheetQuestionId,
                                                            answer,
                                                            answerUrls
                                                        })

                                                        SaveExerciseAnswer.save()
                                                            .then(AnswerSaved => {

                                                                if (AnswerSaved) {

                                                                    return res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "Successful..!!"
                                                                    });

                                                                } else {

                                                                    return res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "Something went wrong. Please try again..!!"
                                                                    });

                                                                }

                                                            })
                                                            .catch(err => {
                                                                console.log(err);

                                                                return res.status(200).json({
                                                                    statusCode: "0",
                                                                    message: "Something went wrong. Please try again..!!"
                                                                });

                                                            });

                                                    } else {
                                                        return res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Something went wrong. Please try again..!!"
                                                        });
                                                    }

                                                })
                                                .catch(err => {
                                                    console.log(err);

                                                    return res.status(200).json({
                                                        statusCode: "0",
                                                        message: "Something went wrong. Please try again..!!"
                                                    });

                                                });


                                        } else {
                                            return res.status(200).json({
                                                statusCode: "0",
                                                message: "No Record Found..!!"
                                            });
                                        }

                                    })
                                    .catch(err => {
                                        console.log(err);

                                        return res.status(200).json({
                                            statusCode: "0",
                                            message: "Something went wrong. Please try again..!!"
                                        });

                                    });

                            } else {
                                return res.status(200).json({
                                    statusCode: "0",
                                    message: "Something went wrong. Please try again..!!"
                                });
                            }

                        })
                        .catch(err => {
                            console.log(err);

                            return res.status(200).json({
                                statusCode: "0",
                                message: "Something went wrong. Please try again..!!"
                            });

                        })



                } else {

                    res.status(200).json({
                        statusCode: "0",
                        message: response.message
                    })

                }

            })
            .catch(err => {
                console.log(err);

                return res.status(200).json({
                    statusCode: "0",
                    message: err.name == "ValidationError" ? "Please fill all fields correctly..!!" : "Something went wrong. Please try again..!!"
                });

            });

    } else {
        return res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }
}
