const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../../../middleware/verifyTeacher');
const TestPaperQuestionModel = require('../../../../../../models/questionBank/testPaper/testPaperQuestionModel')

module.exports = (req, res, next) => {

    if (req.params.teacherId && req.params.questionId) {

        let teacherId = req.params.teacherId;
        let questionId = req.params.questionId;

        VerifyTeacher(teacherId, "", async (error, response) => {//classId

            if (response && response.statusCode != "0") {//&& response.classData

                TestPaperQuestionModel.findOne({
                    _id: questionId,
                    teacherId,
                    isActive: true
                })
                    .exec()
                    .then(testPaperQuestion => {

                        if (testPaperQuestion) {

                            return res.status(200).json({
                                statusCode: "1",
                                questionId: testPaperQuestion._id,                                
                                classId: testPaperQuestion.classId, 
                                subjectName: testPaperQuestion.subjectName,
                                chapterName: testPaperQuestion.chapterName,
                                questionType: testPaperQuestion.questionType,
                                question: testPaperQuestion.question ? testPaperQuestion.question : [],
                                questionUrls: testPaperQuestion.questionUrls ? testPaperQuestion.questionUrls : [],
                                options: testPaperQuestion.options ? testPaperQuestion.options : [],
                                answer: testPaperQuestion.answer ? testPaperQuestion.answer : "",
                                marks: testPaperQuestion.marks,
                                message: "Data Found...!!"
                            });

                        } else {

                            return res.status(200).json({
                                statusCode: "0",
                                message: "No Record Found...!!"
                            });

                        }

                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(200).json({
                            statusCode: "0",
                            message: "Something went wrong. Please try again..!!"
                        })
                    })

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