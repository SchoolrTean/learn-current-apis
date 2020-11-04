const verifyTeacher = require('../../../middleware/verifyTeacher');

const AssignmentModel = require('../../../models/assignment/assignmentModel');
const ConnectionsModel = require('../../../models/group/connectionModel');
const GroupList = require('../../group/teacher/activeGroupsList');

const ParseAssignments = require('../../assignment/teacher/parseSchoolAssignmentsController');

exports.filterSchoolData = (req, res, next) => {

     if (req.params.teacherId && req.params.filterId < 9) {

          let teacherId = req.params.teacherId;
          let groupId = req.params.groupId ? req.params.groupId : "";
          let filter = req.params.filterId;

          verifyTeacher(teacherId, groupId, async (error, response) => {

               //console.log(response);

               if (response && response.statusCode != "0") {

                    if (filter >= 1 && filter <= 8) {

                         let filterQuery = {};

                         if (filter == 7) {

                              filterQuery = {
                                   teacherDeleteStatus: false,
                                   isActive: true
                              }

                         } else {

                              let groupList = await GroupList(teacherId);

                              filterQuery = {
                                   teacherDeleteStatus: false,
                                   groupId: {
                                        $in: groupList
                                   },
                                   isActive: true
                              }

                         }

                         if (groupId) {
                              filterQuery.groupId = groupId;
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
                                   filterQuery.teacherStared = true;
                                   break;

                              case '8':
                                   filterQuery.sectionType = "ClassRoom";
                                   break;

                              default:
                                   break;
                         }

                         // console.log(filterQuery);

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
                                   seenStudents: 1,
                                   cancelStatus: 1,
                                   teacherStared: 1,
                                   teacherDeleteAllStatus: 1,
                                   activeStudentIds: 1,
                                   upcomingDate: 1,
                                   updatedStatus: 1,
                                   updatedAssignmentId: 1,
                                   updatedAssignmentDate: 1,
                                   remindedUsers: 1,
                                   sentStatus: 1,
                                   savedDateAndTime: 1,
                                   date: 1,

                              })
                              .sort({
                                   'date': -1
                              })
                              .populate({
                                   path: 'projectWork.groupData.students',
                                   select: 'firstName surName profilePic'
                              })
                              .populate('groupId', 'grade section groupPic')
                              .exec()
                              .then(records => {

                                   // ConnectionsModel.countDocuments({
                                   //           teacherId,
                                   //           groupId,
                                   //           connectionStatus: 2,
                                   //           isActive: true
                                   //      })
                                   //      .exec()
                                   //      .then(async connections => {

                                   //           let addOption = connections > 0 ? "true" : "false";

                                   if (records.length > 0) {

                                        ParseAssignments.parseAssignmentData(records, teacherId, 1)
                                             .then(assignmentsData => {

                                                  res.status(200).json({
                                                       statusCode: "1",
                                                       assignmentRecords: assignmentsData,
                                                       // addOption: addOption,
                                                       message: "Data Found...!!"
                                                  });

                                             })
                                             .catch(err => {
                                                  console.log(err);

                                                  res.status(200).json({
                                                       statusCode: "0",
                                                       message: "Something went wrong. Please try again..!!"
                                                  })

                                             })

                                   } else {

                                        res.status(200).json({
                                             statusCode: "1",
                                             assignmentRecords: [],
                                             message: "No Record Found...!!"
                                        });

                                   }
                                   // })
                                   // .catch(err => {
                                   //      console.log(err);

                                   //      res.status(200).json({
                                   //           statusCode: "0",
                                   //           message: "Something went wrong. Please try again..!!"
                                   //      })

                                   // });

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
                              message: "Access Denied..!!"
                         })
                    }

               } else {
                    res.status(200).json({
                         statusCode: "0",
                         message: "Access Denied.....!!"
                    })
               }
          })

     } else {
          res.status(200).json({
               statusCode: "0",
               message: "All fields are mandatory..!!"
          });
     }

}