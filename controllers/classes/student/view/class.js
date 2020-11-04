const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const SubjectModel = require('../../../../models/admin/master/academic/subjectsModel');
const ChapterModel = require('../../../../models/admin/learn/academic/chaptersModel');
const TopicsModel = require('../../../../models/admin/learn/academic/topicsModel');
const VerifyStudent = require('../../../../middleware/verifyStudent');

module.exports = (req, res, next) => {

    if (req.params.studentId && req.params.classId && req.params.scheduledClassId) {

        let studentId = req.params.studentId;
        let classId = req.params.classId;
        let scheduledClassId = req.params.scheduledClassId;

        VerifyStudent(studentId, classId)
            .then(response => {

                if (response && response.statusCode != "0") {

                    AssignmentModel.findOne({
                        _id: scheduledClassId,
                        groupId: classId,
                        sectionType: "Class",
                        teacherDeleteAllStatus: false,
                        teacherDeleteStatus: false,
                        isActive: true
                    }, {

                        "subject": 1,
                        "groupId": 1,
                        "title": 1,
                        "eventDate": 1,
                        "duration": 1,
                        "chapter": 1,
                        "topics": 1,
                        "fileUrls": 1,
                        "additionalInformation": 1,
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

                                let chapterId = "";
                                let topicId = [];
                                let subjectId = await SubjectModel.findOne({
                                    searchableSubjectName: result.subject.toLowerCase(),
                                    isActive: true
                                }, { _id: 1 })
                                    .exec()

                                if (subjectId) {
                                    chapterId = await ChapterModel.findOne({
                                        gradeId: result.groupId.gradeId,
                                        subjectId,
                                        searchableChapterName: result.chapter[0].toLowerCase(),
                                        isActive: true
                                    }, { _id: 1, chapterName: 1 })
                                        .exec()
                                }

                                if (subjectId && chapterId && result.topics.length > 0) {
                                    topicId = await TopicsModel.find({
                                        gradeId: result.groupId.gradeId,
                                        subjectId,
                                        chapterId,
                                        searchableTopicName: result.topics,
                                        isActive: true
                                    }, {
                                        _id: 1,
                                        topicName: 1
                                    })
                                        .exec()
                                }

                                let topicData = []



                                if (topicId.length == 0 && result.topics.length > 0) {
                                    topicData = result.topics.map(topic => {
                                        return {
                                            _id: "",
                                            topicName: topic
                                        }
                                    })
                                } else {
                                    topicData = topicId
                                }

                                let endDate = new Date(result.eventDate)
                                endDate.setMinutes(endDate.getMinutes() + parseInt(result.duration));

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
                                    scheduledClassId: result._id,
                                    sectionType: result.sectionType,
                                    groupId: result.groupId._id,
                                    groupName: result.groupId.grade + " " + result.groupId.section,
                                    groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",
                                    subject: result.subject ? result.subject : "",
                                    startDateAndTime: result.eventDate, //Submission Date
                                    duration: result.duration,
                                    endDateAndTime: endDate,
                                    chapter: chapterId ? [chapterId] : [{ _id: "", chapterName: result.chapter[0] }],
                                    topics: topicData,
                                    additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                                    fileUrls: result.fileUrls ? result.fileUrls : [],

                                    reminderId,
                                    reminderDate,
                                    reminderNote,
                                    stared,

                                    cancelStatus: result.cancelStatus,
                                    sentStatus: result.sentStatus,
                                    scheduledDateAndTime: result.scheduledDateAndTime ? result.scheduledDateAndTime : "",
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
