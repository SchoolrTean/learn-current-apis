const DateDiff = require('date-diff');

/**
 * Records - assignments records.
 * UserId - student or teacher Id to check certain requirements like reminder, Star.
 * UpdateStudentStatus - Flag to know to call method to remove group Assignment Activity.
 * UserType - 1-Teacher 2- Student 
 */
module.exports = (assignmentRecords, studentId) => {

    return new Promise(async (resolve, reject) => {

        try {

            let assignmentsArray = new Array();

            for (let index = 0; index < assignmentRecords.length; index++) {

                const record = assignmentRecords[index];

                let completionStatus = "";

                if (record.sectionType == "Homework" || record.sectionType == "ProjectWork") {

                    if (record.completedStudents && record.completedStudents.length > 0) {
                        let index1 = 0;

                        while (index1 < record.completedStudents && completionStatus == "") {
                            if (record.completedStudents.userId && String(record.completedStudents.userId) == String(studentId)) {
                                completionStatus = "true"
                            }
                            index1++
                        }

                    }

                    if (record.notCompletedStudents && record.notCompletedStudents.length > 0) {
                        let index2 = 0;

                        while (index2 < record.notCompletedStudents && completionStatus == "") {
                            if (record.completedStudents.userId && String(record.notCompletedStudents.userId) == String(studentId)) {
                                completionStatus = "false"
                            }
                            index2++
                        }
                    }

                } else if (record.sectionType == "Announcement" && record.studentConfirmation == true) {

                    completionStatus = record.coming ? record.coming.indexOf(String(studentId)) != -1 ? "true" : "" : "";
                    completionStatus = record.notComing && completionStatus == "" ? record.notComing.indexOf(String(studentId)) != -1 ? "false" : "" : "";

                } else if (record.sectionType == "Class" || record.sectionType == "Test") {
                    // eventDate
                    // duration
                    let endDate = new Date(record.eventDate)
                    endDate.setMinutes(endDate.getMinutes() + parseInt(record.duration));

                    let dateDiff = new DateDiff(new Date().setMinutes(new Date().getMinutes() + 330), new Date(endDate));

                    if (dateDiff.minutes() < 0) {
                        completionStatus = "false"
                    } else if (dateDiff.minutes() > 0) {
                        completionStatus = "true"
                    }

                }
                // else if (record.sectionType == "ProjectWork") {
                //     // eventDate
                //     // duration
                //     let endDate = new Date(record.eventDate)
                //     endDate.setMinutes(endDate.getMinutes() + parseInt(record.duration));

                //     let dateDiff = new DateDiff(new Date().setMinutes(new Date().getMinutes() + 330), new Date(endDate));

                //     if (dateDiff.minutes() < 0) {
                //         completionStatus = "false"
                //     } else if (dateDiff.minutes() > 0) {
                //         completionStatus = "true"
                //     }

                // }

                let recordObj = {
                    _id: record._id,
                    groupId: record.groupId._id,
                    groupName: record.groupId.section ? record.groupId.grade + record.groupId.section : record.groupId.grade,
                    sectionType: record.sectionType,
                    title: record.title ? record.title : "", //projectTitle, announcementTitle, testTitle
                    subject: record.subject ? record.subject : "",
                    chapter: record.chapter && record.chapter.length > 0 ? record.chapter.join(',') : "",
                    topics: record.topics && record.topics.length > 0 ? record.topics.join(',') : "",
                    eventDate: record.eventDate ? record.eventDate : record.date,
                    additionalInformation: record.additionalInformation ? record.additionalInformation : "",
                    fileUrls: record.fileUrls ? record.fileUrls : [],
                    cancelStatus: "false",
                    submissionStatus: completionStatus,
                    date: record.date,
                    showDot: "false",
                    type: "MSG"
                }

                assignmentsArray.push(recordObj);

            }

            resolve(assignmentsArray);

        } catch {
            reject("Something Went Wrong");
        }

    });
}