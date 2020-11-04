const UserModel = require('../../../models/authentication/userModel');

const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');

const getGroupSubjects = (req, res, next) => {

    if (req.params.studentId) {

        let studentId = req.params.studentId;

        UserModel.findOne({
            _id: studentId,
            type: 1,
            isActive: true
        })
            .exec()
            .then(studentDetails => {

                if (studentDetails) {

                    ClassStudentConnectionModel.find({
                        studentId,
                        isActive: true
                    }, {
                        subjects: 1,
                        secondLanguage: 1,
                        thirdLanguage: 1
                    })
                        .populate('classId')
                        .exec()
                        .then(async studentAssignedClasses => {

                            console.log("gradeSubjects");
                            console.log(studentAssignedClasses)

                            if (studentAssignedClasses.length > 0) {

                                let SubjectList = [];

                                for (let index = 0; index < studentAssignedClasses.length; index++) {

                                    SubjectList = studentAssignedClasses[index].subjects.length > 0 ? [...studentAssignedClasses[index].subjects] : SubjectList
                                    studentAssignedClasses[index].secondLanguage && SubjectList.push(studentAssignedClasses[index].secondLanguage)
                                    studentAssignedClasses[index].thirdLanguage && SubjectList.push(studentAssignedClasses[index].thirdLanguage)

                                }

                                let uniqueSubjectList = [];

                                if (SubjectList.length > 0) {
                                    uniqueSubjectList = [...new Set(SubjectList)]
                                    uniqueSubjectList.push("All")
                                }

                                res.status(200).json({
                                    statusCode: "1",
                                    SubjectList: uniqueSubjectList,
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
                        message: "Access Denied..!!"
                    })
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
        return res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }

}

module.exports = getGroupSubjects;




// SubjectList = [...studentAssignedClasses[index].subjects, studentAssignedClasses[index].secondLanguage, studentAssignedClasses[index].thirdLanguage]

// if (ClassesAssignedToTeacher[index].subjects.length > 0) {

//     for (let index1 = 0; index1 < ClassesAssignedToTeacher[index].subjects.length; index1++) {

//         SubjectList

//         SubjectWiseClassList.push({
//             classId: ClassesAssignedToTeacher[index].classId._id,
//             className: ClassesAssignedToTeacher[index].classId.grade + " " + ClassesAssignedToTeacher[index].classId.section,
//             subjectName: ClassesAssignedToTeacher[index].subjects[index1],
//         })
//     }

// }

// if (ClassesAssignedToTeacher[index].secondLanguages.length > 0) {

//     for (let index1 = 0; index1 < ClassesAssignedToTeacher[index].secondLanguages.length; index1++) {
//         SubjectWiseClassList.push({
//             classId: ClassesAssignedToTeacher[index].classId._id,
//             className: ClassesAssignedToTeacher[index].classId.grade + " " + ClassesAssignedToTeacher[index].classId.section,
//             subjectName: ClassesAssignedToTeacher[index].secondLanguages[index1],
//         })
//     }

// }

// if (ClassesAssignedToTeacher[index].thirdLanguages.length > 0) {

//     for (let index1 = 0; index1 < ClassesAssignedToTeacher[index].thirdLanguages.length; index1++) {
//         SubjectWiseClassList.push({
//             classId: ClassesAssignedToTeacher[index].classId._id,
//             className: ClassesAssignedToTeacher[index].classId.grade + " " + ClassesAssignedToTeacher[index].classId.section,
//             subjectName: ClassesAssignedToTeacher[index].thirdLanguages[index1],
//         })
//     }

// }