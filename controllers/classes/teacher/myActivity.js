const VerifyTeacher = require('../../../middleware/verifyTeacher');

const AssignmentModel = require('../../../models/assignment/assignmentModel');

const ParseAssignments = require('./parseSchoolAssignmentsController');

const formatDate = require('../formatDate');

const TeacherConnectedSubjectWiseClassList = require('../../group/teacher/teacherConnectedSubjectWiseClassList')

/*******************************************************************************
 * Get School Activity of today or selected date
 * 
 * filterBy
 * 
 * Status - Completed, Active, Cancelled, Over Due 
 * Type - Announcement, Post, Project Work, Home Work, Test  //Class, 
 * Subject - All Subjects
 * Date - Any Date
 */
module.exports = async (req, res, next) => {

    if (req.params.teacherId && req.params.activityId && (req.params.activityId == '1' || req.params.activityId == '2' || req.params.activityId == '3' || req.params.activityId == '4')) {

        let teacherId = req.params.teacherId;
        let activityId = req.params.activityId;

        VerifyTeacher(teacherId, "", async (error, response) => {

            if (response && response.statusCode != "0") {

                let classCategoryList = [];
                let classCategoryType = 0;
                let noSubjectList = "";

                switch (activityId) {
                    case '1':
                        classCategoryList.push("Class")
                        break;

                    case '2':
                        classCategoryList.push("Test")
                        break;

                    case '3':
                        classCategoryList.push("ProjectWork")
                        classCategoryList.push("HomeWork")
                        break;

                    case '4':
                        classCategoryType = 1
                        noSubjectList = 1
                        break;

                    default:
                        break;
                }

                TeacherConnectedSubjectWiseClassList(teacherId, classCategoryList, classCategoryType, noSubjectList)
                    .then(async TeacherClassWiseSubjects => {

                        if (TeacherClassWiseSubjects != 0 && Array.isArray(TeacherClassWiseSubjects) && TeacherClassWiseSubjects.length > 0) {

                            let formattedToday = await formatDate(new Date());

                            let nextDay = new Date();

                            nextDay.setDate(nextDay.getDate() + 1);

                            let formattedNextDay = await formatDate(nextDay);

                            let Query = "";

                            if (activityId != '4') {
                                Query = {
                                    $or: TeacherClassWiseSubjects,
                                    eventDate: {
                                        $gte: new Date(formattedToday),
                                        $lt: new Date(formattedNextDay)
                                    },
                                    teacherDeleteStatus: false,
                                    isActive: true,
                                }
                            } else {
                                Query = {
                                    $or: [{
                                        $or: TeacherClassWiseSubjects,
                                        eventDate: {
                                            $gte: new Date(formattedToday),
                                            $lt: new Date(formattedNextDay)
                                        }
                                    }, {
                                        $or: TeacherClassWiseSubjects,
                                        eventDate: {
                                            $exists: false
                                        },
                                        date: {
                                            $gte: new Date(formattedToday),
                                            $lt: new Date(formattedNextDay)
                                        }
                                    }],
                                    teacherDeleteStatus: false,
                                    isActive: true,
                                }
                            }


                            /**Current Date or Selected Date Records */
                            AssignmentModel.find(Query, {
                                // title: 1,
                                // eventDate: 1,
                                // chapter: 1,
                                // topics: 1,
                                // duration: 1,
                                // sectionType: 1,

                                // fileUrls: 1,
                                // additionalInformation: 1,

                                // cancelStatus: 1,
                                // teacherDeleteAllStatus: 1,

                                // completedStudents: 1,
                                // notCompletedStudents: 1,
                                // activeStudentIds: 1,
                                // remindedUsers: 1,
                                // sentStatus: 1,
                                // savedDateAndTime: 1,
                                // date: 1,

                                //common things
                                // groupId: 1,
                                // sectionType: 1,
                                // seenStudents: 1,
                                // teacherStared: 1,                    
                                // upcomingDate: 1,
                                // updatedStatus: 1,
                                // updatedAssignmentId: 1,
                                // updatedAssignmentDate: 1,
                                // 'date': -1,
                            })
                                .sort({
                                    'date': 1
                                })
                                .populate('groupId', 'grade section groupPic')
                                .exec()
                                .then(async todayRecords => {

                                    console.log("Today Records");
                                    console.log(todayRecords);

                                    if (todayRecords.length > 0) {

                                        ParseAssignments.parseAssignmentData(todayRecords)
                                            .then(assignmentsData => {

                                                res.status(200).json({
                                                    statusCode: "1",
                                                    assignmentRecords: assignmentsData,
                                                    message: "Data Found...!!"
                                                });

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
                                            statusCode: "1",
                                            assignmentRecords: [],
                                            message: "No Record Found...!!"
                                        });

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
                                message: "No Classes...!!"
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