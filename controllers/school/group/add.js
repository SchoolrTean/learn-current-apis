const mongoose = require('mongoose');
const randomize = require('randomatic');

const UserModel = require('../../../models/authentication/userModel');
const ClassTeacherConnectionModel = require('../../../models/classes/classTeacherConnectionModel');
const ClassModel = require('../../../models/classes/classModel');
const GradeModel = require('../../../models/admin/master/academic/gradesModel');
const CreateNewClassGroup = require('../../chat/teacher/classes/createNewClassGroup')


const addSchoolGroup = (req, res, next) => {

      try {
            if (req.body.schoolId && req.body.gradeId && req.body.subjects && req.body.teacherIds && (req.body.subjects.split(',').length == req.body.teacherIds.split(',').length && req.body.teacherIds.split(',').length != 0) &&
                  (!req.body.secondLanguageSubjects || (req.body.secondLanguageSubjects && req.body.secondLanguageTeacherIds && req.body.secondLanguageSubjects.split(',').length == req.body.secondLanguageTeacherIds.split(',').length && req.body.secondLanguageTeacherIds.split(',').length != 0)) &&
                  (!req.body.thirdLanguageSubjects || (req.body.thirdLanguageSubjects && req.body.thirdLanguageTeacherIds && req.body.thirdLanguageSubjects.split(',').length == req.body.thirdLanguageTeacherIds.split(',').length && req.body.thirdLanguageTeacherIds.split(',').length != 0)) && req.body.coordinator) {

                  let schoolId = req.body.schoolId;

                  let gradeId = req.body.gradeId; //Data
                  let section = req.body.section; //Data

                  let subjects = req.body.subjects.toLowerCase(); //Data
                  let teacherIds = req.body.teacherIds; //Data

                  let secondLanguageSubjects = req.body.secondLanguageSubjects.toLowerCase();
                  let secondLanguageTeacherIds = req.body.secondLanguageTeacherIds;

                  let thirdLanguageSubjects = req.body.thirdLanguageSubjects.toLowerCase();
                  let thirdLanguageTeacherIds = req.body.thirdLanguageTeacherIds;

                  let subjectList = subjects.split(',')
                  let teacherIdsList = teacherIds.split(',')

                  let secondLanguageSubjectsList = secondLanguageSubjects.split(',')
                  let secondLanguageTeacherIdsList = secondLanguageTeacherIds.split(',')

                  let thirdLanguageSubjectsList = thirdLanguageSubjects.split(',')
                  let thirdLanguageTeacherIdsList = thirdLanguageTeacherIds.split(',')

                  let coordinator = req.body.coordinator;

                  UserModel.findOne({
                        _id: schoolId,
                        isActive: true
                  })
                        .exec()
                        .then(schoolData => {

                              if (schoolData) {

                                    let checkGradeExistsQuery = {
                                          createdBy: schoolId,
                                          gradeId
                                    }

                                    if (section) {
                                          checkGradeExistsQuery.section = section;
                                    }

                                    ClassModel.findOne(checkGradeExistsQuery)
                                          .exec()
                                          .then(async groupFound => {

                                                if (!groupFound) {

                                                      let gradeDetails = await GradeModel.findOne({
                                                            _id: gradeId,
                                                            isActive: true
                                                      })

                                                      console.log("gradeDetails");
                                                      console.log(gradeDetails);

                                                      const NewClass = new ClassModel({
                                                            _id: mongoose.Types.ObjectId(),
                                                            createdBy: schoolId,
                                                            grade: gradeDetails.grade,
                                                            gradeId,
                                                            section,
                                                            subjects: subjectList,
                                                            secondLanguages: secondLanguageSubjectsList,
                                                            thirdLanguages: thirdLanguageSubjectsList,
                                                            coordinator,
                                                            groupLink: randomize('a0', 10),
                                                            creator: schoolId
                                                      })

                                                      NewClass.save()
                                                            .then(NewClassSaved => {

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

                                                                  console.log(assingnmentDataList)

                                                                  let assignmentGroupData = new Array();

                                                                  for (let index = 0; index < assingnmentDataList.length; index++) {

                                                                        let assignmentGroup = assingnmentDataList[index];

                                                                        console.log(assignmentGroup);

                                                                        const NewAssignmentGroup = new ClassTeacherConnectionModel({
                                                                              _id: new mongoose.Types.ObjectId(),
                                                                              schoolId,
                                                                              classId: NewClassSaved._id,
                                                                              teacherId: teacherList[index],
                                                                              subjects: assignmentGroup.subjects,
                                                                              secondLanguages: assignmentGroup.secondLanguage,
                                                                              thirdLanguages: assignmentGroup.thirdLanguage,
                                                                        })

                                                                        assignmentGroupData.push(NewAssignmentGroup.save())
                                                                        assignmentGroupData.push(CreateNewClassGroup(teacherList[index], NewAssignmentGroup._id, gradeDetails.grade + " " + section))

                                                                  }

                                                                  Promise.all(assignmentGroupData)
                                                                        .then(savedGroups => {

                                                                              return res.status(200).json({
                                                                                    statusCode: "1",
                                                                                    groupId: NewClassSaved._id,
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
                                                            message: "This Class Already exists..!!"
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



module.exports = addSchoolGroup;