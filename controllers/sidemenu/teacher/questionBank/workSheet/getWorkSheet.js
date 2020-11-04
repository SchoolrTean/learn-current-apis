const WorkSheetModel = require('../../../../../models/questionBank/worksheet/workSheetModel');


module.exports = (req, res, next) => {

    console.log(req.params);

    if (req.params.teacherId && req.params.classId && req.params.workSheetId) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let workSheetId = req.params.workSheetId;

        WorkSheetModel.findOne({
            _id: workSheetId,
            teacherId,
            classId,
            isActive: true
        })
            .populate('classId')
            .populate('questionsIdsAdded', 'classId subjectName chapterName questionType question questionUrls options answer marks')
            .exec()
            .then(TestPaper => {
                console.log(TestPaper)

                if (TestPaper) {

                    let questionsArray = [];

                    if (TestPaper.questionsIdsAdded.length > 0) {

                        questionsArray = TestPaper.questionsIdsAdded.map(question => {
                            return {
                                "questionId": question._id,                                
                                "classId": question.classId,
                                "subjectName": question.subjectName,
                                "chapterName": question.chapterName,
                                
                                "questionId": question._id,
                                "questionType": question.questionType ? question.questionType : "",
                                "question": question.question ? question.question : "",
                                "questionUrls": question.questionUrls ? question.questionUrls : [],

                                "options": question.options ? question.options : [],
                                "answer": question.answer ? question.answer : "",
                            }
                        })

                    }

                    res.status(200).json({
                        statusCode: 1,
                        subjectName: TestPaper.subjectName,
                        chapterName: TestPaper.chapterName,
                        testPaperTitle: TestPaper.testPaperTitle,
                        instructions: TestPaper.instructions,
                        class: TestPaper.classId.grade + " " + TestPaper.classId.section,
                        questionCount: TestPaper.questionsIdsAdded.length,
                        totalMarks: TestPaper.totalMarks,
                        questions: questionsArray,
                        message: "Data Found..!!"
                    })

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
        return res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }

}

