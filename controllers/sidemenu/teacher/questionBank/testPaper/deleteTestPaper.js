const mongoose = require('mongoose');

const TestPaperModel = require('../../../../../models/questionBank/testPaper/testPaperModel');
const TestPaperQuestionModel = require('../../../../../models/questionBank/testPaper/testPaperQuestionModel');



module.exports = (req, res, next) => {

    console.log(req.body);

    if (req.params.teacherId && req.params.classId && req.params.testPaperId) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let testPaperId = req.params.testPaperId;

        TestPaperModel.findOne({
            _id: testPaperId,
            isActive: true
        })
            .exec()
            .then(testPaper => {

                if (testPaper) {

                    TestPaperModel.updateOne({
                        _id: testPaperId
                    }, {
                        $set: {
                            isActive: false
                        }
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

