const mongoose = require('mongoose');


const VerifyTeacher = require('../../../../../../middleware/verifyTeacher');

const TestPaperQuestionModel = require('../../../../../../models/questionBank/testPaper/testPaperQuestionModel')
// const GetSubjectId = require('../../../../../admin/master/academics/subject/getAndSaveNewSubject')



module.exports = (req, res, next) => {

    if (req.params.teacherId && req.params.classId && req.params.questionId) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let questionId = req.params.questionId;

        VerifyTeacher(teacherId, classId, async (error, response) => {

            if (response && response.statusCode != "0" && response.classData) {

                TestPaperQuestionModel.findOne({
                    _id: questionId,
                    isActive: true
                })
                    .then(QuestionFound => {

                        console.log(QuestionFound);

                        if (QuestionFound) {

                            TestPaperQuestionModel.updateOne({
                                _id: questionId,
                                isActive: true
                            }, {
                                $set: {
                                    isActive: false
                                }
                            })
                                .then(QuestionUpdated => {

                                    console.log(QuestionSaved);

                                    if (QuestionUpdated) {

                                        return res.status(200).json({
                                            statusCode: "1",
                                            message: "Successful...!!"
                                        });

                                    } else {

                                        return res.status(200).json({
                                            statusCode: "0",
                                            message: "Something went wrong. Please try again..!!"
                                        })

                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                    return res.status(200).json({
                                        statusCode: "0",
                                        message: "Something went wrong. Please try again..!!"
                                    })
                                });

                        } else {

                            return res.status(200).json({
                                statusCode: "0",
                                message: "No Record Found..!!"
                            })

                        }
                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(200).json({
                            statusCode: "0",
                            message: "Something went wrong. Please try again..!!"
                        })
                    });

            } else {
                res.status(200).json({
                    "statusCode": "0",
                    "message": error.message
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


