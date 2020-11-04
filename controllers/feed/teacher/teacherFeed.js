const VerifyTeacher = require('../../../middleware/verifyTeacher');

const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const AssignmentModel = require('../../../models/assignment/assignmentModel');

const ParseFeed = require('./parseFeed');

const formatDate = require('../../classes/formatDate');

const GroupList = require('../../group/teacher/activeGroupsList');

const TeacherConnectedSubjectWiseClassList = require('../../group/teacher/teacherConnectedSubjectWiseClassList')

const MyActivityCount = require('./myActivityCount')

/*******************************************************************************
 * Get School Activity of today or selected date
 */

module.exports = async (req, res, next) => {

    if (req.params.teacherId) {

        let teacherId = req.params.teacherId;
        let lastFeedId = req.params.lastFeedId;

        VerifyTeacher(teacherId, "", async (error, response) => {

            if (response && response.statusCode != "0") {

                let groupList = await GroupList(teacherId);

                let latestOnlyDate = await formatDate(new Date());

                let nextDay = await formatDate(new Date());;

                nextDay.setDate(new Date(latestOnlyDate).getDate() + 1);

                let formattedNextDay = await formatDate(nextDay);


                TeacherConnectedSubjectWiseClassList(teacherId, ["ProjectWork", "Test", "HomeWork"], 1)
                    .then(TeacherClassWiseSubjects => {

                        if (TeacherClassWiseSubjects != 0 && Array.isArray(TeacherClassWiseSubjects) && TeacherClassWiseSubjects.length > 0) {


                            // $or: TeacherClassWiseSubjects,

                            let todayRecords = AssignmentModel.find({
                                teacherId,
                                // $or: TeacherClassWiseSubjects,
                                sentStatus: true,
                                teacherDeleteAllStatus: false,
                                teacherDeleteStatus: false,
                                isActive: true,
                                $or: [{
                                    eventDate: {
                                        $gte: new Date(latestOnlyDate),
                                        $lt: new Date(formattedNextDay)
                                    }
                                }, {
                                    eventDate: {
                                        $exists: false
                                    },
                                    date: {
                                        $gte: new Date(latestOnlyDate),
                                        $lt: new Date(formattedNextDay)
                                    }
                                }]

                            })
                                .exec()


                            let Query = {
                                // teacherId,
                                $or: TeacherClassWiseSubjects,
                                sentStatus: true,
                                cancelStatus: false,
                                teacherDeleteAllStatus: false,
                                teacherDeleteStatus: false,
                                isActive: true
                            }


                            if (lastFeedId) {

                                Query._id = {
                                    $lt: lastFeedId
                                }

                            }


                            /**Current Date or Selected Date Records */
                            let feedRecords = AssignmentModel.find(Query, {
                                subject: 1,
                                eventDate: 1,
                                duration: 1,
                                title: 1,
                                chapter: 1,
                                additionalInformation: 1,

                                //common things
                                groupId: 1,
                                sectionType: 1,
                                fileUrls: 1,
                                date: 1,
                            })
                                .sort({
                                    'date': -1
                                })
                                .populate('groupId', 'grade section groupPic')
                                .limit(20)
                                .exec()


                            let StudentClassConnections = ClassStudentConnectionModel.findOne({
                                classId: {
                                    $in: groupList
                                },
                                isActive: true
                            })


                            Promise.all([feedRecords, todayRecords, StudentClassConnections]) //previousDayRecord, futureDayRecord, 
                                .then(async resultArray => {

                                    let addOption = resultArray[2] ? "true" : "false";


                                    // let TestCount = 0;
                                    // let AssignmentCount = 0;
                                    // let ClassCount = 0;
                                    // let EventCount = 0;

                                    let myActivityCount = await MyActivityCount(resultArray[1], teacherId);


                                    if (resultArray[0].length > 0) {

                                        ParseFeed(resultArray[0])
                                            .then(feedDataRecords => {

                                                res.status(200).json({
                                                    statusCode: "1",
                                                    myActivityToday: myActivityCount,
                                                    feedData: feedDataRecords,
                                                    addOption: addOption, //Need to review once again
                                                    message: "Data Found...!!"
                                                });


                                                // TestCount,
                                                // AssignmentCount,
                                                // ClassCount,
                                                // EventCount,

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
                                            myActivityToday: myActivityCount,
                                            feedData: [],
                                            addOption: addOption,
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
                                TestCount: 0,
                                AssignmentCount: 0,
                                ClassCount: 0,
                                EventCount: 0,
                                feedData: [],
                                addOption: "false",
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



                                    // groupId: {
                                    //     $in: groupList
                                    // },
                                    // $or: [{
                                    //     sectionType: "ProjectWork"
                                    // }, {
                                    //     sectionType: "Test"
                                    // }, {
                                    //     sectionType: "HomeWork"
                                    // }, {
                                    //     sectionType: "Announcement"
                                    // }, {
                                    //     sectionType: "Post"
                                    // }],



                // for (let index = 0; index < connectedTeacherConnections.length; index++) {
                //     const teacherConnection = connectedTeacherConnections[index];

                //     if (teacherConnection.subjects.length > 0 || teacherConnection.secondLanguages.length > 0 || teacherConnection.thirdLanguages.length > 0) {
                //         TeacherClassWiseSubjects.push({
                //             groupId: teacherConnection.classId,
                //             subject: {
                //                 $in: [...teacherConnection.subjects, ...teacherConnection.secondLanguages, ...teacherConnection.thirdLanguages]
                //             },
                //             $or: [{
                //                 sectionType: "ProjectWork"
                //             }, {
                //                 sectionType: "Test"
                //             }, {
                //                 sectionType: "HomeWork"
                //             }, {
                //                 sectionType: "Post"
                //             }]
                //         })
                //     }

                // }





                // ClassTeacherConnectionModel.find({
                //     teacherId,
                //     isActive: true
                // })
                //     .exec()
                //     .then(async connectedTeacherConnections => {

                //         if (connectedTeacherConnections.length > 0) {

                //         } else {
                //             res.status(200).json({
                //                 statusCode: "0",
                //                 message: "No Classes...!!"
                //             })
                //         }

                //     })
                //     .catch(err => {
                //         console.log(err);

                //         res.status(200).json({
                //             statusCode: "0",
                //             message: "Something went wrong. Please try again..!!"
                //         })
                //     })