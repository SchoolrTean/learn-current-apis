const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const AssignmentModel = require('../../../models/assignment/assignmentModel');
const UserModel = require('../../../models/authentication/userModel');

const ParseAssignments = require('./parseSchoolAssignmentsController');

/*******************************************************************************
 * Get School Activity of today or selected date
 */
module.exports = async (req, res, next) => {

       if (req.params.studentId && req.body.subjectName) {

              let studentId = req.params.studentId;
              let subjectName = req.body.subjectName;

              UserModel.findOne({
                     _id: studentId,
                     type: 1,
                     isActive: true
              })
                     .exec()
                     .then(studentDetails => {

                            if (studentDetails) {

                                   ClassStudentConnectionModel.find({
                                          studentId,
                                          $or: [{
                                                 subjects: {
                                                        $in: subjectName.toLowerCase()
                                                 }
                                          }, {
                                                 secondLanguage: subjectName.toLowerCase()
                                          }, {
                                                 thirdLanguage: subjectName.toLowerCase()
                                          }],
                                          isActive: true
                                   }, {
                                          'classId': 1
                                   })
                                          .exec()
                                          .then(studentClassesConnected => {

                                                 if (studentClassesConnected.length > 0) {

                                                        let classes = studentClassesConnected.map(connectedClasses => connectedClasses.classId)

                                                        let Query = {
                                                               groupId: {
                                                                      $in: classes
                                                               },
                                                               $or: [{
                                                                      sectionType: "HomeWork"
                                                               }, {
                                                                      sectionType: "ProjectWork"
                                                               }],
                                                               sentStatus: true,
                                                               subject: subjectName,
                                                               teacherDeleteStatus: false,
                                                               isActive: true
                                                        }

                                                        // groupId: {
                                                        //        $in: classes
                                                        //    },
                                                        //    $or: [{
                                                        //        sectionType: "Test"
                                                        //    }, {
                                                        //        sectionType: "Class"
                                                        //    }],
                                                        //    subject: subjectName,
                                                        //    teacherDeleteStatus: false,
                                                        //    isActive: true,
                                                        //    eventDate: {
                                                        //        $gt: formattedToday
                                                        //    },


                                                        if (req.params.lastAssignmentId) {
                                                               Query._id = {
                                                                      $lt: req.params.lastAssignmentId
                                                               }
                                                        }


                                                        /**Current Date or Selected Date Records */
                                                        AssignmentModel.find(Query, {
                                                               // title: 1,
                                                               // eventDate: 1,
                                                               // chapter: 1,
                                                               // topics: 1,
                                                               // sectionType :1,

                                                               // //common things
                                                               // completedStudents: 1,
                                                               // notCompletedStudents: 1,
                                                               // fileUrls: 1,
                                                               // additionalInformation: 1,
                                                               // seenStudents: 1,
                                                               // cancelStatus: 1,
                                                               // teacherDeleteAllStatus: 1,
                                                               // teacherStared: 1,
                                                               // activeStudentIds: 1,
                                                               // upcomingDate: 1,
                                                               // updatedStatus: 1,
                                                               // updatedAssignmentId: 1,
                                                               // updatedAssignmentDate: 1,
                                                               // remindedUsers: 1,
                                                               // sentStatus: 1,
                                                               // savedDateAndTime: 1,
                                                               // date: 1,
                                                        })
                                                               .sort({
                                                                      'date': -1,
                                                               })
                                                               .populate({
                                                                      path: 'groupData.students',
                                                                      select: 'firstName surName profilePic'
                                                               })
                                                               .populate('groupId', 'grade section groupPic')
                                                               .limit(20)
                                                               .exec()
                                                               .then(async resultArray => {

                                                                      console.log("complete List");
                                                                      console.log(resultArray);


                                                                      //    let prevDate = resultArray[0] ? await formatDate(new Date(resultArray[0].date.setMinutes(resultArray[0].date.getMinutes() - 330))) : ""

                                                                      //    let nextDate = resultArray[1] ? await formatDate(new Date(resultArray[1].date.setMinutes(resultArray[1].date.getMinutes() - 330))) : ""

                                                                      if (resultArray.length > 0) {

                                                                             ParseAssignments.parseAssignmentData(resultArray, studentId, 2)
                                                                                    .then(assignmentsData => {

                                                                                           res.status(200).json({
                                                                                                  statusCode: "1",
                                                                                                  assignmentRecords: assignmentsData,
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

                                          })

                            } else {
                                   res.status(200).json({
                                          statusCode: "0",
                                          message: "Something went wrong. Please try again..!!"
                                   })
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
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }
}