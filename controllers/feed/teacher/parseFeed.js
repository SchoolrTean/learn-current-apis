
/**
 * Records - assignments records.
 * UserId - student or teacher Id to check certain requirements like reminder, Star.
 * UpdateStudentStatus - Flag to know to call method to remove group Assignment Activity.
 * UserType - 1-Teacher 2- Student 
 */
module.exports = (assignmentRecords) => {

    return new Promise(async (resolve, reject) => {

        try {

            let assignmentsArray = new Array();

            for (let index = 0; index < assignmentRecords.length; index++) {

                const record = assignmentRecords[index];

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
                    submissionStatus: "false",
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





                // if (!record.teacherDeleteAllStatus || record.teacherDeleteAllStatus == false) {


                //     if (record.sectionType == "HomeWork") {

                //         recordObj.subject = record.subject ? record.subject : ""
                //         recordObj.title = record.title ? record.title : ""
                //         recordObj.eventDate = record.eventDate ? record.eventDate : ""
                //         recordObj.chapter = record.chapter && record.chapter.length > 0 ? record.chapter.join(',') : ""
                //         recordObj.topics = record.topics && record.topics.length > 0 ? record.topics.join(',') : "";

                //     } else if (record.sectionType == "ProjectWork") {

                //         console.log(record);
                //         recordObj.subject = record.subject;
                //         recordObj.title = record.title ? record.title : "";
                //         recordObj.eventDate = record.eventDate ? record.eventDate : "";

                //     } else if (record.sectionType == "Announcement") {

                //         console.log(record);

                //         recordObj.announcement = record.announcement ? record.announcement : "";
                //         recordObj.title = record.announcementTitle ? record.announcementTitle : "";
                //         recordObj.eventDate = record.eventDate ? record.eventDate : "";

                //     } else if (record.sectionType == "ClassRoom") {

                //         console.log(record);

                //         let topics = [];

                //         record.topics.forEach(topic => {
                //             if (topic.videoId) {
                //                 topics.push({
                //                     _id: topic._id,
                //                     topicId: topic.topicId,
                //                     topicName: topic.topicName,
                //                     videoId: topic.videoId
                //                 });
                //             } else {
                //                 topic.videoId = "";
                //                 topics.push({
                //                     _id: topic._id,
                //                     topicId: topic.topicId,
                //                     topicName: topic.topicName,
                //                     videoId: ""
                //                 });
                //             }
                //         });

                //         recordObj.topics = topics

                //     } else {

                //         recordObj.subject = record.subject;
                //         recordObj.title = record.title ? record.title : "";
                //         recordObj.eventDate = record.eventDate ? record.eventDate : "";
                //         recordObj.chapter = record.chapter ? record.chapter.join() : "";
                //         console.log(recordObj);

                //     }

                //     recordObj.fileUrls = record.fileUrls ? record.fileUrls : [];
                //     recordObj.additionalInformation = record.additionalInformation ? record.additionalInformation : "";

                // }