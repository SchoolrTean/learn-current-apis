const MindBoxQuestionModel = require('../../../../models/mindBox/mindBoxQuestionModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');


module.exports = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.params.questionId) {

            let teacherId = req.params.teacherId;
            let questionId = req.params.questionId;
            let classId = req.params.groupId;

            VerifyTeacher(teacherId, classId, (error, response) => {

                  // console.log(error);
                  // console.log(response);

                  if (response && response.statusCode != "0" && response.classData) {

                        MindBoxQuestionModel.findOne({
                                    _id: questionId,
                                    questionType: 1,
                                    deletedUsers: {
                                          $ne: teacherId
                                    },
                                    questionDeletedStatus: false,
                                    isActive: true
                              }, {
                                    userId: 1,
                                    groupId: 1,
                                    subjectName: 1,

                                    question: 1,
                                    questionUrls: 1,
                                    answer: 1,

                                    multipleChoiceAnswers: 1,
                                    selectedCorrectAnswer: 1,

                                    questionType: 1,
                              })
                              .exec()
                              .then(mindBoxRecord => {

                                    console.log(mindBoxRecord);

                                    if (mindBoxRecord) {

                                          res.status(200).json({
                                                statusCode: "1",
                                                id: mindBoxRecord._id,
                                                groupId: mindBoxRecord.groupId,//mindBoxRecord.groupId._id

                                                subjectName: mindBoxRecord.subjectName,

                                                question: mindBoxRecord.question,
                                                questionUrls: mindBoxRecord.questionUrls ? mindBoxRecord.questionUrls : "",

                                                questionType: String(mindBoxRecord.questionType),
                                                multipleChoiceAnswers: mindBoxRecord.multipleChoiceAnswers ? mindBoxRecord.multipleChoiceAnswers.split('%-%') : [],

                                                correctAnswer: mindBoxRecord.multipleChoiceAnswers ? String(mindBoxRecord.selectedCorrectAnswer) : "",
                                                message: "Data Found..!!"
                                          })

                                    } else {
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "No Records Found..!!"
                                          })
                                    }

                              })
                              .catch(err => {
                                    console.log(err)
                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong...!!"
                                    })

                              })

                  } else {

                        return res.status(200).json({
                              statusCode: "0",
                              message: error.message
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