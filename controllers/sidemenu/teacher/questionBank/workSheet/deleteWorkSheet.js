const mongoose = require('mongoose');

const WorkSheetModel = require('../../../../../models/questionBank/worksheet/workSheetModel');
const WorkSheetQuestionModel = require('../../../../../models/questionBank/worksheet/workSheetQuestionModel');



module.exports = (req, res, next) => {

    console.log(req.body);

    if (req.params.teacherId && req.params.classId && req.params.workSheetId) {

        let teacherId = req.params.teacherId;
        let classId = req.params.classId;
        let workSheetId = req.params.workSheetId;

        WorkSheetModel.findOne({
            _id: workSheetId,
            isActive: true
        })
            .exec()
            .then(testPaper => {

                if (testPaper) {

                    WorkSheetModel.updateOne({
                        _id: workSheetId
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

