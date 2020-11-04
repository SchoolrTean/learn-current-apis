const mongoose = require('mongoose');

const TestPaperModel = require('../../../../../models/questionBank/testPaper/testPaperModel');
const TestPaperQuestionModel = require('../../../../../models/questionBank/testPaper/testPaperQuestionModel');



module.exports = (req, res, next) => {

    console.log(req.body);

    if (req.body.teacherId && req.body.classId && req.body.subjectName && req.body.chapterName && req.body.testPaperTitle && req.body.questionIdsList) {

        let teacherId = req.body.teacherId;
        let classId = req.body.classId;
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
                    totalMarks += question.marks ? question.marks : 0
                }

                console.log(totalMarks);

                const NewTestPaper = new TestPaperModel({
                    _id: new mongoose.Types.ObjectId(),
                    teacherId,
                    classId,
                    subjectName,
                    chapterId,
                    chapterName,
                    testPaperTitle,
                    instructions,
                    questionsIdsAdded: questionIdsSplittedList,
                    totalMarks
                })

                NewTestPaper.save()
                    .then(TestPaperSaved => {

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



// exports.get = (req, res, next) => {

//     if (req.body.teacherId && req.body.classId && req.body.subjectId && req.body.chapterName && req.body.testPaperTitle && req.body.questionIdsList) {

//         let teacherId = req.body.teacherId;
//         let classId = req.body.classId;
//         let subjectId = req.body.subjectId; // Topic is not mandatory because we may have chapter wise exercises
//         let chapterName = req.body.chapterName;
//         let testPaperTitle = req.body.testPaperTitle;
//         let instructions = req.body.instructions;

//         let questionIdsSplittedList = questionIdsList.split('%-%');



//         const NewTestPaper = new TestPaperModel({
//             _id: new mongoose.Types.ObjectId(),
//             teacherId,
//             classId,
//             subjectId,
//             chapterName,
//             testPaperTitle,
//             instructions,
//             questionsIdsAdded: questionIdsSplittedList.toLowerCase()
//         })

//         NewTestPaper.save()
//             .then(TestPaperSaved => {

//                 return res.status(200).json({
//                     statusCode: "1",
//                     message: "Successful...!!"
//                 });

//             })
//             .catch(err => {
//                 console.log(err);
//                 return res.status(200).json({
//                     statusCode: "0",
//                     message: "Something went wrong. Please try again..!!"
//                 })
//             });

//     } else {
//         return res.status(200).json({
//             statusCode: "0",
//             message: "All fields are mandatory..!!"
//         });
//     }

// }




// exports.getChapterWiseExerciseList = (req, res, next) => {

//     if (req.params.chapterId) {

//         let chapterId = req.params.chapterId;

//         ExerciseModel.find({
//             chapterId,
//             isActive: true
//         })
//             .populate('topicId')
//             .exec()
//             .then(exerciseList => {

//                 if (exerciseList.length > 0) {

//                     let exerciseDatalist = exerciseList.map(exercise => {
//                         return {
//                             exerciseId: exercise._id,
//                             topicId: exercise.topicId ? exercise.topicId._id : "",
//                             topicName: exercise.topicId ? exercise.topicId.topicName : "",
//                             exerciseName: exercise.exerciseName
//                         }
//                     });

//                     return res.status(200).json({
//                         statusCode: "1",
//                         exerciseList: exerciseDatalist,
//                         message: "Data Found...!!"
//                     });

//                 } else {

//                     return res.status(200).json({
//                         statusCode: "0",
//                         exerciseList: [],
//                         message: "No Record Found...!!"
//                     });

//                 }

//             })
//             .catch(err => {
//                 console.log(err);
//                 return res.status(200).json({
//                     statusCode: "0",
//                     message: "Something went wrong. Please try again..!!"
//                 })
//             })

//     } else {
//         return res.status(200).json({
//             statusCode: "0",
//             message: "All fields are mandatory..!!"
//         });
//     }

// }




// exports.updateExercise = (req, res, next) => {

//     if (req.params.exerciseId && req.body.exerciseName) {

//         let exerciseId = req.params.exerciseId;
//         let exerciseName = req.body.exerciseName;

//         ExerciseModel.findOne({
//             _id: exerciseId,
//             isActive: true
//         }).exec()
//             .then(alreadyExists => {

//                 if (alreadyExists) {

//                     ExerciseModel.updateOne({
//                         _id: exerciseId
//                     }, {
//                         $set: {
//                             exerciseName,
//                             searchableExerciseName: exerciseName.toLowerCase()
//                         }
//                     }).exec()
//                         .then(updated => {

//                             if (updated.nModified == 1) {

//                                 return res.status(200).json({
//                                     statusCode: "1",
//                                     message: "Successful...!!"
//                                 });

//                             } else {

//                                 return res.status(200).json({
//                                     statusCode: "0",
//                                     message: "Something went wrong. Please try again...!!"
//                                 });

//                             }

//                         })
//                         .catch(err => {
//                             console.log(err);
//                             return res.status(200).json({
//                                 statusCode: "0",
//                                 message: "Something went wrong. Please try again..!!"
//                             })
//                         });

//                 } else {

//                     return res.status(200).json({
//                         statusCode: "0",
//                         message: "No Record Found...!!"
//                     });

//                 }

//             })
//             .catch(err => {
//                 console.log(err);
//                 return res.status(200).json({
//                     statusCode: "0",
//                     message: "Something went wrong. Please try again..!!"
//                 })
//             })

//     } else {
//         return res.status(200).json({
//             statusCode: "0",
//             message: "All fields are mandatory..!!"
//         });
//     }

// }




// exports.deleteExercise = (req, res, next) => {

//     if (req.params.exerciseId) {

//         let exerciseId = req.params.exerciseId;

//         ExerciseModel.findOne({
//             _id: exerciseId,
//             isActive: true
//         }).exec()
//             .then(alreadyExists => {

//                 if (alreadyExists) {

//                     ExerciseQuestionAndAnswerModel.countDocuments({
//                         exerciseId,
//                         isActive: true
//                     }).exec()
//                         .then(questionsCount => {

//                             if (questionsCount == 0) {

//                                 ExerciseModel.updateOne({
//                                     _id: exerciseId,
//                                     isActive: true
//                                 }, {
//                                     $set: {
//                                         isActive: false
//                                     }
//                                 }).exec()
//                                     .then(exerciseDeleted => {

//                                         if (exerciseDeleted.nModified == 1) {
//                                             return res.status(200).json({
//                                                 statusCode: "1",
//                                                 message: "Successful..!!"
//                                             })
//                                         } else {
//                                             return res.status(200).json({
//                                                 statusCode: "0",
//                                                 message: "Something went wrong. Please try again..!!"
//                                             })
//                                         }

//                                     })
//                                     .catch(err => {
//                                         console.log(err);
//                                         return res.status(200).json({
//                                             statusCode: "0",
//                                             message: "Something went wrong. Please try again..!!"
//                                         })
//                                     });

//                             } else {

//                                 return res.status(200).json({
//                                     statusCode: "0",
//                                     message: "Something went wrong. Please try again...!!"
//                                 });

//                             }

//                         })
//                         .catch(err => {
//                             console.log(err);
//                             return res.status(200).json({
//                                 statusCode: "0",
//                                 message: "Something went wrong. Please try again..!!"
//                             })
//                         });

//                 } else {

//                     return res.status(200).json({
//                         statusCode: "0",
//                         message: "No Record Found...!!"
//                     });

//                 }

//             })
//             .catch(err => {
//                 console.log(err);
//                 return res.status(200).json({
//                     statusCode: "0",
//                     message: "Something went wrong. Please try again..!!"
//                 })
//             })

//     } else {
//         return res.status(200).json({
//             statusCode: "0",
//             message: "All fields are mandatory..!!"
//         });
//     }

// }