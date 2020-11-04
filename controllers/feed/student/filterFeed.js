const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const AssignmentModel = require('../../../models/assignment/assignmentModel');

const ParseFeed = require('./parseFeed');

const formatDate = require('../../classes/formatDate');

const VerifyStudent = require('../../../middleware/verifyStudent')

/*******************************************************************************
 * Get School Activity of today or selected date
 * 
 * Status - Completed, Active, Cancelled, Over Due 
 * Type - Announcement, Post, Project Work, Home Work, Test  //Class, 
 * Subject - All Subjects
 * Date - Any Date
 */

module.exports = (req, res, next) => {

    try {

        console.log(req.params)
        console.log(req.body)

        if (req.params.studentId && (!req.body.filterType || (req.body.filterType >= 0 && req.body.filterType < 7)) && (!req.body.filterDate || req.body.filterDate)
            && (!req.body.filterSubject || req.body.filterSubject) && (req.body.filterType || req.body.filterDate || req.body.filterStatus || req.body.filterSubject)
            && (!req.body.filterStatus || (req.body.filterStatus == "cancelled" || req.body.filterStatus == "dueDateCompleted" || req.body.filterStatus == "active" || req.body.filterStatus == "completed"))) {

            let studentId = req.params.studentId;
            let lastFeedId = req.params.lastFeedId;

            VerifyStudent(studentId, "")
                .then(response => {

                    if (response && response.statusCode != "0") {

                        ClassStudentConnectionModel.find({
                            studentId,
                            connectionStatus: 1,
                            isActive: true
                        }, {
                            'classId': 1
                        })
                            .exec()
                            .then(async studentClassesConnected => {

                                if (studentClassesConnected.length > 0) {

                                    let classList = studentClassesConnected.map(connectedClasses => connectedClasses.classId)


                                    let filterQuery = {
                                        groupId: classList,
                                        sentStatus: true,
                                        cancelStatus: false,
                                        teacherDeleteAllStatus: false,
                                        teacherDeleteStatus: false,
                                        isActive: true
                                    }


                                    if (lastFeedId) {

                                        filterQuery._id = {
                                            $lt: lastFeedId
                                        }

                                    }


                                    if (req.body.filterType) { //1-HomeWork 2-Class 3-ProjectWork 4-Test 5-Announcement 6-Post

                                        switch (req.body.filterType) {
                                            case 1:
                                                filterQuery.sectionType = "HomeWork"
                                                break;

                                            case 2:
                                                filterQuery.sectionType = "Class"
                                                break;

                                            case 3:
                                                filterQuery.sectionType = "ProjectWork"
                                                break;

                                            case 4:
                                                filterQuery.sectionType = "Test"
                                                break;

                                            case 5:
                                                filterQuery.sectionType = "Announcement"
                                                break;

                                            case 6:
                                                filterQuery.sectionType = "Post"
                                                break;

                                            default:
                                                break;
                                        }
                                    }


                                    let selectedDate = req.body.filterDate ? req.body.filterDate : new Date();

                                    let formattedSelectedDate = await formatDate(new Date(selectedDate));

                                    let nextDay = await formatDate(new Date(selectedDate));;

                                    nextDay.setDate(nextDay.getDate() + 1);

                                    let formattedNextDay = await formatDate(nextDay);

                                    if (req.body.filterDate) {

                                        filterQuery.date = {
                                            "$gte": new Date(formattedSelectedDate),
                                            "$lt": new Date(formattedNextDay)
                                        }

                                    }

                                    if (req.body.filterSubject) {
                                        filterQuery.subject = req.body.filterSubject
                                    }

                                    if (req.body.filterStatus) {

                                        if (req.body.filterStatus == "cancelled") {
                                            filterQuery.cancelStatus = true
                                        }

                                        if (req.body.filterStatus == "active") {
                                            filterQuery.eventDate = {
                                                "$gte": new Date(formattedSelectedDate)
                                            }
                                        }

                                        if (req.body.filterStatus == "completed") {

                                            filterQuery.$or = [{
                                                "completedStudents.userId": studentId
                                            }, {
                                                "coming": studentId
                                            }, {
                                                eventDate: {
                                                    "$lt": new Date(formattedSelectedDate)
                                                }
                                            }]

                                        }

                                    }

                                    /**Current Date or Selected Date Records */
                                    AssignmentModel.find(filterQuery, {
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
                                        .then(feedRecords => {


                                            if (feedRecords.length > 0) {

                                                ParseFeed(feedRecords)
                                                    .then(feedDataRecords => {

                                                        res.status(200).json({
                                                            statusCode: "1",
                                                            feedData: feedDataRecords,
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
                                                    feedData: [],
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
                                        statusCode: "1",
                                        assignmentRecords: [],
                                        message: "No Record Found...!!"
                                    });
                                }

                            })

                    } else {
                        res.status(200).json({
                            statusCode: "0",
                            message: error.message
                        })
                    }
                })
                .catch(err => {
                    console.log(err)
                    res.status(200).json({
                        statusCode: "0",
                        message: "Something went wrong. Please try again..!!"
                    })
                })

        } else {
            return res.status(200).json({
                statusCode: "0",
                message: "All fields are mandatory..!!"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(200).json({
            statusCode: "0",
            message: "Something Went Wrong. Please Try Later..!!"
        });
    }


}
