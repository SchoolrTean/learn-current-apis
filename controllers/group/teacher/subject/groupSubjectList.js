const mongoose = require('mongoose');
const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const ClassTeacherConnectionModel = require('../../../../models/classes/classTeacherConnectionModel');
const subjectModel = require('../../../../models/admin/master/academic/subjectsModel');

const getGroupSubjects = (req, res, next) => {

      if (req.body.teacherId && req.body.groupIds) {

            let teacherId = req.body.teacherId;
            let groupIds = req.body.groupIds;

            VerifyTeacher(teacherId, groupIds, (error, response) => {

                  if (response && response.statusCode != "0") {

                        let groupIdsArray = groupIds.split(',') //.map(groupId => mongoose.Types.ObjectId(groupId));


                        // TeacherGroupModel.aggregate(
                        //             [{

                        //                   "$match": {
                        //                         "_id": {
                        //                               $in: groupIdsArray
                        //                         },
                        //                         "isActive": true

                        //                   }

                        //             }, {
                        //                   "$group": {
                        //                         "_id": "$subjectId",
                        //                         "subjectCount": {
                        //                               $sum: 1
                        //                         }
                        //                   }
                        //             }, {
                        //                   "$match": {
                        //                         "subjectCount": groupIdsArray.length
                        //                   }
                        //             }]
                        //       )


                        ClassTeacherConnectionModel.find({
                              teacherId,
                              classId: {
                                    $in: groupIdsArray
                              },
                              isActive: true
                        }, {
                              classId: 1,
                              subjects: 1,
                              secondLanguages: 1,
                              thirdLanguages: 1
                        })
                              .populate('classId')
                              .exec()
                              .then(async gradeSubjects => {

                                    console.log("gradeSubjects");
                                    console.log(gradeSubjects)

                                    let gradeList = [];

                                    for (let index = 0; index < gradeSubjects.length; index++) {
                                          const gradeSubject = gradeSubjects[index];

                                          if (gradeList.indexOf(String(gradeSubject.classId.gradeId)) == -1) {
                                                gradeList.push(String(gradeSubject.classId.gradeId))
                                          }

                                    }

                                    if (gradeList.length > 1) {

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Please Choose Same Grades ..!!"
                                          })

                                    } else if (gradeList.length == 1) {

                                          if (gradeSubjects.length == gradeSubjects.length) {

                                                if (gradeSubjects.length == 1) {

                                                      if (gradeSubjects[0].subjects.length > 0 || gradeSubjects[0].secondLanguages.length > 0 || gradeSubjects[0].thirdLanguages.length > 0) {

                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  subjectList: [...gradeSubjects[0].subjects, ...gradeSubjects[0].secondLanguages, ...gradeSubjects[0].thirdLanguages],
                                                                  message: "Data Found...!!"
                                                            })

                                                      } else {

                                                            res.status(200).json({
                                                                  statusCode: "1",
                                                                  subjectList: [],
                                                                  message: "No Subjects Assigned..!!"
                                                            })
                                                      }

                                                } else {

                                                      let concatSubjects = [];
                                                      let commonSubjects = [];

                                                      for (let index = 0; index < gradeSubjects.length; index++) {
                                                            concatSubjects = [...concatSubjects, ...gradeSubjects[index].subjects, ...gradeSubjects[index].secondLanguages, ...gradeSubjects[0].thirdLanguages]
                                                      }

                                                      console.log(concatSubjects);

                                                      var duplicateCount = concatSubjects.reduce(function (prev, cur) {
                                                            prev[cur] = (prev[cur] || 0) + 1;
                                                            return prev;
                                                      }, {});

                                                      console.log(duplicateCount)

                                                      for (let [key, value] of Object.entries(duplicateCount)) {
                                                            // console.log(`${key}: ${value}`);
                                                            if (value == gradeSubjects.length) {
                                                                  commonSubjects.push(key)
                                                            }
                                                      }

                                                      res.status(200).json({
                                                            statusCode: "1",
                                                            subjectList: commonSubjects,
                                                            message: "Data Found...!!"
                                                      })

                                                }

                                          } else {

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Access Denied...!!"
                                                })

                                          }

                                    } else {
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          })
                                    }






                                    // subjectModel.find({
                                    //             _id: gradeSubjectsIds,
                                    //             isActive: true
                                    //       }).then(gradeSubjects => {

                                    //             let groupSubjectArray = new Array();

                                    //             if (gradeSubjects.length > 0) {

                                    //                   for (let index = 0; index < gradeSubjects.length; index++) {

                                    //                         const Subject = gradeSubjects[index];

                                    //                         let subjectObj = {};

                                    //                         subjectObj._id = Subject._id;
                                    //                         subjectObj.subjectName = Subject.subjectName;

                                    //                         groupSubjectArray.push(subjectObj);
                                    //                   }

                                    //                   res.status(200).json({
                                    //                         statusCode: "1",
                                    //                         SubjectList: groupSubjectArray,
                                    //                         message: "Data Found...!!"
                                    //                   })

                                    //             } else {

                                    //                   res.status(200).json({
                                    //                         statusCode: "0",
                                    //                         message: "No Subjects Assigned..!!"
                                    //                   })

                                    //             }
                                    //       })
                                    //       .catch(err => {
                                    //             console.log(err);
                                    //             res.status(200).json({
                                    //                   statusCode: "0",
                                    //                   message: "Something went wrong. Please try again..!!"
                                    //             })
                                    //       })

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
                              statusCode: "0",
                              message: error.message
                        })
                  }

            })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}

module.exports = getGroupSubjects;