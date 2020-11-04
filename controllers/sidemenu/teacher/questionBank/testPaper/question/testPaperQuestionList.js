const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../../../middleware/verifyTeacher');
const TestPaperQuestionModel = require('../../../../../../models/questionBank/testPaper/testPaperQuestionModel')

module.exports = (req, res, next) => {

    if (req.params.teacherId && req.params.classId && req.body.subjectName) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let subjectName = req.body.subjectName;
        let chapterName = req.body.chapterName;

        VerifyTeacher(teacherId, "", async (error, response) => {//classId

            if (response && response.statusCode != "0") {//&& response.classData

                let query = {
                    teacherId,
                    classId,
                }

                if (subjectName) {
                    query.subjectName = subjectName.toLowerCase()
                }

                if (chapterName) {
                    query.chapterName = chapterName.toLowerCase()
                }

                TestPaperQuestionModel.find(query)
                    .exec()
                    .then(testPaperQuestions => {

                        if (testPaperQuestions.length > 0) {

                            let testPaperQuestionDataList = testPaperQuestions.map(testPaperQuestion => {
                                return {
                                    questionId: testPaperQuestion._id,
                                    questionType: testPaperQuestion.questionType,
                                    question: testPaperQuestion.question ? testPaperQuestion.question : [],
                                    questionUrls: testPaperQuestion.questionUrls ? testPaperQuestion.questionUrls : [],
                                    options: testPaperQuestion.options ? testPaperQuestion.options : [],
                                    answer: testPaperQuestion.answer ? testPaperQuestion.answer : "",
                                    marks: testPaperQuestion.marks,
                                    isSelected: "false"
                                }
                            });

                            return res.status(200).json({
                                statusCode: "1",
                                testPaperQuestionList: testPaperQuestionDataList,
                                message: "Data Found...!!"
                            });

                        } else {

                            return res.status(200).json({
                                statusCode: "0",
                                testPaperQuestionList: [],
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