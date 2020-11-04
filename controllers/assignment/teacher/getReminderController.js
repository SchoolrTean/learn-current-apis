const DateDiff = require('date-diff');
const mongoose = require('mongoose');

const StudentModel = require('../../../models/authentication/userModel');
const SchoolModel = require('../../../models/assignment/assignmentModel');

/**
 * assignmentId - This id may be assignment id or schoolId depending on calling function
 * userId - this id is studentId or teacherId depending on calling function
 * section type - section from which this condition was called
 * idType - defining which id was it like assignment or schoolId 
 */

exports.checkReminder = (assignmentId, userId, sectionType, idType = null, userType) => {

      mongoose.set('debug', true);

      return new Promise(async (resolve, reject) => {

            try {

                  let query = "";

                  if (userType) {

                        let studentId = await StudentModel.findOne({
                              _id: userId,
                              isActive: true
                        })

                        let studentIds = await StudentModel.find({
                              loginId: studentId.loginId,
                              isActive: true
                        })

                        let studentArray = new Array();
                        
                        for (let index = 0; index < studentIds.length; index++) {
                              studentArray.push(studentIds[index]);
                        }

                        query = {
                              sectionType,
                              "remindedUsers.userId": {
                                    $in: studentArray
                              }
                        }

                  } else {

                        query = {
                              sectionType,
                              "remindedUsers.userId": userId
                        }

                  }



                  if (idType) {
                        query._id = assignmentId;
                  } else {
                        if (sectionType == "ProjectWork") {
                              query.projectWorkIds = assignmentId;
                        } else if (sectionType == "Announcement") {
                              query.announcementIds = assignmentId;
                        } else if (sectionType == "Test") {
                              query.testIds = assignmentId;
                        }
                  }


                  console.log(query);

                  // , {
                  //       "remindedUsers.$.userId": 1,
                  //       date: 1
                  // }

                  SchoolModel.find(query)
                        .exec()
                        .then(reminderExists => {

                              if (reminderExists[0]) {

                                    let remDate = reminderExists[0].remindedUsers[0].date

                                    let splitedDate = remDate.toString().split(' ');
                                    let splitTimestamp = splitedDate[4].split(':')

                                    //Id generated using concatination of month and date and adding year to it in the same way hour and min is concatinated and millisecounds will be added to it
                                    let remId = String(parseInt(remDate.getMonth() + splitedDate[2]) + parseInt(splitedDate[3])) + String(parseInt(splitTimestamp[0] + splitTimestamp[1]) + parseInt(splitTimestamp[2]))

                                    let diff = new DateDiff(new Date(), reminderExists[0].remindedUsers[0].reminderDate);
                                    let minutesDiff = Math.floor(diff.minutes());

                                    if (minutesDiff <= 0) {

                                          resolve({
                                                reminderDate: new Date(reminderExists[0].remindedUsers[0].reminderDate.setMinutes(reminderExists[0].remindedUsers[0].reminderDate.getMinutes() + 330)),
                                                reminderNote: reminderExists[0].remindedUsers[0].reminderNote,
                                                reminderId: remId
                                          })

                                    } else {
                                          resolve(1)
                                    }

                              } else {

                                    resolve(1)

                              }

                        })
                        .catch(err => {
                              console.log(err);
                              reject("Something Went Wrong");
                        })
            } catch {
                  reject("Something Went Wrong");
            }

      });
}