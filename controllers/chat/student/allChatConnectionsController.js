const UserModel = require('../../../models/authentication/userModel');
const ClassStudentConnectinoModel = require('../../../models/classes/classStudentConnectionModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');


/**
 * Get all messages thta teacher received based on group.
 * These messages may contain broadcast, individual, reply and join Messages
 */
module.exports = (req, res, next) => { //, upload.any('messageDocument')

    if (req.params.studentId) {

        let studentId = req.params.studentId;


        //Verify Teacher and Grade
        UserModel.findOne({
            _id: studentId,
            type: 1, // 1- Student
            isActive: true
        }).exec()
            .then(student => {

                console.log(student);

                if (student) {

                    ClassStudentConnectinoModel.find({
                        studentId,
                        connectionStatus: 1,
                        isActive: true
                    }).exec()
                        .then(async StudentClassConnections => {

                            console.log(StudentClassConnections)

                            if (StudentClassConnections.length > 0) {

                                let teacherListQuery = [];

                                let ClassesList = [];

                                for (let index = 0; index < StudentClassConnections.length; index++) {

                                    const StudentClassConnection = StudentClassConnections[index];

                                    let subjectClassObj = {
                                        "$and": [
                                            {
                                                "classId": StudentClassConnection.classId,
                                                "$or": [{
                                                    "subjects": { $in: StudentClassConnection.subjects }
                                                }, {
                                                    "secondLanguages": StudentClassConnection.secondLanguage
                                                }, {
                                                    "thirdLanguages": StudentClassConnection.thirdLanguage
                                                }]
                                            }
                                        ]
                                    }

                                    teacherListQuery.push(subjectClassObj);

                                    ClassesList.push(StudentClassConnection.classId);

                                }

                                let TeacherConnectionList = ClassTeacherConnectionModel.find({
                                    $or: teacherListQuery,
                                    // connectionStatus: 1,
                                    isActive: true
                                }).exec()

                                let StudentConnectionList = ClassStudentConnectinoModel.find({
                                    studentId: {
                                        $ne: studentId
                                    },
                                    classId: {
                                        $in: ClassesList
                                    },
                                    connectionStatus: 1,
                                    isActive: true
                                }).exec()

                                console.log(TeacherConnectionList)
                                console.log(StudentConnectionList)

                                Promise.all([TeacherConnectionList, StudentConnectionList])
                                    .then(async PromiseData => {

                                        console.log(PromiseData)

                                        if (PromiseData.length == 2) {

                                            let teacherList = [];
                                            let studentList = [];

                                            if (PromiseData[0].length > 0) {
                                                teacherList = PromiseData[0].map(connection => connection.teacherId)
                                                    .filter((value, index, self) => self.indexOf(value) === index)
                                            }

                                            if (PromiseData[1].length > 0) {
                                                studentList = PromiseData[1].map(connection => connection.studentId)
                                                    .filter((value, index, self) => self.indexOf(value) === index)
                                            }

                                            console.log(teacherList)
                                            console.log(studentList)

                                            let teacherRecords = [];
                                            let studentRecords = [];

                                            if (teacherList.length > 0) {

                                                teacherRecords = await UserModel.find({
                                                    _id: {
                                                        $in: teacherList
                                                    },
                                                    type: 0,
                                                    isActive: true
                                                })

                                            }

                                            if (studentList.length > 0) {

                                                studentRecords = await UserModel.find({
                                                    _id: {
                                                        $in: studentList
                                                    },
                                                    type: 1,
                                                    isActive: true
                                                })

                                            }

                                            console.log(teacherRecords)
                                            console.log(studentRecords)

                                            let TeacherChatList = [];
                                            let StudentChatList = [];

                                            if (teacherRecords.length > 0) {

                                                for (let index = 0; index < teacherRecords.length; index++) {
                                                    const teacher = teacherRecords[index];

                                                    TeacherChatList.push({
                                                        receiverId: teacher._id,
                                                        receiverFirstName: teacher.firstName,
                                                        receiverSurName: teacher.surName,
                                                        receiverProfilePic: teacher.profilePic ? teacher.profilePic : "",
                                                        recieverStatus: "",
                                                        isSelected: "false"
                                                    })

                                                }

                                            }

                                            if (studentRecords.length > 0) {

                                                for (let index = 0; index < studentRecords.length; index++) {
                                                    const teacher = studentRecords[index];

                                                    StudentChatList.push({
                                                        receiverId: teacher._id,
                                                        receiverFirstName: teacher.firstName,
                                                        receiverSurName: teacher.surName,
                                                        receiverProfilePic: teacher.profilePic ? teacher.profilePic : "",
                                                        recieverStatus: "",
                                                        isSelected: "false"
                                                    })

                                                }

                                            }

                                            res.status(200).json({
                                                statusCode: (TeacherChatList.length > 0 || StudentChatList.length > 0) ? "1" : "0",
                                                TeacherChatList,
                                                StudentChatList,
                                                message: (TeacherChatList.length > 0 || StudentChatList.length) > 0 ? "Data Found...!!" : "No Records Found..!!"
                                            })

                                        } else {

                                            res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Please Try Later..!!"
                                            })

                                        }

                                    })
                                    .catch(err => {
                                        console.log(err)

                                        res.status(200).json({
                                            statusCode: "0",
                                            message: "Something Went Wrong. Please Try Later..!!"
                                        })

                                    })

                            } else {
                                res.status(200).json({
                                    statusCode: "0",
                                    TeacherChatList: [],
                                    StudentChatList: [],
                                    message: "No Records Found..!!"
                                })
                            }

                        })
                        .catch(err => {
                            console.log(err);

                            res.status(200).json({
                                statusCode: "0",
                                message: "Something Went Wrong. Please Try Later..!!"
                            })

                        })

                } else {
                    res.status(200).json({
                        "statusCode": "0",
                        "message": "Access Denied...!!"
                    })
                }

            })
            .catch(err => {

                console.log(err);

                res.status(200).json({
                    "statusCode": "0",
                    "message": "Something Went Wrong. Please Try Later...!!"
                })

            })

    } else {
        res.status(200).json({
            "statusCode": "0",
            "message": "All Fields are mandatory...!!"
        })

    }

}






// let OtherTeacherList = ClassTeacherConnectionModel.find({
//     classId: {
//         $in: TeacherClassesList
//     },
//     teacherId: {
//         $ne: teacherId
//     },
//     isActive: true
// })
//     .populate('classId')
//     .populate('teacherId')
//     .exec()

// Promise.all([OtherTeacherList, PromiseInputData])
//     .then(NewPromiseData => {

//         console.log(NewPromiseData)

//         if (NewPromiseData[0].length > 0) {

//             let PushedTeacherList = [];

//             for (let index = 0; index < NewPromiseData[0].length; index++) {
//                 const OtherTeacher = NewPromiseData[0][index];
//                 console.log(OtherTeacher)

//                 let checkTeacherExists = PushedTeacherList.indexOf(String(OtherTeacher.teacherId._id))

//                 if (checkTeacherExists == -1) {
//                     TeacherList.push({
//                         receiverId: OtherTeacher.teacherId._id,
//                         receiverFirstName: OtherTeacher.teacherId.firstName,
//                         receiverSurName: OtherTeacher.teacherId.surName,
//                         receiverProfilePic: OtherTeacher.teacherId.profilePic ? OtherTeacher.teacherId.profilePic : "",
//                         recieverStatus: OtherTeacher.classId.grade + " " + OtherTeacher.classId.section + " " + OtherTeacher.subjects.join(',') + "," + OtherTeacher.secondLanguages.join(',') + "," + OtherTeacher.thirdLanguages.join(',')
//                     })
//                 } else {
//                     TeacherList[checkTeacherExists].recieverStatus += OtherTeacher.classId.grade + " " + OtherTeacher.classId.section + " " + OtherTeacher.subjects.join(',') + "," + OtherTeacher.secondLanguages.join(',') + "," + OtherTeacher.thirdLanguages.join(',')
//                 }

//             }

//         }

//         console.log(NewPromiseData[1])

//         if (NewPromiseData[1].length > 0) {

//             for (let index = 0; index < NewPromiseData[1].length; index++) {
//                 const StudetListData = NewPromiseData[1][index];

//                 if (StudetListData.length > 0) {

//                     for (let index1 = 0; index1 < StudetListData.length; index1++) {
//                         const StudetConnection = StudetListData[index1];

//                         StudentList.push({
//                             receiverId: StudetConnection.studentId._id,
//                             receiverFirstName: StudetConnection.studentId.firstName,
//                             receiverSurName: StudetConnection.studentId.surName,
//                             receiverProfilePic: StudetConnection.studentId.profilePic ? StudetConnection.studentId.profilePic : "",
//                             recieverStatus: StudetConnection.classId.grade + " " + StudetConnection.classId.section
//                         })

//                     }

//                 }


//             }

//         }

//         res.status(200).json({
//             statusCode: "1",
//             ClassChatGroups,
//             TeacherList,
//             StudentList,
//             message: "Data Found...!!"
//         })

//     })
//     .catch(err => {
//         console.log(err);

//         res.status(200).json({
//             statusCode: "0",
//             message: "Something Went Wrong. Please Try Later..!!"
//         })

//     })