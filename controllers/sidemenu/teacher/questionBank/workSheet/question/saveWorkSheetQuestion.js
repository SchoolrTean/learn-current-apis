const mongoose = require('mongoose');


const VerifyTeacher = require('../../../../../../middleware/verifyTeacher');

const WorkSheetQuestionModel = require('../../../../../../models/questionBank/worksheet/workSheetQuestionModel')
// const GetSubjectId = require('../../../../../admin/master/academics/subject/getAndSaveNewSubject')



module.exports = (req, res, next) => {

    let questionUrl = "";
    let answer1Url = "";
    let answer2Url = "";
    let answer3Url = "";

    if (req.files['questionImage'] && req.files['questionImage'].length == 1) {
        questionUrl = req.files['questionImage'][0].path.replace(/\\/g, '/');
    }

    if (req.files['answer1Image'] && req.files['answer1Image'].length > 0) {
        answer1Url = req.files['answer1Image'][0].path.replace(/\\/g, '/');
    }

    if (req.files['answer2Image'] && req.files['answer2Image'].length > 0) {
        answer2Url = req.files['answer2Image'][0].path.replace(/\\/g, '/');
    }

    if (req.files['answer3Image'] && req.files['answer3Image'].length > 0) {
        answer3Url = req.files['answer3Image'][0].path.replace(/\\/g, '/');
    }


    if (req.body.teacherId && req.body.classId && req.body.subjectName && req.body.chapterName && req.body.questionType < 4 && (req.body.question || questionUrl) &&
        ((req.body.questionType == 1 && ((req.body.answer1 || answer1Url) && (req.body.answer2 || answer2Url)) && req.body.selectedAnswer) ||  //MCQ 
            (req.body.questionType == 2 && req.body.answers) || req.body.questionType == 3) //Blanks or short answer
    ) {

        let teacherId = req.body.teacherId;
        let classId = req.body.classId;
        let subjectName = req.body.subjectName; // Topic is not mandatory because we may have chapter wise exercises
        let chapterName = req.body.chapterName;
        let questionType = req.body.questionType;
        let question = req.body.question;
        let options = [];

        if (questionType == 1) {

            if (req.body.answer1 || answer1Url) {
                options.push(req.body.answer1 ? req.body.answer1 : answer1Url)
            }


            if (req.body.answer2 || answer2Url) {
                options.push(req.body.answer2 ? req.body.answer2 : answer2Url)
            }


            if (req.body.answer3 || answer3Url) {
                options.push(req.body.answer3 ? req.body.answer3 : answer3Url)
            }

        } else if (questionType == 2) {
            options = req.body.answers.split('%-%')
        }

        let answer = req.body.selectedAnswer;

        VerifyTeacher(teacherId, classId, async (error, response) => {

            if (response && response.statusCode != "0" && response.classData) {

                // let subjectId = await GetSubjectId(subjectName, teacherId)

                const NewQuestion = new WorkSheetQuestionModel({
                    _id: new mongoose.Types.ObjectId(),
                    teacherId,
                    classId,
                    subjectName: subjectName.toLowerCase(),
                    chapterName: chapterName.toLowerCase(),
                    questionType,
                    question,
                    options,
                    answer,
                })

                if (questionUrl) {
                    NewQuestion.questionUrls = [questionUrl];
                }

                NewQuestion.save()
                    .then(QuestionSaved => {

                        console.log(QuestionSaved);

                        if (QuestionSaved) {

                            if (QuestionSaved) {

                                return res.status(200).json({
                                    statusCode: "1",
                                    questionId : QuestionSaved._id,
                                    questionType: QuestionSaved.questionType ,
                                    subjectName: QuestionSaved.subjectName,
                                    chapterName: QuestionSaved.chapterName,
                                    question: QuestionSaved.question ? QuestionSaved.question : "",
                                    questionUrls: QuestionSaved.questionUrls ? QuestionSaved.questionUrls : [],
                                    options: QuestionSaved.options ? QuestionSaved.options : [],
                                    answer: QuestionSaved.answer ? QuestionSaved.answer : "",
                                    message: "Successful...!!"
                                });

                            } else {

                                return res.status(200).json({
                                    statusCode: "0",
                                    message: "Something went wrong. Please try again..!!"
                                })

                            }

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


