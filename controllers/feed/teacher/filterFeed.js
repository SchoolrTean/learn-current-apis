const VerifyTeacher = require('../../../middleware/verifyTeacher');

const AssignmentModel = require('../../../models/assignment/assignmentModel');

const ParseFeed = require('./parseFeed');

const formatDate = require('../../classes/formatDate');

const TeacherConnectedSubjectWiseClassList = require('../../group/teacher/teacherConnectedSubjectWiseClassList')

/*******************************************************************************
 * Get School Activity of today or selected date
 * 
 * Status - Completed, Active, Cancelled, Over Due 
 * Type - Announcement, Post, Project Work, Home Work, Test  //Class, 
 * Subject - All Subjects
 * Date - Any Date
 */

module.exports = (req, res, next) => {

    if (req.params.teacherId && (!req.body.filterType || (req.body.filterType >= 0 && req.body.filterType < 7)) && (!req.body.filterDate || req.body.filterDate)
        && (!req.body.filterSubject || req.body.filterSubject) && (req.body.filterType || req.body.filterDate || req.body.filterStatus || req.body.filterSubject)
        && (!req.body.filterStatus || (req.body.filterStatus == "cancelled" || req.body.filterStatus == "active" || req.body.filterStatus == "completed"))) {

        let teacherId = req.params.teacherId;
        let lastFeedId = req.params.lastFeedId;


        VerifyTeacher(teacherId, "", (error, response) => {

            if (response && response.statusCode != "0") {

                let filterTypeList = [];
                let filterTypeId = 0;
                let noSubjectList = req.body.filterSubject && req.body.filterSubject.trim() ? "1" : "";

                if (req.body.filterType) { //1-HomeWork 2-Class 3-ProjectWork 4-Test 5-Announcement 6-Post

                    switch (req.body.filterType) {
                        case 1:
                            filterTypeList.push("HomeWork")
                            break;

                        case 2:
                            filterTypeList.push("Class")
                            break;

                        case 3:
                            filterTypeList.push("ProjectWork")
                            break;

                        case 4:
                            filterTypeList.push("Test")
                            break;

                        case 5:
                            filterTypeId = 2
                            break;

                        case 6:
                            filterTypeId = 3
                            break;

                        default:
                            break;
                    }
                } else {
                    filterTypeList = ["HomeWork", "Class", "ProjectWork", "Test"];
                    filterTypeId = 1;
                }

                TeacherConnectedSubjectWiseClassList(teacherId, filterTypeList, filterTypeId, noSubjectList)
                    .then(async TeacherClassWiseSubjects => {

                        if (TeacherClassWiseSubjects != 0 && Array.isArray(TeacherClassWiseSubjects) && TeacherClassWiseSubjects.length > 0) {

                            let filterQuery = {
                                // teacherId,
                                // $or: TeacherClassWiseSubjects,
                                sentStatus: true,
                                // teacherDeleteAllStatus: false,
                                teacherDeleteStatus: false,
                                isActive: true
                            }

                            if (req.body.filterType && req.body.filterType == '5' || req.body.filterType == '6') {
                                filterQuery.teacherId = teacherId
                                filterQuery.sectionType = req.body.filterType == '5' ? "Announcement" : "Post"
                            } else {
                                filterQuery.$or = TeacherClassWiseSubjects
                            }


                            if (lastFeedId) {

                                filterQuery._id = {
                                    $lt: lastFeedId
                                }

                            }

                            let selectedDate = req.body.filterDate ? req.body.filterDate : new Date();

                            let formattedSelectedDate = await formatDate(new Date(selectedDate));

                            let nextDay = await formatDate(new Date(selectedDate));;

                            nextDay.setDate(nextDay.getDate() + 1);

                            let formattedNextDay = await formatDate(nextDay);

                            if (req.body.filterDate) {
                                filterQuery.teacherId = teacherId

                                filterQuery.date = {
                                    "$gte": new Date(formattedSelectedDate),
                                    "$lt": new Date(formattedNextDay)
                                }

                            }

                            if (req.body.filterSubject) {
                                filterQuery.teacherId = teacherId
                                filterQuery.subject = req.body.filterSubject
                            }

                            if (req.body.filterStatus) {
                                filterQuery.teacherId = teacherId

                                if (req.body.filterStatus == "cancelled") {
                                    filterQuery.cancelStatus = true
                                }

                                if (req.body.filterStatus == "active") {
                                    filterQuery.eventDate = {
                                        "$gte": new Date(formattedSelectedDate)
                                    }
                                }

                                if (req.body.filterStatus == "completed") {
                                    filterQuery.eventDate = {
                                        "$lt": new Date(formattedSelectedDate)
                                    }
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
