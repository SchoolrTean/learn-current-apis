const TestPaperModel = require('../../../../../models/questionBank/testPaper/testPaperModel');


module.exports = (req, res, next) => {

    console.log(req.params);

    if (req.params.teacherId && req.params.classId && req.params.testPaperId) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let testPaperId = req.params.testPaperId;

        TestPaperModel.findOne({
            _id: testPaperId,
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
                                "questionType": question.questionType ? question.questionType : "",
                                "question": question.question ? question.question : "",
                                "questionUrls": question.questionUrls ? question.questionUrls : [],

                                "options": question.options ? question.options : [],
                                "answer": question.answer ? question.answer : "",
                                "marks": question.marks ? question.marks : 0,
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

