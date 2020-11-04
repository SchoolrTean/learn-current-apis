const mongoose = require('mongoose');
const randomize = require('randomatic');

const UserModel = require('../../../models/authentication/userModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');
const ClassModel = require('../../../models/classes/classModel');
const ClassStudentConnection = require('../../../models/classes/classStudentConnectionModel');


const editSchoolGroup = (req, res, next) => {

      try {
            if (req.params.schoolId && req.params.groupId && req.body.subjects && req.body.teacherIds && (req.body.subjects.split(',').length == req.body.teacherIds.split(',').length && req.body.teacherIds.split(',').length != 0) &&
                  (!req.body.secondLanguageSubjects || (req.body.secondLanguageSubjects && req.body.secondLanguageTeacherIds && req.body.secondLanguageSubjects.split(',').length == req.body.secondLanguageTeacherIds.split(',').length && req.body.secondLanguageTeacherIds.split(',').length != 0)) &&
                  (!req.body.thirdLanguageSubjects || (req.body.thirdLanguageSubjects && req.body.thirdLanguageTeacherIds && req.body.thirdLanguageSubjects.split(',').length == req.body.thirdLanguageTeacherIds.split(',').length && req.body.thirdLanguageTeacherIds.split(',').length != 0))) {

                  let schoolId = req.params.schoolId;

                  let classId = req.params.groupId; //Data

                  let subjects = req.body.subjects.toLowerCase(); //Data
                  let teacherIds = req.body.teacherIds; //Data

                  let secondLanguageSubjects = req.body.secondLanguageSubjects.toLowerCase();
                  let secondLanguageTeacherIds = req.body.secondLanguageTeacherIds;

                  let thirdLanguageSubjects = req.body.thirdLanguageSubjects.toLowerCase();
                  let thirdLanguageTeacherIds = req.body.thirdLanguageTeacherIds;

                  let subjectList = subjects ? subjects.trim().split(',') : [];
                  let teacherIdsList = teacherIds.split(',')

                  let secondLanguageSubjectsList = secondLanguageSubjects.split(',')
                  let secondLanguageTeacherIdsList = secondLanguageTeacherIds.split(',')

                  let thirdLanguageSubjectsList = thirdLanguageSubjects.split(',')
                  let thirdLanguageTeacherIdsList = thirdLanguageTeacherIds.split(',')


                  UserModel.findOne({
                        _id: schoolId,
                        isActive: true
                  })
                        .exec()
                        .then(schoolData => {

                              if (schoolData) {

                                    ClassModel.findOne({
                                          _id: classId,
                                          createdBy: schoolId,
                                          isActive: true
                                    })
                                          .exec()
                                          .then(ClassFound => {

                                                if (ClassFound) {

                                                      ClassTeacherConnectionModel.find({
                                                            schoolId,
                                                            classId,
                                                            isActive: true
                                                      })
                                                            .exec()
                                                            .then(TeachersConnectedToClass => {

                                                                  console.log(TeachersConnectedToClass);

                                                                  let teacherList = new Array();

                                                                  let assingnmentDataList = new Array();

                                                                  for (let index = 0; index < teacherIdsList.length; index++) {

                                                                        let checkTeacher = teacherList.indexOf(String(teacherIdsList[index]));

                                                                        console.log("checkTeacher" + checkTeacher);
                                                                        console.log(teacherIds);

                                                                        if (checkTeacher == -1) {
                                                                              teacherList.push(String(teacherIdsList[index]));

                                                                              let newTeacherObj = {
                                                                                    subjects: [subjectList[index]],
                                                                                    secondLanguage: [],
                                                                                    thirdLanguage: [],

                                                                              }

                                                                              assingnmentDataList.push(newTeacherObj)

                                                                        } else {

                                                                              assingnmentDataList[checkTeacher].subjects.push(subjectList[index])

                                                                        }

                                                                  }

                                                                  for (let index = 0; index < secondLanguageTeacherIdsList.length; index++) {

                                                                        let checkTeacher = teacherList.indexOf(secondLanguageTeacherIdsList[index]);

                                                                        if (checkTeacher == -1) {
                                                                              teacherList.push(secondLanguageTeacherIdsList[index]);

                                                                              let newTeacherObj = {
                                                                                    subjects: [], //secondLanguageSubjectsList[index]
                                                                                    secondLanguage: [secondLanguageSubjectsList[index]],
                                                                                    thirdLanguage: []
                                                                              }

                                                                              assingnmentDataList.push(newTeacherObj)

                                                                        } else {

                                                                              // assingnmentDataList[checkTeacher].subjects.push(secondLanguageSubjectsList[index])
                                                                              assingnmentDataList[checkTeacher].secondLanguage.push(secondLanguageSubjectsList[index])

                                                                        }

                                                                  }

                                                                  for (let index = 0; index < thirdLanguageTeacherIdsList.length; index++) {

                                                                        let checkTeacher = teacherList.indexOf(thirdLanguageTeacherIdsList[index]);

                                                                        if (checkTeacher == -1) {
                                                                              teacherList.push(thirdLanguageTeacherIdsList[index]);

                                                                              let newTeacherObj = {
                                                                                    subjects: [], //thirdLanguageSubjectsList[index]
                                                                                    secondLanguage: [],
                                                                                    thirdLanguage: [thirdLanguageSubjectsList[index]]
                                                                              }

                                                                              assingnmentDataList.push(newTeacherObj)

                                                                        } else {

                                                                              // assingnmentDataList[checkTeacher].subjects.push(thirdLanguageSubjectsList[index])
                                                                              assingnmentDataList[checkTeacher].thirdLanguage.push(thirdLanguageSubjectsList[index]);

                                                                        }

                                                                  }

                                                                  console.log(assingnmentDataList);
                                                                  console.log(teacherList);

                                                                  let newSubjectList = subjectList.concat(secondLanguageSubjectsList).concat(thirdLanguageSubjectsList)


                                                                  let previousSubjectList = [];
                                                                  let previousTeacherList = [];

                                                                  for (let index = 0; index < TeachersConnectedToClass.length; index++) {
                                                                        const schoolClass = TeachersConnectedToClass[index];
                                                                        previousSubjectList = [...previousSubjectList,...schoolClass.subjects,...schoolClass.secondLanguages,...schoolClass.thirdLanguages]
                                                                        previousTeacherList.push(String(schoolClass.teacherId))
                                                                  }

                                                                  let differenceToRemovePreviousSubjects = previousSubjectList.filter(x => newSubjectList.indexOf(x) === -1);
                                                                  let differenceToAddNewSubjects = newSubjectList.filter(x => previousSubjectList.indexOf(x) === -1);

                                                                  let differenceToRemovePreviousTeacherIds = previousTeacherList.filter(x => !teacherList.includes(x));
                                                                  let differenceToAddNewTeacherIds = teacherList.filter(x => !previousTeacherList.includes(x));


                                                                  console.log(newSubjectList)
                                                                  console.log(previousSubjectList)
                                                                  console.log(differenceToRemovePreviousSubjects)
                                                                  console.log(differenceToAddNewSubjects)
                                                                  console.log(differenceToRemovePreviousTeacherIds)
                                                                  console.log(differenceToAddNewTeacherIds)


                                                                  res.status(200).json({
                                                                        statusCode: "1",
                                                                        message: "Data Found..!!"
                                                                  });

                                                            })
                                                            .catch(err => {

                                                                  console.log(err);

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: "All fields are mandatory..!!"
                                                                  });

                                                            })
                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: "Access Denied..!!"
                                                      });

                                                }

                                          })
                                          .catch(err => {
                                                console.log(err);

                                                return res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something went wrong. Please Try later..!!"
                                                });
                                          })

                              } else {

                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Access Denied..!!"
                                    });

                              }

                        })
                        .catch(err => {
                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something went wrong. Please Try later..!!"
                              });
                        })

            } else {
                  return res.status(200).json({
                        statusCode: "0",
                        message: "All fields are mandatory..!!"
                  });
            }

      } catch (error) {

            console.log(error);

            res.status(200).json({
                  statusCode: "0",
                  message: "Something went Wrong. Please try later..!!"
            })

      }
}

module.exports = editSchoolGroup;

/**
 *
 *
 *  SchoolTeacherConnectionModel.find({
                                                                        schoolId,
                                                                        teacherId: {
                                                                              $in: [...thirdLanguageTeacherIdsList, ...secondLanguageTeacherIdsList, ...teacherIdsList]
                                                                        },
                                                                        isActive: true
                                                                  })
                                                                        .exec()
                                                                        .then(TeachersConnected => {

                                                                              if (TeachersConnected.length <= (thirdLanguageTeacherIdsList.length + secondLanguageTeacherIdsList.length + teacherIdsList.length)) {

                                                                                    let ExistingAssignmentGroupTeacherList = new Array();
                                                                                    let ExistingAssignmnentGroupSubjectsLists = new Array();
                                                                                    let ExistingAssignmnentGroupsList = new Array();

                                                                                    for (let index = 0; index < AssignmentGroups.length; index++) {
                                                                                          ExistingAssignmentGroupTeacherList.push(String(AssignmentGroups[index].teacherId));
                                                                                          ExistingAssignmnentGroupSubjectsLists.push({
                                                                                                "subjectsList": AssignmentGroups[index].subjectsList,
                                                                                                "secondLanguage": AssignmentGroups[index].secondLanguage,
                                                                                                "thirdLanguage": AssignmentGroups[index].thirdLanguage
                                                                                          })
                                                                                          ExistingAssignmnentGroupsList.push(AssignmentGroups[index]._id)
                                                                                    }

                                                                                    let teacherList = new Array();

                                                                                    let assingnmentDataList = new Array();

                                                                                    for (let index = 0; index < teacherIdsList.length; index++) {

                                                                                          let checkTeacher = teacherList.indexOf(String(teacherIdsList[index]));

                                                                                          console.log("checkTeacher" + checkTeacher);
                                                                                          console.log(teacherIds);

                                                                                          if (checkTeacher == -1) {
                                                                                                teacherList.push(String(teacherIdsList[index]));

                                                                                                let newTeacherObj = {
                                                                                                      subjects: [subjectList[index]],
                                                                                                      secondLanguage: [],
                                                                                                      thirdLanguage: [],

                                                                                                }

                                                                                                assingnmentDataList.push(newTeacherObj)

                                                                                          } else {

                                                                                                assingnmentDataList[checkTeacher].subjects.push(subjectList[index])

                                                                                          }

                                                                                    }

                                                                                    for (let index = 0; index < secondLanguageTeacherIdsList.length; index++) {

                                                                                          let checkTeacher = teacherList.indexOf(secondLanguageTeacherIdsList[index]);

                                                                                          if (checkTeacher == -1) {
                                                                                                teacherList.push(secondLanguageTeacherIdsList[index]);

                                                                                                let newTeacherObj = {
                                                                                                      subjects: [], //secondLanguageSubjectsList[index]
                                                                                                      secondLanguage: [secondLanguageSubjectsList[index]],
                                                                                                      thirdLanguage: []
                                                                                                }

                                                                                                assingnmentDataList.push(newTeacherObj)

                                                                                          } else {

                                                                                                // assingnmentDataList[checkTeacher].subjects.push(secondLanguageSubjectsList[index])
                                                                                                assingnmentDataList[checkTeacher].secondLanguage.push(secondLanguageSubjectsList[index])

                                                                                          }

                                                                                    }

                                                                                    for (let index = 0; index < thirdLanguageTeacherIdsList.length; index++) {

                                                                                          let checkTeacher = teacherList.indexOf(thirdLanguageTeacherIdsList[index]);

                                                                                          if (checkTeacher == -1) {
                                                                                                teacherList.push(thirdLanguageTeacherIdsList[index]);

                                                                                                let newTeacherObj = {
                                                                                                      subjects: [], //thirdLanguageSubjectsList[index]
                                                                                                      secondLanguage: [],
                                                                                                      thirdLanguage: [thirdLanguageSubjectsList[index]]
                                                                                                }

                                                                                                assingnmentDataList.push(newTeacherObj)

                                                                                          } else {

                                                                                                // assingnmentDataList[checkTeacher].subjects.push(thirdLanguageSubjectsList[index])
                                                                                                assingnmentDataList[checkTeacher].thirdLanguage.push(thirdLanguageSubjectsList[index]);

                                                                                          }

                                                                                    }

                                                                                    let assignmentGroupData = new Array();

                                                                                    for (let index = 0; index < assingnmentDataList.length; index++) {

                                                                                          let assignmentGroup = assingnmentDataList[index];

                                                                                          /**If teacher has already connected with this group /*
                                                                                          if (ExistingAssignmentGroupTeacherList.indexOf(String(teacherList[index])) == -1) {

                                                                                                const NewAssignmentGroup = new ClassTeacherConnectionModel({
                                                                                                      _id: new mongoose.Types.ObjectId(),
                                                                                                      schoolGroupId: groupId,
                                                                                                      teacherId: teacherList[index],
                                                                                                      grade: groupFound.grade,
                                                                                                      gradeId: groupFound.gradeId,
                                                                                                      section: groupFound.section,
                                                                                                      subjectsList: assignmentGroup.subjects,
                                                                                                      secondLanguage: assignmentGroup.secondLanguage,
                                                                                                      thirdLanguage: assignmentGroup.thirdLanguage,
                                                                                                      groupLink: randomize('a0', 10),
                                                                                                      createdBy: schoolId,
                                                                                                })

                                                                                                assignmentGroupData.push(NewAssignmentGroup.save())

                                                                                          } else {

                                                                                                assignmentGroupData.push(ClassTeacherConnectionModel.updateOne({
                                                                                                      _id: ExistingAssignmnentGroupsList[index],
                                                                                                      isActive: true
                                                                                                }, {
                                                                                                      $set: {
                                                                                                            subjectsList: assignmentGroup.subjects,
                                                                                                            secondLanguage: assignmentGroup.secondLanguage,
                                                                                                            thirdLanguage: assignmentGroup.thirdLanguage,
                                                                                                      }
                                                                                                })
                                                                                                      .exec())

                                                                                          }

                                                                                    }

                                                                                    Promise.all(assignmentGroupData)
                                                                                          .then(savedGroups => {

                                                                                                return res.status(200).json({
                                                                                                      statusCode: "1",
                                                                                                      message: "Successfull..!!"
                                                                                                });

                                                                                          })
                                                                                          .catch(err => {
                                                                                                console.log(err);

                                                                                                return res.status(200).json({
                                                                                                      statusCode: "0",
                                                                                                      message: "All fields are mandatory..!!"
                                                                                                });
                                                                                          })


                                                                              } else {

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: "All fields are mandatory..!!"
                                                                                    });

                                                                              }

                                                                        })


 */