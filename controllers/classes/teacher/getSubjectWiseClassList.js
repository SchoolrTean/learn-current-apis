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

                            let SubjectWiseClassList = [];

                            for (let index = 0; index < ClassesAssignedToTeacher.length; index++) {

                                if (ClassesAssignedToTeacher[index].subjects.length > 0) {

                                    for (let index1 = 0; index1 < ClassesAssignedToTeacher[index].subjects.length; index1++) {
                                        SubjectWiseClassList.push({
                                            classId: ClassesAssignedToTeacher[index].classId._id,
                                            className: ClassesAssignedToTeacher[index].classId.grade + " " + ClassesAssignedToTeacher[index].classId.section,
                                            subjectName: ClassesAssignedToTeacher[index].subjects[index1],
                                        })
                                    }

                                }

                                if (ClassesAssignedToTeacher[index].secondLanguages.length > 0) {

                                    for (let index1 = 0; index1 < ClassesAssignedToTeacher[index].secondLanguages.length; index1++) {
                                        SubjectWiseClassList.push({
                                            classId: ClassesAssignedToTeacher[index].classId._id,
                                            className: ClassesAssignedToTeacher[index].classId.grade + " " + ClassesAssignedToTeacher[index].classId.section,
                                            subjectName: ClassesAssignedToTeacher[index].secondLanguages[index1],
                                        })
                                    }

                                }

                                if (ClassesAssignedToTeacher[index].thirdLanguages.length > 0) {

                                    for (let index1 = 0; index1 < ClassesAssignedToTeacher[index].thirdLanguages.length; index1++) {
                                        SubjectWiseClassList.push({
                                            classId: ClassesAssignedToTeacher[index].classId._id,
                                            className: ClassesAssignedToTeacher[index].classId.grade + " " + ClassesAssignedToTeacher[index].classId.section,
                                            subjectName: ClassesAssignedToTeacher[index].thirdLanguages[index1],
                                        })
                                    }

                                }
                            }

                            SubjectWiseClassList.push({
                                classId: "",
                                className: "",
                                subjectName: "All"
                            })

                            res.status(200).json({
                                statusCode: "1",
                                SubjectWiseClassList,
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