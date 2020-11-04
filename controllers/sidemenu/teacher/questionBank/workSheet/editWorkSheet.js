const mongoose = require('mongoose');

const WorkSheetModel = require('../../../../../models/questionBank/worksheet/workSheetModel');
const WorkSheetQuestionModel = require('../../../../../models/questionBank/worksheet/workSheetQuestionModel');



module.exports = (req, res, next) => {

    console.log(req.body);

    if (req.params.teacherId && req.params.classId && req.params.workSheetId && req.body.subjectName && req.body.chapterName && req.body.testPaperTitle && req.body.questionIdsList) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let workSheetId = req.params.workSheetId;
        let subjectName = req.body.subjectName ? req.body.subjectName.toLowerCase() : "";
        let chapterId = req.body.chapterId;
        let chapterName = req.body.chapterName ? req.body.chapterName.toLowerCase() : "";
        let testPaperTitle = req.body.testPaperTitle;
        let instructions = req.body.instructions;

        let questionIdsSplittedList = req.body.questionIdsList.split('%-%');


        WorkSheetModel.updateOne({
            _id: workSheetId,
            teacherId,
            classId,
            subjectName,
            chapterId,
            chapterName,
            testPaperTitle,
            instructions,
            questionsIdsAdded: questionIdsSplittedList,
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


    } else {
        return res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }

}

