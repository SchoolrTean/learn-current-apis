const VerifyTeacher = require('../../../../../middleware/verifyTeacher');
const AssignmentModel = require('../../../../../models/assignment/assignmentModel')
const WorkSheetModel = require('../../../../../models/questionBank/worksheet/workSheetModel');
// const WorkSheetQuestionModel = require('../../../../../models/questionBank/worksheet/workSheetQuestionModel');
const WorkSheetUserAnswerModel = require('../../../../../models/user/workSheetUserAnswerModel');



module.exports = (req, res, next) => {

    if (req.params.teacherId && req.params.classId && req.params.assignmentId && req.params.studentId && req.params.workSheetId) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let assignmentId = req.params.assignmentId;
        let studentId = req.params.studentId;
        let workSheetId = req.params.workSheetId;

        VerifyTeacher(teacherId, classId, (error, response) => {

            if (response && response.statusCode != "0") {

                AssignmentModel.findOne({
                    _id: assignmentId,
                    groupId: classId,
                    sectionType: "HomeWork",
                    teacherDeleteAllStatus: false,
                    teacherDeleteStatus: false,
                    isActive: true
                })
                    .then(async result => {

                        console.log(result);

                        if (result) {

                            WorkSheetModel.findOne({
                                _id: workSheetId,
                                isActive: true
                            })
                                .populate('classId')
                                .populate('questionsIdsAdded', 'classId subjectName chapterName questionType question questionUrls options answer')
                                .exec()
                                .then(async WorkSheet => {
                                    console.log(WorkSheet)

                                    if (WorkSheet) {

                                        let questionsArray = [];

                                        let UserAnswers = await WorkSheetUserAnswerModel.find({
                                            workSheetId: workSheetId,
                                            assignmentId,
                                            userId : studentId,
                                            isActive: true
                                        }).exec()

                                        let answerList = [];
                                        let answeredQuestionIdList = [];

                                        if (UserAnswers.length > 0) {

                                            answerList = UserAnswers.map(answerData => {

                                                answeredQuestionIdList.push(String(answerData.workSheetQuestionId));

                                                return {
                                                    userAnswerId: answerData._id,
                                                    userAnswer: answerData.answer,
                                                    userAnswerUrls: answerData.answerUrls
                                                }

                                            });

                                        }



                                        if (WorkSheet.questionsIdsAdded.length > 0) {


                                            questionsArray = WorkSheet.questionsIdsAdded.map(question => {


                                                let checkAnswered = answeredQuestionIdList.indexOf(String(question._id))

                                                if (checkAnswered == -1) {

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

                                                        userAnswerId: "",
                                                        userAnswer: "",
                                                        userAnswerUrls: []
                                                    }

                                                } else {

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

                                                        userAnswerId: answerList[checkAnswered].userAnswerId,
                                                        userAnswer: answerList[checkAnswered].userAnswer,
                                                        userAnswerUrls: answerList[checkAnswered].userAnswerUrls
                                                    }

                                                }

                                            })

                                        }

                                        res.status(200).json({
                                            statusCode: 1,
                                            subjectName: WorkSheet.subjectName,
                                            chapterName: WorkSheet.chapterName,
                                            testPaperTitle: WorkSheet.testPaperTitle,
                                            instructions: WorkSheet.instructions,
                                            class: WorkSheet.classId.grade + " " + WorkSheet.classId.section,
                                            questionCount: WorkSheet.questionsIdsAdded.length,
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
                            res.status(200).json({
                                statusCode: "0",
                                message: "No Record Found..!!"
                            });
                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(200).json({
                            statusCode: "0",
                            message: "Something went wrong. Please try again..!!"
                        })
                    });
            } else {
                res.status(200).json({
                    statusCode: "0",
                    message: error.message
                })
            }
        })

    } else {
        res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }
}



// WorkSheetModel.findOne({
//     _id: workSheetId,
//     isActive: true
// })
//     .populate('classId')
//     .then(workSheetData => {


//         let WorkSheetQuestions = WorkSheetQuestionModel.find({
//             _id: {
//                 $in: workSheetData.questionsIdsAdded
//             },
//             isActive: true
//         })


//         let WorkSheetUserAnswers = WorkSheetUserAnswerModel.find({
//             userId: studentId,
//             workSheetId,
//             workSheetQuestionId: {
//                 $in: workSheetData.questionsIdsAdded
//             },
//             isActive: true
//         })

//         Promise.all([WorkSheetQuestions, WorkSheetUserAnswers])
//             .then(workSheetData => {

//                 let answeredList = [];
//                 let questionAndAnsweredList = [];

//                 if (workSheetData[1].length > 0) {
//                     answeredList = workSheetData[1].map(answer => answer._id);
//                 }

//                 if (workSheetData[0].length > 0) {

//                     for (let index = 0; index < workSheetData[0].length; index++) {
//                         const workSheetQuestion = workSheetData[0][index];

//                         let checkAnswered = answeredList.indexOf()

//                         if (checkAnswered == -1) {

//                             questionAndAnsweredList.push({

//                             })

//                             return {
//                                 "questionId": question._id,
//                                 "classId": question.classId,
//                                 "subjectName": question.subjectName,
//                                 "chapterName": question.chapterName,

//                                 "questionId": question._id,
//                                 "questionType": question.questionType ? question.questionType : "",
//                                 "question": question.question ? question.question : "",
//                                 "questionUrls": question.questionUrls ? question.questionUrls : [],

//                                 "options": question.options ? question.options : [],
//                                 "answer": question.answer ? question.answer : "",


//                                 userAnswerId: "",
//                                 userAnswer: "",
//                                 userAnswerUrls: []
//                             }

//                         } else {


//                             questionAndAnsweredList.push({

//                             })

//                             return {
//                                 "questionId": question._id,
//                                 "classId": question.classId,
//                                 "subjectName": question.subjectName,
//                                 "chapterName": question.chapterName,

//                                 "questionId": question._id,
//                                 "questionType": question.questionType ? question.questionType : "",
//                                 "question": question.question ? question.question : "",
//                                 "questionUrls": question.questionUrls ? question.questionUrls : [],

//                                 "options": question.options ? question.options : [],
//                                 "answer": question.answer ? question.answer : "",


//                                 userAnswerId: answerList[checkAnswered].userAnswerId,
//                                 userAnswer: answerList[checkAnswered].userAnswer,
//                                 userAnswerUrls: answerList[checkAnswered].userAnswerUrls
//                             }

//                         }

//                     }

//                 }



//             })
//             .catch(err => {
//                 console.log(err)
//                 res.status(200).json({
//                     statusCode: "0",
//                     message: "Something went wrong. Please try again..!!"
//                 })
//             })
//     })
//     .catch(err => {
//         console.log(err)
//         res.status(200).json({
//             statusCode: "0",
//             message: "Something went wrong. Please try again..!!"
//         })
//     })

