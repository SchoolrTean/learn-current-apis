const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const VerifyStudent = require('../../../../middleware/verifyStudent');

module.exports = (req, res, next) => {

    if (req.params.studentId && req.params.classId && req.params.postId) {

        let studentId = req.params.studentId;
        let classId = req.params.classId;
        let postId = req.params.postId;

        VerifyStudent(studentId, classId)
            .then(response => {

                if (response && response.statusCode != "0") {

                    AssignmentModel.findOne({
                        _id: postId,
                        groupId: classId,
                        sectionType: "Post",
                        teacherDeleteAllStatus: false,
                        teacherDeleteStatus: false,
                        isActive: true
                    }, {
                        "groupId": 1,
                        "announcement": 1,
                        "additionalInformation": 1,
                        "fileUrls": 1,
                        "remindedUsers": 1,
                        "stared": 1,
                        "cancelStatus": 1,
                        "date": 1
                    })
                        .populate('groupId', 'grade section gradeId groupPic')
                        .exec()
                        .then(async result => {

                            console.log(result);

                            if (result) {

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
                                    postId: result._id,
                                    sectionType: result.sectionType,
                                    groupName: result.groupId.grade + " " + result.groupId.section,
                                    groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",

                                    announcement: result.announcement,
                                    fileUrls: result.fileUrls ? result.fileUrls : [],

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
