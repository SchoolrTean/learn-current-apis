const AssignmentModel = require('../../../../models/assignment/assignmentModel');
const SubjectModel = require('../../../../models/admin/master/academic/subjectsModel');
const ChapterModel = require('../../../../models/admin/learn/academic/chaptersModel');
const TopicsModel = require('../../../../models/admin/learn/academic/topicsModel');
const AssignmentStudentSubmissionRatingModel = require('../../../../models/assignment/assignmentSubmissionRatingModel');
const VerifyStudent = require('../../../../middleware/verifyStudent');

module.exports = (req, res, next) => {

    if (req.params.studentId && req.params.classId && req.params.homeWorkId) {

        let studentId = req.params.studentId;
        let classId = req.params.classId;
        let homeWorkId = req.params.homeWorkId;

        VerifyStudent(studentId, classId)
            .then(response => {

                if (response && response.statusCode != "0") {

                    AssignmentModel.findOne({
                        _id: homeWorkId,
                        groupId: classId,
                        sectionType: "HomeWork",
                        teacherDeleteAllStatus: false,
                        teacherDeleteStatus: false,
                        isActive: true
                    }, {
                        "groupId": 1,
                        "subject": 1,
                        "title": 1,
                        "eventDate": 1,
                        "chapter": 1,
                        "topics": 1,
                        "exerciseId": 1,
                        "workSheetIds": 1,
                        "additionalInformation": 1,
                        "fileUrls": 1,
                        "completedStudents": 1,
                        "notCompletedStudents": 1,
                        "remindedUsers": 1,
                        "stared": 1,
                        "cancelStatus": 1,
                        "date": 1
                    })
                        .populate('groupId', 'grade section gradeId groupPic')
                        .populate('exerciseId', 'chapterId topicId exerciseName')
                        .populate('workSheetIds', 'testPaperTitle')
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
                                        searchableTopicName: {
                                            $in: result.topics.join('%-%').toLowerCase().split('%-%')
                                        },
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


                                let studentSubmissionAndRatings = await AssignmentStudentSubmissionRatingModel.find({
                                    studentId,
                                    assignmentId: result._id,
                                    isActive: true
                                })

                                console.log(studentSubmissionAndRatings)

                                let submissionRatingCheckList = studentSubmissionAndRatings.map(submission => submission.exerciseId ? String(submission.exerciseId) : submission.workSheetId ? String(submission.workSheetId) : String(submission._id)) //|| 

                                console.log(submissionRatingCheckList)

                                let attachedFiles = [];

                                let submitInClassFlag = 0;



                                if (result.workSheetIds && result.workSheetIds.length > 0) {

                                    for (let index = 0; index < result.workSheetIds.length; index++) {
                                        const workSheet = result.workSheetIds[index];

                                        attachedFiles.push({
                                            _id: workSheet._id,
                                            fileUrl: "",
                                            chapterId: "",
                                            topicId: "",
                                            name: workSheet.testPaperTitle,
                                            attachmentType: "worksheet", //WorkSheet
                                            rating: submissionRatingCheckList.indexOf(String(workSheet._id)) != -1 ? studentSubmissionAndRatings[submissionRatingCheckList.indexOf(String(workSheet._id))].rating ? studentSubmissionAndRatings[submissionRatingCheckList.indexOf(String(workSheet._id))].rating : 0 : 0,
                                            submitted: submissionRatingCheckList.indexOf(String(workSheet._id)) != -1 ? studentSubmissionAndRatings[submissionRatingCheckList.indexOf(String(workSheet._id))].submitted : false
                                        })
                                    }

                                }

                                // let SavedHomeWorkFileRating = [];

                                if (studentSubmissionAndRatings.length > 0) {

                                    for (let index = 0; index < studentSubmissionAndRatings.length; index++) {
                                        const studentSubmittedFiles = studentSubmissionAndRatings[index];

                                        if (studentSubmittedFiles.fileUrl) {

                                            submitInClassFlag = 1 //since submission of files has been done so submisssion in class will be hidden

                                            attachedFiles.push({
                                                _id: studentSubmittedFiles._id,
                                                fileUrl: studentSubmittedFiles.fileUrl,
                                                chapterId: "",
                                                topicId: "",
                                                name: "Attachment",//studentSubmittedFiles.fileUrl,
                                                attachmentType: "file", //Files
                                                rating: studentSubmittedFiles.rating ? studentSubmittedFiles.rating : 0,
                                                submitted: studentSubmittedFiles.submitted ? studentSubmittedFiles.submitted : false
                                            })

                                        } else if (studentSubmittedFiles.submitAssignmentInClass && studentSubmittedFiles.submitAssignmentInClass == true) {
                                            submitInClassFlag = 1;

                                            attachedFiles.push({
                                                _id: "submitInClass",
                                                fileUrl: "",
                                                chapterId: "",
                                                topicId: "",
                                                name: "Check here to submit assignment in class",
                                                attachmentType: "submitInClass", //Files
                                                rating: studentSubmittedFiles.rating ? studentSubmittedFiles.rating : 0,
                                                submitted: studentSubmittedFiles.submitted
                                            })

                                        }

                                    }

                                }

                                console.log(attachedFiles);

                                if (result.exerciseId) {

                                    attachedFiles.push({
                                        _id: result.exerciseId ? result.exerciseId._id : "",
                                        fileUrl: "",
                                        chapterId: result.exerciseId ? result.exerciseId.chapterId : "",
                                        topicId: result.exerciseId ? result.exerciseId.topicId : "",
                                        name: result.exerciseId ? result.exerciseId.exerciseName : "",
                                        attachmentType: "exercise", //exercise
                                        rating: result.exerciseId && submissionRatingCheckList.indexOf(String(result.exerciseId._id)) != -1 ? studentSubmissionAndRatings[submissionRatingCheckList.indexOf(String(result.exerciseId._id))].rating ? studentSubmissionAndRatings[submissionRatingCheckList.indexOf(String(result.exerciseId._id))].rating : 0 : 0,
                                        submitted: result.exerciseId && submissionRatingCheckList.indexOf(String(result.exerciseId._id)) != -1 ? studentSubmissionAndRatings[submissionRatingCheckList.indexOf(String(result.exerciseId._id))].submitted : false,
                                    })

                                }

                                if (submitInClassFlag == 0 && !result.exerciseId && (!result.workSheetIds || (result.workSheetIds && result.workSheetIds.length == 0))) {

                                    attachedFiles.push({
                                        _id: "submitInClass",
                                        fileUrl: "",
                                        chapterId: "",
                                        topicId: "",
                                        name: "Check here to submit assignment in class",
                                        attachmentType: "submitInClass", //Files
                                        rating: 0,
                                        submitted: false
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

                                let completionStatus = "";
                                let reason = "";

                                if (result.completedStudents.length > 0) {
                                    let index1 = 0;

                                    while (index1 < result.completedStudents.length && completionStatus == "") {
                                        if (result.completedStudents.userId && String(result.completedStudents.userId) == String(studentId)) {
                                            completionStatus = "true"
                                        }
                                        index1++
                                    }

                                }

                                if (result.notCompletedStudents.length > 0) {
                                    let index2 = 0;

                                    while (index2 < result.notCompletedStudents.length && completionStatus == "") {
                                        if (result.completedStudents.userId && String(result.notCompletedStudents.userId) == String(studentId)) {
                                            completionStatus = "false";
                                            reason = result.completedStudents.reason
                                        }
                                        index2++
                                    }
                                }


                                console.log(attachedFiles)

                                res.status(200).json({
                                    statusCode: "1",
                                    homeWorkId: result._id,
                                    sectionType: result.sectionType,
                                    groupId: result.groupId._id,
                                    groupName: result.groupId.grade + " " + result.groupId.section,
                                    groupPic: result.groupId.groupPic ? result.groupId.groupPic : "",
                                    subject: result.subject ? result.subject : "",
                                    title: result.title ? result.title : "",
                                    eventDate: result.eventDate, //Submission Date
                                    chapter: chapterId ? [chapterId] : [{ _id: "", chapterName: result.chapter[0] }],
                                    topics: topicData,
                                    exerciseId: result.exerciseId ? result.exerciseId._id : "",
                                    reminderId,
                                    reminderDate,
                                    reminderNote,
                                    stared,
                                    completionStatus,
                                    reason,
                                    // exerciseChapterId: result.exerciseId ? result.exerciseId.chapterId : "",
                                    // exerciseTopicId: result.exerciseId ? result.exerciseId.topicId : "",
                                    // exerciseName: result.exerciseId ? result.exerciseId.exerciseName : "",
                                    // exerciseRating: result.exerciseId && submissionRatingCheckList.indexOf(result.exerciseId._id) != -1 ? studentSubmissionAndRatings[submissionRatingCheckList.indexOf(result.exerciseId._id)].rating : 0,
                                    // exerciseSubmittedStatus: result.exerciseId && submissionRatingCheckList.indexOf(result.exerciseId._id) != -1 ? studentSubmissionAndRatings[submissionRatingCheckList.indexOf(result.exerciseId._id)].submitted : false,
                                    workSheetData: result.workSheetIds,
                                    additionalInformation: result.additionalInformation ? result.additionalInformation : "",
                                    fileUrls: result.fileUrls ? result.fileUrls : [],
                                    attachedFiles,

                                    cancelStatus: result.cancelStatus,
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
                        message: response.message
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
