const DateDiff = require('date-diff');

// const ReminderSet = require('./getReminderController');
// const StaredSet = require('./checkStaredController');
// const AssignmentModel = require('../../../models/assignment/assignmentModel');
const formatDate = require('../formatDate');
// const TopicsModel = require('../../../models/admin/master/academic/topicsModel');



const getRecordType = (recordDate) => {

      return new Promise(async (resolve, reject) => {

            try {

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

            } catch (error) {

                  console.log(error);
                  resolve(0)
            }
      })
}



/**
 * Records - assignments records.
 * UserId - student or teacher Id to check certain requirements like reminder, Star.
 * UpdateStudentStatus - Flag to know to call method to remove group Assignment Activity.
 * UserType - 1-Teacher 2- Student 
 */
exports.parseAssignmentData = (assignmentRecords, userId, userType, today = null) => {

      return new Promise(async (resolve, reject) => {

            try {

                  let assignmentsArray = new Array();

                  for (let index = 0; index < assignmentRecords.length; index++) {

                        const record = assignmentRecords[index];

                        console.log(record);

                        if (userType == 2) {
                              await updateStudentSeenStatus(record._id, userId)
                        }

                        let recordObj = {
                              _id: record._id,
                              groupId: record.groupId._id,
                              groupName: record.groupId.section ? record.groupId.grade + record.groupId.section : record.groupId.grade,
                              groupPic: record.groupId.groupPic ? record.groupId.groupPic : "",
                              sectionType: record.sectionType,
                              subject : "",

                              title: "", //projectTitle, announcementTitle, testTitle
                              homeWorkData: [],
                              testSchedule: [],
                              groupData: [],
                              eventDate: "", //dateOfSubmission, announcementDate
                              studentConfirmation: "false",
                              fileUrls: [],
                              updatedStatus: record.updatedStatus ? String(record.updatedStatus) : "false",
                              updatedAssignmentId: record.updatedAssignmentId ? record.updatedAssignmentId : "",
                              updatedAssignmentDate: record.updatedAssignmentDate ? record.updatedAssignmentDate : "",
                              deletedAllStatus: record.teacherDeleteAllStatus ? record.teacherDeleteAllStatus : false,
                              date: record.sentStatus == false ? record.savedDateAndTime : record.date
                        }


                        if (!record.teacherDeleteAllStatus || record.teacherDeleteAllStatus == false) {

                              // if (userType == 1) { //teacher$2b$13$yQTK/jh1fyssJtsWGiG8I.dsDyt2IoyM7ZmEPamOBHa8YJt6KUnf2

                              console.log("record.seenStudents -" + record.seenStudents);

                              recordObj.deliveryTick = record.seenStudents.length == 0 ? String(0) : record.seenStudents.length >= record.activeStudentIds.length ? String(2) : String(1);
                              recordObj.seenCount = record.seenStudents ? record.seenStudents.length : 0;
                              recordObj.stared = record.teacherStared;
                              recordObj.scheduledDateAndTime = record.sentStatus == false ? record.date : "";

                              // } else {

                              //       let remDate = record.date

                              //       let splitedDate = remDate.toString().split(' ');
                              //       let splitTimestamp = splitedDate[4].split(':')

                              //       //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                              //       recordObj.reminderId = String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))

                              //       recordObj.reminderDate = "";
                              //       recordObj.reminderNote = "";

                              //       if (record.remindedUsers.length > 0) {

                              //             record.remindedUsers.forEach(reminder => {

                              //                   if (reminder.userId == userId) {
                              //                         recordObj.reminderDate = reminder.reminderDate;
                              //                         recordObj.reminderNote = reminder.reminderNote;
                              //                   }

                              //             });

                              //       }

                              //       recordObj.stared = record.stared.indexOf(userId) != -1 ? true : false;
                              // }

                              /** This record Type flag is used to show options for the record like delete, delete for all, cancel etc */
                              if (today) {

                                    recordObj.recordType = (today == "true" && record.sentStatus == true) ? 2 : (record.sentStatus == false) ? 3 : 1;

                              } else {
                                    if (record.sentStatus == false) {
                                          recordObj.recordType = 3
                                    } else {
                                          recordObj.recordType = await getRecordType(record.date);
                                    }
                              }

                              if (record.sectionType == "HomeWork") {

                                    let homeWorkObjArray = new Array();

                                    for (let index = 0; index < record.homeWork.length; index++) {

                                          const _homeWork = record.homeWork[index];

                                          let homeWorkObj = {}

                                          homeWorkObj.staredId = _homeWork._id
                                          homeWorkObj.subject = _homeWork.subject ? _homeWork.subject : ""
                                          homeWorkObj.bookType = _homeWork.bookType ? _homeWork.bookType : ""
                                          homeWorkObj.chapter = _homeWork.chapter ? _homeWork.chapter : ""
                                          homeWorkObj.exercises = _homeWork.exercises ? _homeWork.exercises : ""
                                          homeWorkObj.homeWorkId = _homeWork._id

                                          // if (userType == 2) { // For the student

                                          //       if ((_homeWork.completedStudents && _homeWork.completedStudents.length > 0) || (_homeWork.notCompletedStudents && _homeWork.notCompletedStudents.length > 0)) {

                                          //             homeWorkObj.response = ""
                                          //             homeWorkObj.reason = "";
                                          //             homeWorkObj.showResponse = true;

                                          //             let alreadyUpdated = {};

                                          //             if (_homeWork.completedStudents && _homeWork.completedStudents.length > 0) {

                                          //                   let completed = _homeWork.completedStudents.indexOf(userId);

                                          //                   homeWorkObj.response = (completed != -1) ? "true" : "";
                                          //                   homeWorkObj.reason = (completed != -1) ? "completed" : "";

                                          //             }

                                          //             if (homeWorkObj.response == "") {

                                          //                   if (_homeWork.notCompletedStudents && _homeWork.notCompletedStudents.length > 0) {

                                          //                         for (let index = 0; index < _homeWork.notCompletedStudents.length; index++) {
                                          //                               const userId_ = _homeWork.notCompletedStudents[index];

                                          //                               if (userId_.userId == userId) {
                                          //                                     alreadyUpdated = userId_
                                          //                               }
                                          //                         }

                                          //                         homeWorkObj.response = alreadyUpdated.userId ? "false" : "";
                                          //                         homeWorkObj.reason = alreadyUpdated ? alreadyUpdated.reason ? alreadyUpdated.reason : "" : "";

                                          //                   }

                                          //             }

                                          //       } else {

                                          //             // recordObj.upcoming = "false";
                                          //             // homeWorkObj.showResponse = "false"
                                          //             homeWorkObj.response = "";
                                          //             homeWorkObj.reason = "";

                                          //       }

                                          // }

                                          homeWorkObjArray.push(homeWorkObj);

                                    }



                                    recordObj.homeWorkData = homeWorkObjArray;

                              } else if (record.sectionType == "ProjectWork") {

                                    console.log(record);

                                    recordObj.groupData = record.projectWork.groupData;
                                    recordObj.subject = record.projectWork.subject;
                                    recordObj.title = record.projectWork.projectTitle ? record.projectWork.projectTitle : "";
                                    recordObj.eventDate = record.projectWork.eventDate ? record.projectWork.eventDate : "";


                              } else if (record.sectionType == "Announcement") {

                                    console.log(record);

                                    recordObj.announcementId = record.announcement._id;
                                    recordObj.announcement = record.announcement.announcement ? record.announcement.announcement : "";
                                    recordObj.title = record.announcement.announcementTitle ? record.announcement.announcementTitle : "";
                                    recordObj.studentConfirmation = record.announcement.studentConfirmation ? String(record.announcement.studentConfirmation) : "false";
                                    recordObj.eventDate = record.announcement.eventDate ? record.announcement.eventDate : "";
                                    recordObj.showResponse = true;

                                    // if (userType == 2) { // For the student

                                    //       if (record.sentStatus == true) {

                                    //             recordObj.showResponse = "true"
                                    //             recordObj.response = "";

                                    //             if ((record.announcement.coming && record.announcement.coming.length > 0) || (record.announcement.notComing && record.announcement.notComing.length > 0)) {

                                    //                   recordObj.response = record.announcement.coming.indexOf(userId) != -1 ? "true" : record.announcement.notComing.indexOf(userId) != -1 ? "false" : "";

                                    //             }

                                    //       } else {
                                    //             recordObj.showResponse = "false"
                                    //             recordObj.response = "";
                                    //       }

                                    // }

                              } else if (record.sectionType == "ClassRoom") {

                                    console.log(record);

                                    let topics = [];

                                    record.topics.forEach(topic => {
                                          if (topic.videoId) {
                                                topics.push({
                                                      _id: topic._id,
                                                      topicId: topic.topicId,
                                                      topicName: topic.topicName,
                                                      videoId: topic.videoId
                                                });
                                          } else {
                                                topic.videoId = "";
                                                topics.push({
                                                      _id: topic._id,
                                                      topicId: topic.topicId,
                                                      topicName: topic.topicName,
                                                      videoId: ""
                                                });
                                          }
                                    });

                                    recordObj.topics = topics

                              } else {

                                    recordObj.title = record.test.testTitle ? record.test.testTitle : "";

                                    recordObj.testSchedule = record.test.testSchedule ? record.test.testSchedule : [];

                                    console.log(recordObj);


                              }

                              recordObj.fileUrls = record.fileUrls ? record.fileUrls : [];
                              recordObj.additionalInformation = record.additionalInformation ? record.additionalInformation : "";

                              recordObj.cancelStatus = record.cancelStatus;
                        }


                        // if (reminderFilter && recordObj.reminderDate == "") {

                        // } else {
                        assignmentsArray.push(recordObj);
                        console.log("assignmentsArray");
                        console.log(assignmentsArray);
                        // }

                  }

                  resolve(assignmentsArray);

            } catch {
                  reject("Something Went Wrong");
            }

      });
}