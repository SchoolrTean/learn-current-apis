const mongoose = require('mongoose');

const VerifyTeacher = require('../../../../../middleware/verifyTeacher');

const GradeModel = require('../../../../../models/admin/master/academic/gradesModel')
const SubjectsModel = require('../../../../../models/admin/master/academic/subjectsModel')
const TestPaperModel = require('../../../../../models/questionBank/testPaper/testPaperModel');
const TestPaperQuestionModel = require('../../../../../models/questionBank/testPaper/testPaperQuestionModel');



module.exports = (req, res, next) => {

    if (req.params.teacherId) {

        let teacherId = req.params.teacherId;

        TestPaperModel.find({
            teacherId,
            isActive: true
        })
            .populate('classId')
            .exec()
            .then(TestPapers => {

                let testPaperList = [];

                for (let index = 0; index < TestPapers.length; index++) {
                    const TestPaper = TestPapers[index];

                    testPaperList.push({
                        testPaperId : TestPaper._id,
                        classId : TestPaper.classId._id,
                        subjectName: TestPaper.subjectName,
                        chapterName: TestPaper.chapterName,
                        testPaperTitle: TestPaper.testPaperTitle,
                        instructions: TestPaper.instructions,
                        class: TestPaper.classId.grade + " " + TestPaper.classId.section,
                        questionCount: TestPaper.questionsIdsAdded.length,
                        totalMarks:TestPaper.totalMarks,
                        date:TestPaper.date,
                        isSelected: false
                    })

                }

                return res.status(200).json({
                    statusCode: "1",
                    testPaperList,
                    message: "Data Found..!!"
                })

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
