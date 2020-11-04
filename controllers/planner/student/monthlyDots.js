const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');

const AssignmentModel = require('../../../models/assignment/assignmentModel');

const StudentModel = require('../../../models/authentication/userModel');

const PersonalEventModel = require('../../../models/planner/personalEventsModel');


const monthlyDots = (req, res, next) => {

      if (req.params.studentId) {

            let studentId = req.params.studentId;
            let date = req.params.date;

            StudentModel.findOne({
                  _id: studentId,
                  type: 1, //Student
                  isActive: true
            })
                  .exec()
                  .then(async studentDetails => {

                        console.log(studentDetails);

                        if (studentDetails) {

                              ClassStudentConnectionModel.find({
                                    studentId,
                                    connectionStatus: 1,
                                    isActive: 1
                              }, {
                                    _id: 0,
                                    classId: 1,
                                    subjects: 1,
                                    secondLanguage: 1,
                                    thirdLanguage: 1,
                              })
                                    .then(async classesConnected => {

                                          console.log(classesConnected);

                                          if (classesConnected.length > 0) {

                                                // connectionsArray = new Array();

                                                // for (let index = 0; index < connections.length; index++) {
                                                //       let connection = connections[index];
                                                //       connectionsArray.push(connection.groupId)
                                                // }

                                                // console.log(connectionsArray);

                                                let classWiseSubject = [];

                                                for (let index = 0; index < classesConnected.length; index++) {
                                                      const connection = classesConnected[index];

                                                      let subjectArray = []
                                                      subjectArray = (connection.subjects && connection.subjects.length > 0) && connection.subjects;
                                                      connection.secondLanguage && subjectArray.push(connection.secondLanguage)
                                                      connection.thirdLanguage && subjectArray.push(connection.thirdLanguage)

                                                      console.log("subjectArray")
                                                      console.log(subjectArray)

                                                      if (subjectArray.length > 0) {

                                                            classWiseSubject.push({
                                                                  groupId: connection.classId,
                                                                  subject: {
                                                                        $in: subjectArray
                                                                  }
                                                            })

                                                      }

                                                }

                                                let selectedDate = "";

                                                if (date) {
                                                      selectedDate = new Date(date);
                                                } else {
                                                      selectedDate = new Date();
                                                }

                                                // let nextDay = new Date(today);

                                                let nextMonth = (selectedDate.getUTCMonth() + 2) < 10 ? "0" + String(selectedDate.getUTCMonth() + 2) : (selectedDate.getUTCMonth() + 2) > 12 ? "01" : selectedDate.getUTCMonth() + 2;

                                                let nextYear = (selectedDate.getUTCMonth() + 1) == 12 ? selectedDate.getFullYear() + 1 : selectedDate.getFullYear();

                                                let formattedNextMonth = new Date(nextYear + '-' + nextMonth + '-01T00:00:00.000Z');

                                                let currentMonth = (selectedDate.getUTCMonth() + 1) < 10 ? "0" + String(selectedDate.getUTCMonth() + 1) : selectedDate.getUTCMonth() + 1;

                                                let formattedCurrentMonth = new Date(selectedDate.getFullYear() + '-' + currentMonth + '-01T00:00:00.000Z');


                                                let tests = AssignmentModel.find({
                                                      // groupId: {
                                                      //       $in: connectionsArray
                                                      // },
                                                      $or: classWiseSubject,
                                                      isActive: true,
                                                      sentStatus: true,
                                                      // previousRecord: false,
                                                      teacherDeleteAllStatus: false,
                                                      // deleted: {
                                                      //       "$nin": studentId
                                                      // },//test.testSchedule.
                                                      "eventDate": {
                                                            $gte: new Date(formattedCurrentMonth),
                                                            $lt: new Date(formattedNextMonth)

                                                      }
                                                }
                                                      // , {
                                                      //       "test.testSchedule": 1,
                                                      //       "cancelStatus": 1
                                                      // }
                                                )

                                                // let projectAndAnnouncement = AssignmentModel.find({
                                                //       groupId: {
                                                //             $in: connectionsArray
                                                //       },
                                                //       isActive: true,
                                                //       sentStatus: true,
                                                //       previousRecord: false,
                                                //       teacherDeleteAllStatus: false,
                                                //       deleted: {
                                                //             "$nin": studentId
                                                //       },
                                                //       $or: [{
                                                //             "announcement.eventDate": {
                                                //                   $exits: true
                                                //             }
                                                //       }, {
                                                //             "projectWork.eventDate": {
                                                //                   $exits: true
                                                //             }
                                                //       }],
                                                //       $or: [{
                                                //             "announcement.eventDate": {
                                                //                   $gte: new Date(formattedCurrentMonth),
                                                //                   $lt: new Date(formattedNextMonth)

                                                //             }
                                                //       },
                                                //       {
                                                //             "projectWork.eventDate": {
                                                //                   $gte: new Date(formattedCurrentMonth),
                                                //                   $lt: new Date(formattedNextMonth)

                                                //             }
                                                //       },
                                                //       ]
                                                // }, {
                                                //       "sectionType": 1,
                                                //       "announcement.eventDate": 1,
                                                //       "projectWork.eventDate": 1,
                                                //       "cancelStatus": 1
                                                // })

                                                let personalEvents = PersonalEventModel.find({
                                                      userId: studentId,
                                                      $or: [{
                                                            eventStartTimestamp: {
                                                                  $gte: new Date(formattedCurrentMonth),
                                                                  $lt: new Date(formattedNextMonth)

                                                            }
                                                      }, {
                                                            eventStartTimestamp: {
                                                                  $gte: new Date(formattedCurrentMonth),
                                                                  $lt: new Date(formattedNextMonth)

                                                            }
                                                      }],
                                                      isActive: true
                                                }, {
                                                      eventStartTimestamp: 1
                                                })

                                                Promise.all([tests, personalEvents])//projectAndAnnouncement,
                                                      .then(allEvents => {

                                                            console.log(allEvents);

                                                            let allEventsArray = new Array();


                                                            // if (allEvents[0].length > 0) {
                                                            //       allEvents[0].forEach(testRecord => {
                                                            //             testRecord.test.testSchedule.forEach(test => {

                                                            //                   let eventDate = test.eventDate.getUTCMonth()

                                                            //                   if (currentMonth == eventDate + 1) {

                                                            //                         allEventsArray.push({
                                                            //                               eventType: "test",
                                                            //                               eventDate: test.eventDate,
                                                            //                               cancelStatus: testRecord.cancelStatus
                                                            //                         })

                                                            //                   }

                                                            //             });
                                                            //       });
                                                            // }

                                                            if (allEvents[0].length > 0) {
                                                                  allEvents[0].forEach(assignmentRecord => {

                                                                        allEventsArray.push({
                                                                              eventType: assignmentRecord.sectionType,
                                                                              eventDate: assignmentRecord.eventDate,//assignmentRecord.sectionType == "Announcement" ? assignmentRecord.announcement.eventDate : assignmentRecord.projectWork.eventDate,
                                                                              cancelStatus: assignmentRecord.cancelStatus
                                                                        })
                                                                  });
                                                            }

                                                            if (allEvents[1].length > 0) {
                                                                  allEvents[1].forEach(personalEvent => {
                                                                        allEventsArray.push({
                                                                              eventType: "Personal Event",
                                                                              eventDate: personalEvent.eventStartTimestamp,
                                                                              cancelStatus: false
                                                                        })
                                                                  });
                                                            }




                                                            return res.status(200).json({
                                                                  statusCode: "1",
                                                                  monthlyDotsList: allEventsArray,
                                                                  message: "Data Found..!!"
                                                            })

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            return res.status(200).json({
                                                                  statusCode: "0",
                                                                  message: "Something went wrong. Please try again..!!"
                                                            })

                                                      })


                                          } else {

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "No Records Found..!!"
                                                });

                                          }
                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          })
                                    });

                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: "Access Denied..!!"
                              });

                        }
                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please try again..!!"
                        })
                  });

      } else {

            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });

      }
}

module.exports = monthlyDots;