// const VerifyTeacher = require('../../../middleware/verifyTeacher');

// const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
// const AssignmentModel = require('../../../models/assignment/assignmentModel');

// const ParseFeed = require('./parseFeed');

// const formatDate = require('../../classes/formatDate');

// const GroupList = require('../../group/teacher/activeGroupsList');

// const TeacherConnectedSubjectWiseClassList = require('../../group/teacher/teacherConnectedSubjectWiseClassList')

/*******************************************************************************
 * Get School Activity of today or selected date
 */
const DateDiff = require('date-diff');

module.exports = async (todayRecords, studentId) => {

    return new Promise((resolve, reject) => {

        try {

            let activityCountObj = [{
                "total": 0,
                "completed": 0,
                "cancelled": 0,
                "active": 0
            }, {
                "total": 0,
                "completed": 0,
                "cancelled": 0,
                "active": 0
            }, {
                "total": 0,
                "completed": 0,
                "cancelled": 0,
                "active": 0
            }, {
                "total": 0,
                "completed": 0,
                "cancelled": 0,
                "active": 0
            }];


            if (todayRecords.length > 0) {

                for (let index = 0; index < todayRecords.length; index++) {
                    const record = todayRecords[index];

                    if (record.sectionType == "Class") {

                        if (record.cancelStatus == false) {

                            let endDate = new Date(record.eventDate)
                            endDate.setMinutes(endDate.getMinutes() + parseInt(record.duration));

                            let dateDiff = new DateDiff(new Date().setMinutes(new Date().getMinutes() + 330), new Date(endDate));

                            if (dateDiff.minutes() < 0) {

                                activityCountObj[0].active++;

                            } else if (dateDiff.minutes() > 0) {

                                activityCountObj[0].completed++;

                            }

                        } else {
                            activityCountObj[0].cancelled++;
                        }

                        activityCountObj[0].total++;

                    } else if (record.sectionType == "Test") {

                        if (record.cancelStatus == false) {

                            let endDate = new Date(record.eventDate)
                            endDate.setMinutes(endDate.getMinutes() + parseInt(record.duration));

                            let dateDiff = new DateDiff(new Date().setMinutes(new Date().getMinutes() + 330), new Date(endDate));

                            if (dateDiff.minutes() < 0) {

                                activityCountObj[1].active++;

                            } else if (dateDiff.minutes() > 0) {

                                activityCountObj[1].completed++;

                            }

                        } else {
                            activityCountObj[1].cancelled++;
                        }

                        activityCountObj[1].total++;

                    } else if (record.sectionType == "ProjectWork" || record.sectionType == "HomeWork") {

                        if (record.cancelStatus == false) {

                            let checkCompleted = "false";

                            if (record.completedStudents.length > 0) {
                                let index1 = 0;

                                while (index1 < record.completedStudents && checkCompleted == "false") {
                                    if (record.completedStudents.userId && String(record.completedStudents.userId) == String(studentId)) {
                                        activityCountObj[2].completed++
                                        checkCompleted = "true"
                                    }
                                    index1++
                                }

                            }

                            if (record.notCompletedStudents.length > 0) {
                                let index2 = 0;

                                while (index2 < record.notCompletedStudents && checkCompleted == "false") {
                                    if (record.completedStudents.userId && String(record.notCompletedStudents.userId) == String(studentId)) {
                                        activityCountObj[2].completed++
                                        checkCompleted = "true"
                                    }
                                    index2++
                                }
                            }

                            if (checkCompleted = "false") {
                                activityCountObj[2].active++;
                            }

                        } else {
                            activityCountObj[2].cancelled++;
                        }

                        activityCountObj[2].total++;

                    } else if (record.sectionType == "Post" || record.sectionType == "Announcement") {

                        if (record.cancelStatus == false) {

                            if (record.studentConfirmation && record.studentConfirmation == true) {

                                (record.coming || record.notComing) ? (record.coming.indexOf(String(studentId)) != -1 || record.notComing.indexOf(String(studentId)) != -1) ? activityCountObj[3].completed++ : "" : "";

                            } else {

                                activityCountObj[3].active++;

                            }

                        } else {

                            activityCountObj[3].cancelled++;

                        }

                        activityCountObj[3].total++;

                    }
                }


                let myActivityTodayObj = [{
                    "name": "Classes",
                    "total": activityCountObj[0].total,
                    "completed": (activityCountObj[0].completed != 0 && activityCountObj[0].total != 0) ? String(Math.round((activityCountObj[0].completed / activityCountObj[0].total) * 100)) : "0",
                    "cancelled": (activityCountObj[0].cancelled != 0 && activityCountObj[0].total != 0) ? String(Math.round((activityCountObj[0].cancelled / activityCountObj[0].total) * 100)) : "0",
                    "active": (activityCountObj[0].active != 0 && activityCountObj[0].total != 0) ? String(Math.round((activityCountObj[0].active / activityCountObj[0].total) * 100)) : "0",
                }, {
                    "name": "Tests",
                    "total": activityCountObj[1].total,
                    "completed": (activityCountObj[1].completed != 0 && activityCountObj[1].total != 0) ? String(Math.round((activityCountObj[1].completed / activityCountObj[1].total) * 100)) : "0",
                    "cancelled": (activityCountObj[1].cancelled != 0 && activityCountObj[1].total != 0) ? String(Math.round((activityCountObj[1].cancelled / activityCountObj[1].total) * 100)) : "0",
                    "active": (activityCountObj[1].active != 0 && activityCountObj[1].total != 0) ? String(Math.round((activityCountObj[1].active / activityCountObj[1].total) * 100)) : "0",
                }, {
                    "name": "Assignment",
                    "total": activityCountObj[2].total,
                    "completed": (activityCountObj[2].completed != 0 && activityCountObj[2].total != 0) ? String(Math.round((activityCountObj[2].completed / activityCountObj[2].total) * 100)) : "0",
                    "cancelled": (activityCountObj[2].cancelled != 0 && activityCountObj[2].total != 0) ? String(Math.round((activityCountObj[2].cancelled / activityCountObj[2].total) * 100)) : "0",
                    "active": (activityCountObj[2].active != 0 && activityCountObj[2].total != 0) ? String(Math.round((activityCountObj[2].active / activityCountObj[2].total) * 100)) : "0",
                }, {
                    "name": "Events",
                    "total": activityCountObj[3].total,
                    "completed": (activityCountObj[3].completed != 0 && activityCountObj[3].total != 0) ? String(Math.round((activityCountObj[3].completed / activityCountObj[3].total) * 100)) : "0",
                    "cancelled": (activityCountObj[3].cancelled != 0 && activityCountObj[3].total != 0) ? String(Math.round((activityCountObj[3].cancelled / activityCountObj[3].total) * 100)) : "0",
                    "active": (activityCountObj[3].active != 0 && activityCountObj[3].total != 0) ? String(Math.round((activityCountObj[3].active / activityCountObj[3].total) * 100)) : "0",
                }];

                resolve(myActivityTodayObj);

            } else {

                let myActivityTodayObj = [{
                    "name": "Classes",
                    "total": 0,
                    "completed": "0",
                    "cancelled": "0",
                    "active": "0",
                }, {
                    "name": "Tests",
                    "total": 0,
                    "completed": "0",
                    "cancelled": "0",
                    "active": "0",
                }, {
                    "name": "Assignment",
                    "total": 0,
                    "completed": "0",
                    "cancelled": "0",
                    "active": "0",
                }, {
                    "name": "Events",
                    "total": 0,
                    "completed": "0",
                    "cancelled": "0",
                    "active": "0",
                }];

                resolve(myActivityTodayObj);
            }


        } catch (error) {
            console.log(error);
            reject(0)
        }

    })

}




// if (req.params.teacherId) {

//     let teacherId = req.params.teacherId;
//     let lastFeedId = req.params.lastFeedId;

//     VerifyTeacher(teacherId, "", async (error, response) => {

//         if (response && response.statusCode != "0") {

//             let groupList = await GroupList(teacherId);

//             let latestOnlyDate = await formatDate(new Date());

//             let nextDay = await formatDate(new Date());;

//             nextDay.setDate(new Date(latestOnlyDate).getDate() + 1);

//             let formattedNextDay = await formatDate(nextDay);



//             TeacherConnectedSubjectWiseClassList(teacherId, ["ProjectWork", "Test", "HomeWork", "Class"], 1)
//                 .then(TeacherClassWiseSubjects => {

//                     if (TeacherClassWiseSubjects != 0 && Array.isArray(TeacherClassWiseSubjects) && TeacherClassWiseSubjects.length > 0) {


//                         AssignmentModel.find({
//                             // teacherId,
//                             $or: TeacherClassWiseSubjects,
//                             sentStatus: true,
//                             teacherDeleteAllStatus: false,
//                             teacherDeleteStatus: false,
//                             isActive: true,
//                             // scheduledDateAndTime: {
//                             //     $gte: new Date(latestOnlyDate),
//                             //     $lt: new Date(formattedNextDay)
//                             // },
//                             date: {
//                                 $gte: new Date(latestOnlyDate),
//                                 $lt: new Date(formattedNextDay)
//                             }
//                         })
//                             .exec()
//                             .then(async todayRecords => {

//                             })
//                             .catch(err => {
//                                 console.log(err);

//                                 res.status(200).json({
//                                     statusCode: "0",
//                                     message: "Something went wrong. Please try again..!!"
//                                 })
//                             })

//                     } else {
//                         res.status(200).json({
//                             statusCode: "0",
//                             TestCount: 0,
//                             AssignmentCount: 0,
//                             ClassCount: 0,
//                             EventCount: 0,
//                             feedData: [],
//                             addOption: "false",
//                             message: "No Classes...!!"
//                         })
//                     }

//                 })
//                 .catch(err => {
//                     console.log(err);

//                     res.status(200).json({
//                         statusCode: "0",
//                         message: "Something went wrong. Please try again..!!"
//                     })
//                 })

//         } else {
//             res.status(200).json({
//                 statusCode: "0",
//                 message: error.message
//             })
//         }
//     })

// } else {
//     return res.status(200).json({
//         statusCode: "0",
//         message: "All fields are mandatory..!!"
//     });
// }