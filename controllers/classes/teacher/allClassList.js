const VerifyTeacher = require('../../../middleware/verifyTeacher');

const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');
const AssignmentModel = require('../../../models/assignment/assignmentModel');

const ParseAssignments = require('./parseSchoolAssignmentsController');

const formatDate = require('../formatDate');

const TeacherConnectedSubjectWiseClassList = require('../../group/teacher/teacherConnectedSubjectWiseClassList')

/*******************************************************************************
 * Get School Activity of today or selected date
 */
module.exports = async (req, res, next) => {

    if (req.params.teacherId) { //&& req.params.classId && req.body.subjectName

        let teacherId = req.params.teacherId;
        // let classId = req.params.classId;
        // let subjectName = req.body.subjectName;

        VerifyTeacher(teacherId, "", async (error, response) => {//classId

            if (response && response.statusCode != "0") {//&& response.classData

                TeacherConnectedSubjectWiseClassList(teacherId, ["Test", "Class"])
                    .then(async TeacherClassWiseSubjects => {

                        if (TeacherClassWiseSubjects != 0 && Array.isArray(TeacherClassWiseSubjects) && TeacherClassWiseSubjects.length > 0) {

                            let formattedToday = await formatDate(new Date());

                            let Query = {
                                // teacherId,
                                // $or: [{
                                //     sectionType: "Test"
                                // }, {
                                //     sectionType: "Class"
                                // }],
                                $or: TeacherClassWiseSubjects,
                                teacherDeleteStatus: false,
                                isActive: true,
                                eventDate: {
                                    $gt: formattedToday
                                },
                            }

                            if (req.params.lastClassId) {
                                Query._id = {
                                    $lt: req.params.lastClassId
                                }
                            }


                            /**Current Date or Selected Date Records */
                            let dayRecords = AssignmentModel.find(Query, {
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
                                    'eventDate': 1
                                })
                                .populate('groupId', 'grade section groupPic')
                                .limit(10)
                                .exec()

                            let teacherClasses = await ClassTeacherConnectionModel.find({
                                teacherId,
                                isActive: true
                            })

                            let teacherConnectedClasses = teacherClasses.map(connectedClass => connectedClass.classId);

                            let StudentClassConnections = ClassStudentConnectionModel.findOne({
                                classId: {
                                    $in: teacherConnectedClasses
                                },
                                connectionStatus: 1,
                                isActive: true
                            })

                            Promise.all([dayRecords, StudentClassConnections]) //previousDayRecord, futureDayRecord, 
                                .then(async resultArray => {

                                    console.log("complete List");
                                    console.log(resultArray);

                                    let addOption = resultArray[1] ? "true" : "false";

                                    //    let prevDate = resultArray[0] ? await formatDate(new Date(resultArray[0].date.setMinutes(resultArray[0].date.getMinutes() - 330))) : ""

                                    //    let nextDate = resultArray[1] ? await formatDate(new Date(resultArray[1].date.setMinutes(resultArray[1].date.getMinutes() - 330))) : ""

                                    if (resultArray[0].length > 0) {

                                        ParseAssignments.parseAssignmentData(resultArray[0])
                                            .then(assignmentsData => {

                                                res.status(200).json({
                                                    statusCode: "1",
                                                    assignmentRecords: assignmentsData,
                                                    addOption: addOption, //Need to review once again
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