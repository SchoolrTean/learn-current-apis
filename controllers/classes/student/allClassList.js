const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const AssignmentModel = require('../../../models/assignment/assignmentModel');
const UserModel = require('../../../models/authentication/userModel');


const formatDate = require('../formatDate');

const ParseAssignments = require('./parseSchoolAssignmentsController');

/*******************************************************************************
 * Get School Activity of today or selected date
 */
module.exports = async (req, res, next) => {

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
                        // $or: [{
                        //     subjects: {
                        //         $in: subjectName.toLowerCase()
                        //     }
                        // }, {
                        //     secondLanguage: subjectName.toLowerCase()
                        // }, {
                        //     thirdLanguage: subjectName.toLowerCase()
                        // }],
                        isActive: true
                    }, {
                        'classId': 1
                    })
                        .exec()
                        .then(async studentClassesConnected => {

                            if (studentClassesConnected.length > 0) {

                                let classes = studentClassesConnected.map(connectedClasses => connectedClasses.classId)

                                let formattedToday = await formatDate(new Date());

                                let Query = {
                                    groupId: {
                                        $in: classes
                                    },
                                    $or: [{
                                        sectionType: "Test"
                                    }, {
                                        sectionType: "Class"
                                    }],
                                    eventDate: {
                                        $gt: formattedToday
                                    },
                                    // subject: subjectName,
                                    sentStatus: true,
                                    teacherDeleteStatus: false,
                                    isActive: true,
                                }


                                if (req.params.lastClassId) {
                                    Query._id = {
                                        $lt: req.params.lastClassId
                                    }
                                }


                                /**Current Date or Selected Date Records */
                                AssignmentModel.find(Query, {
                                    // groupId: 1,
                                    // subject: 1,
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
                                })
                                    .sort({
                                        'date': -1,
                                    })
                                    .populate({
                                        path: 'groupData.students',
                                        select: 'firstName surName profilePic'
                                    })
                                    .populate('groupId', 'grade section groupPic')
                                    .limit(20)
                                    .exec()
                                    .then(async resultArray => {

                                        console.log("complete List");
                                        console.log(resultArray);


                                        //    let prevDate = resultArray[0] ? await formatDate(new Date(resultArray[0].date.setMinutes(resultArray[0].date.getMinutes() - 330))) : ""

                                        //    let nextDate = resultArray[1] ? await formatDate(new Date(resultArray[1].date.setMinutes(resultArray[1].date.getMinutes() - 330))) : ""

                                        if (resultArray.length > 0) {

                                            ParseAssignments.parseAssignmentData(resultArray, studentId, 2)
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
                                    statusCode: "1",
                                    assignmentRecords: [],
                                    message: "No Record Found...!!"
                                });
                            }

                        })

                } else {
                    res.status(200).json({
                        statusCode: "0",
                        message: "Something went wrong. Please try again..!!"
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