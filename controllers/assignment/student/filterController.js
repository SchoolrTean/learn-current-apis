const DateDiff = require('date-diff');

const ConnectionModel = require('../../../models/group/connectionModel');

const AssignmentModel = require('../../../models/assignment/assignmentModel');

const StudentModel = require('../../../models/authentication/userModel');

const ParseAssignments = require('./parseSchoolAssignmentsController');

exports.filterSchoolData = (req, res, next) => {

      if (req.params.studentId && req.params.filterId) {

            let studentId = req.params.studentId;
            let teacherId = req.params.teacherId;
            let filter = req.params.filterId;

            StudentModel.findOne({
                        _id: studentId,
                        type: true, //Student
                        isActive: true
                  })
                  .exec()
                  .then(studentDetails => {

                        //console.log(studentDetails);

                        if (studentDetails) {

                              let groupQuery = {
                                    studentId,
                                    connectionStatus: 2,
                                    isActive: true
                              }

                              if (teacherId) {
                                    groupQuery.teacherId = teacherId
                              }

                              ConnectionModel.find(groupQuery, {
                                          _id: 0,
                                          groupId: 1
                                    })
                                    .then(connections => {

                                          let groupList = new Array();

                                          for (let index = 0; index < connections.length; index++) {
                                                groupList.push(connections[index].groupId);
                                          }

                                          if (connections) {

                                                if (((filter >= 1 && filter < 8) || filter == 9) || (filter == 8 && teacherId)) {

                                                      let filterQuery = {
                                                            groupId: {
                                                                  $in: groupList
                                                            },
                                                            deleted: {
                                                                  $nin: studentId
                                                            },
                                                            isActive: true,
                                                            sentStatus: true
                                                      }

                                                      switch (filter) {

                                                            case '1':
                                                                  filterQuery.sectionType = "HomeWork";
                                                                  break;

                                                            case '2':
                                                                  filterQuery.sectionType = "Announcement";
                                                                  break;

                                                            case '3':
                                                                  filterQuery.sectionType = "ProjectWork";
                                                                  break;

                                                            case '4':
                                                                  filterQuery.sectionType = "Test";
                                                                  break;

                                                            case '5':
                                                                  filterQuery.cancelStatus = true;
                                                                  break;

                                                            case '6':
                                                                  filterQuery.stared = studentId;
                                                                  break;

                                                            case '7':
                                                                  filterQuery["remindedUsers.userId"] = studentId;
                                                                  filterQuery.teacherDeleteAllStatus = false;
                                                                  filterQuery.cancelStatus = false;
                                                                  break;

                                                            case '9':
                                                                  filterQuery.sectionType = "ClassRoom";
                                                                  break;

                                                            default:
                                                                  break;
                                                      }


                                                      /**Current Date or Selected Date Records */
                                                      AssignmentModel.find(filterQuery, {
                                                                  homeWork: 1,
                                                                  projectWork: 1,
                                                                  announcement: 1,
                                                                  test: 1,
                                                                  topics: 1,

                                                                  //common things
                                                                  groupId: 1,
                                                                  sectionType: 1,
                                                                  fileUrls: 1,
                                                                  additionalInformation: 1,
                                                                  cancelStatus: 1,
                                                                  teacherDeleteAllStatus: 1,
                                                                  remindedUsers: 1,
                                                                  sentStatus: 1,
                                                                  stared: 1,
                                                                  date: 1,
                                                                  updatedStatus: 1,
                                                                  updatedAssignmentId: 1,
                                                                  updatedAssignmentDate: 1
                                                            })
                                                            .sort({
                                                                  'date': -1
                                                            })
                                                            .populate({
                                                                  path: 'projectWork.groupData.students',
                                                                  select: 'firstName surName profilePic'
                                                            })
                                                            .populate({
                                                                  path: 'groupId',
                                                                  select: 'grade section groupPic teacherId',
                                                                  populate: {
                                                                        path: 'teacherId',
                                                                        select: 'firstName surname _id',
                                                                  }
                                                            })
                                                            .exec()
                                                            .then(async records => {

                                                                  console.log(records);

                                                                  if (records.length > 0) {

                                                                        const activityData = await ParseAssignments.parseAssignmentData(records, studentId, 2, "");

                                                                        console.log(activityData);

                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              assignmentRecords: activityData,
                                                                              message: "Data Found...!!"
                                                                        });

                                                                  } else {
                                                                        res.status(200).json({
                                                                              statusCode: "1",
                                                                              assignmentRecords: [],
                                                                              message: "No Record Found...!!"
                                                                        });
                                                                  }
                                                            })
                                                            .catch(err => {
                                                                  console.log(err)
                                                                  res.status(200).json({
                                                                        statusCode: 0,
                                                                        message: "Something went wrong. Please try later..!!"
                                                                  })
                                                            });



                                                } else {
                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Access Denied..!!"
                                                      })
                                                }


                                          } else {
                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Please check connection with teacher..!!!"
                                                })
                                          }

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied..!!"
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


// SchoolModel.find(filterQuery, {
//             taughtInClassIds: 1,
//             homeWorkIds: 1,
//             projectWorkIds: 1,
//             announcementIds: 1,
//             testIds: 1,

//             //common things
//             sectionType: 1,
//             cancelStatus: 1,
//             teacherDeleteAllStatus: 1,
//             date: 1,
//             upcomingDate: 1,
//             remindedUsers: 1
//       })
//       .sort({
//             'date': -1
//       })
//       .populate({
//             path: 'projectWorkIds',
//             select: 'projectTitle eventDate groupData note stared sectionUrls',
//             populate: {
//                   path: 'groupData.students',
//                   select: 'name',
//             }
//       })
//       .populate('testIds', 'testTitle subject chapter eventDate stared note sectionUrls')
//       .populate('taughtInClassIds', 'subjectName topics star note sectionUrls')
//       .populate('announcementIds', 'announcementTitle eventDate announcement studentConfirmation stared completedStudents notCompletedStudents sectionUrls')
//       .populate('homeWorkIds', 'subject bookType chapter exercises note stared completedStudents notCompletedStudents sectionUrls')
//       .exec()