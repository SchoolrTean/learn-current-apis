const DateDiff = require('date-diff');

// const ReminderSet = require('./getReminderController');
// const StaredSet = require('./checkStaredController');
// const AssignmentModel = require('../../../models/assignment/assignmentModel');
const formatDate = require('../formatDate');
// const TopicsModel = require('../../../models/admin/master/academic/topicsModel');



const getRecordType = (recordDate) => {

      return new Promise(async (resolve, reject) => {

            // try {

            recordDate.setMinutes(recordDate.getMinutes() - 330);

            console.log("record Date" + recordDate);

            let convertedRecordDate = await formatDate(recordDate);

            console.log("convertedRecordDate" + convertedRecordDate);

            let todayDate = new Date();

            // todayDate.setMinutes(todayDate.getMinutes() + 330);

            let convertedtodayDate = await formatDate(todayDate);

            dateDiff = new DateDiff(convertedtodayDate, new Date(convertedRecordDate));

            dayDiff = Math.floor(dateDiff.days());

            let recordType = (dayDiff == 0) ? "2" : (dayDiff > 0) ? "1" : "3";

            resolve(recordType);

            // } catch (error) {

            //       console.log(error);
            //       resolve(0)
            // }
      })
}



/**
 * Records - assignments records.
 * UserId - student or teacher Id to check certain requirements like reminder, Star.
 * UpdateStudentStatus - Flag to know to call method to remove group Assignment Activity.
 * UserType - 1-Teacher 2- Student 
 */
exports.parseAssignmentData = (assignmentRecords, studentId, userType, today = null) => {

      return new Promise(async (resolve, reject) => {

            // try {

            let assignmentsArray = new Array();

            for (let index = 0; index < assignmentRecords.length; index++) {

                  const record = assignmentRecords[index];

                  console.log(record);

                  let endDate = new Date(record.eventDate)
                  endDate.setMinutes(endDate.getMinutes() + parseInt(record.duration));

                  /****************************** Check Completion Status *****************************/

                  let completionStatus = "";
                  let reason = "";

                  if (record.sectionType == "Homework" || record.sectionType == "ProjectWork") {

                        if (record.completedStudents.length > 0) {
                              let index1 = 0;

                              while (index1 < record.completedStudents || completionStatus == "") {
                                    if (record.completedStudents.userId && String(record.completedStudents.userId) == String(studentId)) {
                                          completionStatus = "true"
                                    }
                                    index1++
                              }

                        }

                        if (record.notCompletedStudents.length > 0) {
                              let index2 = 0;

                              while (index2 < record.notCompletedStudents || completionStatus == "") {
                                    if (record.completedStudents.userId && String(record.notCompletedStudents.userId) == String(studentId)) {
                                          completionStatus = "false",
                                          reason = record.completedStudents.reason
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
                  /****************************** ./Check Completion Status *****************************/

                  let recordObj = {
                        _id: record._id,
                        sectionType: record.sectionType,

                        subject: record.subject ? record.subject : "",
                        groupId: record.groupId._id,
                        groupName: record.groupId.section ? record.groupId.grade + " " + record.groupId.section : record.groupId.grade,

                        title: record.title ? record.title : "",
                        // eventDate: record.eventDate ? record.eventDate : "",
                        duration: record.duration ? record.duration : "",
                        endDateAndTime: endDate,
                        chapter: record.chapter && record.chapter.length > 0 ? record.chapter.join(',') : "",
                        topics: record.topics && record.topics.length > 0 ? record.topics.join(',') : "",
                        exercise: record.exerciseId ? record.exerciseId.exerciseName : "",

                        announcement: record.announcement ? record.announcement : "",

                        fileUrls: record.fileUrls ? record.fileUrls : [],
                        additionalInformation: record.additionalInformation ? record.additionalInformation : "",

                        completionStatus,
                        reason,

                        cancelStatus: String(record.cancelStatus),
                        deletedAllStatus: record.teacherDeleteAllStatus ? String(record.teacherDeleteAllStatus) : "false",

                        date: record.date,

                        showDot: "false",
                        type: "MSG"
                  }

                  if (record.sectionType == "Test" || record.sectionType == "Class") {
                        recordObj.startDateAndTime = record.eventDate ? record.eventDate : record.date;
                  } else {
                        recordObj.eventDate = record.eventDate ? record.eventDate : record.date;
                  }



                  // if (reminderFilter && recordObj.reminderDate == "") {

                  // } else {
                  assignmentsArray.push(recordObj);
                  // }

            }

            resolve(assignmentsArray);

            // } catch {
            //       reject("Something Went Wrong");
            // }

      });
}





// if (!record.teacherDeleteAllStatus || record.teacherDeleteAllStatus == false) {

//       // if (userType == 1) { //teacher$2b$13$yQTK/jh1fyssJtsWGiG8I.dsDyt2IoyM7ZmEPamOBHa8YJt6KUnf2

//       console.log("record.seenStudents -" + record.seenStudents);

//       // recordObj.deliveryTick = record.seenStudents.length == 0 ? String(0) : record.seenStudents.length >= record.activeStudentIds.length ? String(2) : String(1);
//       // recordObj.seenCount = record.seenStudents ? record.seenStudents.length : 0;
//       // recordObj.stared = record.teacherStared;
//       recordObj.scheduledDateAndTime = record.sentStatus == false ? record.date : "";

//       /** This record Type flag is used to show options for the record like delete, delete for all, cancel etc */
//       if (today) {

//             recordObj.recordType = (today == "true" && record.sentStatus == true) ? 2 : (record.sentStatus == false) ? 3 : 1;

//       } else {
//             if (record.sentStatus == false) {
//                   recordObj.recordType = 3
//             } else {
//                   recordObj.recordType = await getRecordType(record.date);
//             }
//       }

//       if (record.sectionType == "HomeWork") {

//             recordObj.subject = record.subject ? record.subject : ""
//             recordObj.title = record.bookType ? record.title : ""
//             recordObj.eventDate = record.eventDate ? record.eventDate : ""
//             recordObj.chapters = record.chapter && record.chapter.length > 0 ? record.chapter.join(',') : ""
//             recordObj.topics = record.topics && record.topics.length > 0 ? record.topics.join(',') : "";
//             recordObj.exercises = record.exercises && record.exercises.length > 0 ? record.exercises.join(',') : "";

//       } else if (record.sectionType == "ProjectWork") {

//             console.log(record);

//             recordObj.subject = record.subject;
//             recordObj.title = record.title ? record.title : "";
//             recordObj.eventDate = record.eventDate ? record.eventDate : "";
//             recordObj.groupData = record.groupData;

//       } else if (record.sectionType == "Announcement") {

//             console.log(record);

//             recordObj.announcement = record.announcement ? record.announcement : "";
//             recordObj.title = record.announcementTitle ? record.announcementTitle : "";
//             recordObj.studentConfirmation = record.studentConfirmation ? String(record.studentConfirmation) : "false";
//             recordObj.eventDate = record.eventDate ? record.eventDate : "";
//             recordObj.showResponse = true;

//       } else if (record.sectionType == "ClassRoom") {

//             console.log(record);

//             let topics = [];

//             record.topics.forEach(topic => {
//                   if (topic.videoId) {
//                         topics.push({
//                               _id: topic._id,
//                               topicId: topic.topicId,
//                               topicName: topic.topicName,
//                               videoId: topic.videoId
//                         });
//                   } else {
//                         topic.videoId = "";
//                         topics.push({
//                               _id: topic._id,
//                               topicId: topic.topicId,
//                               topicName: topic.topicName,
//                               videoId: ""
//                         });
//                   }
//             });

//             recordObj.topics = topics

//       } else {

//             recordObj.subject = record.subject;
//             recordObj.title = record.title ? record.title : "";
//             recordObj.eventDate = record.eventDate ? record.eventDate : "";
//             recordObj.chapter = record.chapter ? record.chapter.join() : "";
//             console.log(recordObj);
//       }

//       recordObj.fileUrls = record.fileUrls ? record.fileUrls : [];
//       recordObj.additionalInformation = record.additionalInformation ? record.additionalInformation : "";

//       recordObj.cancelStatus = record.cancelStatus;
// }