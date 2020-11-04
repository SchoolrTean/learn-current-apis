const VerifyStudent = require('../../../../middleware/verifyStudent');

const WorkSheetModel = require('../../../../models/questionBank/worksheet/workSheetModel');
const WorkSheetUserAnswerModel = require('../../../../models/user/workSheetUserAnswerModel')

module.exports = (req, res) => {

    if (req.params.studentId && req.params.homeWorkId && req.params.workSheetId) {

        let userId = req.params.studentId;
        let assignmentId = req.params.homeWorkId;
        let workSheetId = req.params.workSheetId;

        VerifyStudent(userId, "")
            .then(response => {

                if (response && response.statusCode != "0") {

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
                                    userId,
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
                                        // answerList.push()

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

                    return res.status(200).json({
                        statusCode: "0",
                        message: !userRegistered ? "Access Denied..!!" : userRegistered && userRegistered.isConfirmed == false ? "Please Confirm your account..!!" : "Please Activate Your Account...!!"
                    });

                }

            })
            .catch(err => {
                console.log(err);

                return res.status(200).json({
                    statusCode: "0",
                    message: err.name == "ValidationError" ? "Please fill all fields correctly..!!" : "Something went wrong. Please try again..!!"
                });

            });

    } else {
        return res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }

}

