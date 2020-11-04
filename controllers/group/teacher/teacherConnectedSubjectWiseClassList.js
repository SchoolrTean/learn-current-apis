const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel')

const ConnectedStudentsList = (teacherId, sectionTypes, announcementAndPost = undefined, noSubjectList = undefined) => {

    return new Promise((resolve, reject) => {

        if (teacherId && Array.isArray(sectionTypes)) {

            ClassTeacherConnectionModel.find({
                teacherId,
                isActive: true
            })
                .exec()
                .then(connectedTeacherConnections => {

                    if (connectedTeacherConnections.length > 0) {

                        let TeacherClassWiseSubjects = [];
                        let classList = [];

                        if (sectionTypes.length > 0 && announcementAndPost) {

                            for (let index = 0; index < connectedTeacherConnections.length; index++) {
                                const teacherConnection = connectedTeacherConnections[index];

                                let classObj = {
                                    groupId: teacherConnection.classId
                                };

                                classList.push(teacherConnection.classId)

                                // if (sectionTypes.length > 0) {
                                //     classObj.$or = sectionTypes.map(e => { return { sectionType: e } })
                                // }

                                if (sectionTypes.length > 0) {
                                    classObj.sectionType = { $in: sectionTypes }
                                }

                                if (!noSubjectList) {

                                    if (teacherConnection.subjects.length > 0 || teacherConnection.secondLanguages.length > 0 || teacherConnection.thirdLanguages.length > 0) {

                                        classObj.subject = {
                                            $in: [...teacherConnection.subjects, ...teacherConnection.secondLanguages, ...teacherConnection.thirdLanguages]
                                        }

                                    }

                                }

                                TeacherClassWiseSubjects.push(classObj)
                            }

                        } else if (sectionTypes.length == 0 && announcementAndPost) {

                            for (let index = 0; index < connectedTeacherConnections.length; index++) {
                                const teacherConnection = connectedTeacherConnections[index];
                                classList.push(teacherConnection.classId)
                            }

                        } else if (sectionTypes.length > 0 && !announcementAndPost) {

                            for (let index = 0; index < connectedTeacherConnections.length; index++) {
                                const teacherConnection = connectedTeacherConnections[index];

                                let classObj = {
                                    groupId: teacherConnection.classId
                                };

                                if (sectionTypes.length > 0) {
                                    classObj.sectionType = { $in: sectionTypes }
                                }

                                if (!noSubjectList) {

                                    if (teacherConnection.subjects.length > 0 || teacherConnection.secondLanguages.length > 0 || teacherConnection.thirdLanguages.length > 0) {

                                        classObj.subject = {
                                            $in: [...teacherConnection.subjects, ...teacherConnection.secondLanguages, ...teacherConnection.thirdLanguages]
                                        }

                                    }

                                }

                                TeacherClassWiseSubjects.push(classObj)
                            }

                        }




                        switch (announcementAndPost) {
                            case 1:
                                TeacherClassWiseSubjects.push({
                                    groupId: {
                                        $in: classList
                                    },
                                    teacherId,
                                    $or: [{
                                        sectionType: "Announcement"
                                    }, {
                                        sectionType: "Post"
                                    }]
                                })
                                break;

                            case 2:
                                TeacherClassWiseSubjects.push({
                                    groupId: {
                                        $in: classList
                                    },
                                    teacherId,
                                    sectionType: "Announcement"
                                })
                                break;

                            case 3:
                                TeacherClassWiseSubjects.push({
                                    groupId: {
                                        $in: classList
                                    },
                                    teacherId,
                                    sectionType: "Post"
                                })
                                break;

                            default:
                                break;
                        }

                        resolve(TeacherClassWiseSubjects)

                    } else {
                        resolve(0)
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
            reject(0) // All fields are Mandatory
        }

    })

}

module.exports = ConnectedStudentsList