const mongoose = require('mongoose');

const TestPaperModel = require('../../../../../models/questionBank/testPaper/testPaperModel');
const TestPaperQuestionModel = require('../../../../../models/questionBank/testPaper/testPaperQuestionModel');



module.exports = (req, res, next) => {

    console.log(req.body);

    if (req.params.teacherId && req.params.classId && req.params.testPaperId && req.body.subjectName && req.body.chapterName && req.body.testPaperTitle && req.body.questionIdsList) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let testPaperId = req.params.testPaperId;
        let subjectName = req.body.subjectName ? req.body.subjectName.toLowerCase() : "";
        let chapterId = req.body.chapterId;
        let chapterName = req.body.chapterName ? req.body.chapterName.toLowerCase() : "";
        let testPaperTitle = req.body.testPaperTitle;
        let instructions = req.body.instructions;

        let questionIdsSplittedList = req.body.questionIdsList.split('%-%');

        TestPaperQuestionModel.find({
            _id: {
                $in: questionIdsSplittedList
            },
            isActive: true
        })
            .exec()
            .then(questionsList => {

                let totalMarks = 0;

                for (let index = 0; index < questionsList.length; index++) {
                    const question = questionsList[index];
                    totalMarks += question.marks
                }

                TestPaperModel.updateOne({
                    _id: testPaperId,
                    teacherId,
                    classId,
                    subjectName,
                    chapterId,
                    chapterName,
                    testPaperTitle,
                    instructions,
                    questionsIdsAdded: questionIdsSplittedList,
                    totalMarks
                }).exec()
                    .then(TestPaperUpdated => {

                        return res.status(200).json({
                            statusCode: "1",
                            message: "Successful...!!"
                        });

                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(200).json({
                            statusCode: "0",
                            message: "Something went wrong. Please try again..!!"
                        })
                    });


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
            message: "All fields are mandatory..!!"
        });
    }

}

