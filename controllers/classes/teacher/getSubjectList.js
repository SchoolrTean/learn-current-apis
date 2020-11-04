const VerifyTeacher = require('../../../middleware/verifyTeacher');

const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');

const getGroupSubjects = (req, res, next) => {

    if (req.params.teacherId) {

        let teacherId = req.params.teacherId;

        VerifyTeacher(teacherId, "", (error, response) => {

            if (response && response.statusCode != "0") {

                ClassTeacherConnectionModel.find({
                    teacherId,
                    isActive: true
                }, {
                    subjects: 1,
                    secondLanguages: 1,
                    thirdLanguages: 1
                })
                    .populate('classId')
                    .exec()
                    .then(async ClassesAssignedToTeacher => {

                        console.log("gradeSubjects");
                        console.log(ClassesAssignedToTeacher)

                        if (ClassesAssignedToTeacher.length > 0) {

                            let SubjectList = [];

                            for (let index = 0; index < ClassesAssignedToTeacher.length; index++) {

                                SubjectList = [...ClassesAssignedToTeacher[index].subjects]
                                ClassesAssignedToTeacher[index].secondLanguages.length > 0 && [...ClassesAssignedToTeacher[index].secondLanguages]
                                ClassesAssignedToTeacher[index].thirdLanguages.length > 0 && [...ClassesAssignedToTeacher[index].thirdLanguages]

                            }

                            res.status(200).json({
                                statusCode: "1",
                                subjectList: [...new Set(SubjectList)],
                                message: "Data Found...!!"
                            })


                        } else {

                            res.status(200).json({
                                statusCode: "0",
                                message: "Access Denied...!!"
                            })

                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(200).json({
                            statusCode: "0",
                            message: "Something went wrong. Please try again..!!"
                        })
                    })
            } else {
                res.status(200).json({
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

module.exports = getGroupSubjects;