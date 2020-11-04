const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const AssignmentModel = require('../../../models/assignment/assignmentModel');

const ParseFeed = require('./parseFeed');

const formatDate = require('../../classes/formatDate');

const MyActivityCount = require('./myActivityCount')

const VerifyStudent = require('../../../middleware/verifyStudent')

// const StudentConnectionModel = require('../../../models/school/schoolStudentConnectionModel')

/*******************************************************************************
 * Get School Activity of today or selected date
 */

module.exports = async (req, res, next) => {

    if (req.params.studentId) {

        let studentId = req.params.studentId;
        let lastFeedId = req.params.lastFeedId;

        // VerifyTeacher(teacherId, "", async (error, response) => {

        // if (response && response.statusCode != "0") {

        // let groupList = await GroupList(teacherId);

        let latestOnlyDate = await formatDate(new Date());

        let nextDay = await formatDate(new Date());;

        nextDay.setDate(new Date(latestOnlyDate).getDate() + 1);

        let formattedNextDay = await formatDate(nextDay);

        // VerifyStudent

        ClassStudentConnectionModel.find({
            studentId,
            connectionStatus: 1,
            isActive: true
        })
            .exec()
            .then(ClassList => {

                if (ClassList.length > 0) {

                    let classList = ClassList.map(classConnected => classConnected.classId);

                    let todayRecords = AssignmentModel.find({
                        // $or: TeacherClassWiseSubjects,
                        groupId: classList,
                        sentStatus: true,
                        teacherDeleteAllStatus: false,
                        teacherDeleteStatus: false,
                        isActive: true,
                        eventDate: {
                            $gte: new Date(latestOnlyDate),
                            $lt: new Date(formattedNextDay)
                        }
                    })
                        .exec()


                    let Query = {
                        // $or: TeacherClassWiseSubjects,
                        groupId: classList,
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

                        completedStudents: 1,
                        notCompletedStudents: 1,
                        coming: 1,
                        notComing: 1,

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


                    Promise.all([feedRecords, todayRecords])
                        .then(async resultArray => {

                            let myActivityCount = await MyActivityCount(resultArray[1], studentId);

                            if (resultArray[0].length > 0) {

                                ParseFeed(resultArray[0], studentId)
                                    .then(feedDataRecords => {

                                        res.status(200).json({
                                            statusCode: "1",
                                            myActivityToday: myActivityCount,
                                            feedData: feedDataRecords,
                                            // addOption: addOption, //Need to review once again
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
                                    myActivityToday: myActivityCount,
                                    feedData: [],
                                    // addOption: addOption,
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
                        message: "No Records Found..!!"
                    })
                }

            })
            .catch(err => {
                console.log(err)

            })

        // } else {
        //     res.status(200).json({
        //         statusCode: "0",
        //         message: error.message
        //     })
        // }
        // })

    } else {
        return res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }
}


