const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const VerifyStudent = require('../../../../middleware/verifyStudent');


module.exports = (req, res, next) => {

    if (req.params.studentId && req.params.classId && req.params.projectWorkId) {

        let studentId = req.params.studentId;
        let classId = req.params.classId;
        let projectWorkId = req.params.projectWorkId;

        VerifyStudent(studentId, classId)
            .then(response => {

                if (response && response.statusCode != "0") {

                    AssignmentModel.findOne({
                        _id: projectWorkId,
                        groupId: classId,
                        sectionType: "ProjectWork",
                        "groupData.students": studentId,
                        teacherDeleteAllStatus: false,
                        teacherDeleteStatus: false,
                        isActive: true
                    }, {
                        "groupId": 1,
                        "subject": 1,
                        "title": 1,
                        "eventDate": 1,
                        "groupData": 1,
                        "additionalInformation": 1,
                        "fileUrls": 1,
                        "activeStudentIds": 1,
                        "remindedUsers": 1,
                        "stared": 1,
                        "cancelStatus": 1,
                        "sentStatus": 1,
                        "savedDateAndTime": 1,
                        "groupData": 1, //.$.students
                        "date": 1
                    })
                        .populate('groupId', 'grade section gradeId groupPic')
                        .populate('groupData.students', 'firstName surName profilePic')
                        .exec()
                        .then(async result => {

                            console.log(result);

                            if (result) {

                                let groupDataArray = [];
                                let completedProjectsCount = 0
                                let incompletedProjectsCount = 0
                                let studentFound = 0

                                // let check

                                if (result.groupData.length > 0) {

                                    result.groupData.forEach(group => {

                                        if (group.projectSubmittedStatus && group.projectSubmittedStatus != '') {
                                            if (group.projectSubmittedStatus == 'true') {
                                                completedProjectsCount = completedProjectsCount + 1
                                            } else if (group.projectSubmittedStatus == 'false') {
                                                incompletedProjectsCount = incompletedProjectsCount + 1
                                            }
                                        }

                                        let studentData = []

                                        if (group.students.length > 0) {
                                            studentData = group.students.map(student => {

                                                if (String(student._id) == String(studentId)) {
                                                    studentFound = 1;
                                                }

                                                return {
                                                    "_id": student._id,
                                                    "firstName": student.firstName,
                                                    "surName": student.surName,
                                                    "profilePic": student.profilePic ? student.profilePic : ""
                                                }
                                            })
                                        }

                                        if (studentFound == 1) {
                                            
                                            groupDataArray.push({
                                                groupTopic: group.groupTopic ? group.groupTopic : "",
                                                projectSubmittedStatus: group.projectSubmittedStatus ? String(group.projectSubmittedStatus) : "",
                                                students: studentData
                                            })

                                        }

                                    })

                                }

                                let remDate = result.date

                                let splitedDate = remDate.toString().split(' ');
                                let splitTimestamp = splitedDate[4].split(':')

                                //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                let reminderId = String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))

                                let reminderDate = "";
                                let reminderNote = "";

                                if (result.remindedUsers.length > 0) {

                                    result.remindedUsers.forEach(reminder => {

                                        if (String(reminder.userId) == String(studentId)) {
                                            reminderDate = reminder.reminderDate;
                                            reminderNote = reminder.reminderNote;
                                        }

                                    });

                                }


                                let stared = result.stared ? result.stared.indexOf(String(studentId)) != -1 ? true : false : false;


                                res.status(200).json({
                                    statusCode: "1",
                                    projectId: result._id,
                                    sectionType: result.sectionType,
                                    classId: result.groupId._id,
                                    groupName: result.groupId.grade + " " + result.groupId.section,
                                    groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",
                                    subject: result.subject ? result.subject : "",
                                    title: result.title ? result.title : "",
                                    eventDate: result.eventDate, //Submission Date

                                    groupData: groupDataArray,
                                    additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                                    fileUrls: result.fileUrls ? result.fileUrls : [],

                                    totalStudentCount: groupDataArray.length,
                                    completedStudentsCount: completedProjectsCount,
                                    inCompletedStudentsCount: incompletedProjectsCount,

                                    reminderId,
                                    reminderDate,
                                    reminderNote,
                                    stared,

                                    cancelStatus: result.cancelStatus,
                                    sentStatus: result.sentStatus,
                                    scheduledDateAndTime: result.sentStatus == false ? result.savedDateAndTime : "",
                                    date: result.date,
                                    message: "Data Found...!"
                                });


                            } else {
                                res.status(200).json({
                                    statusCode: "0",
                                    message: "No Record Found..!!"
                                });
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
        res.status(200).json({
            statusCode: "0",
            message: "All fields are mandatory..!!"
        });
    }
}


// Customer Support
// 1. Gsuite for everyone
// 2. AWS
// 3. Slack
// 4. Twilio
// 5. send