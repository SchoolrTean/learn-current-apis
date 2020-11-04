const SubjectsModel = require('../../../../models/admin/master/academic/subjectsModel');

const VerifyTeacher = require('../../../../middleware/verifyTeacher');

const ClassModel = require('../../../../models/classes/classModel');

const editGroupSubjects = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId) {

            let teacherId = req.params.teacherId;
            let groupId = req.params.groupId;


            //check wheather teacher exists and isActive
            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        ClassModel.findOne({
                                    _id: groupId,
                                    isActive: true
                              }, {
                                    subjects: 1,
                                    secondLanguages: 1,
                                    thirdLanguages: 1
                              })
                              .exec()
                              .then(groupSelectedSubjects => {

                                    console.log(groupSelectedSubjects);

                                    SubjectsModel.find({
                                                $or: [{
                                                      addedBy: true
                                                }, {
                                                      addedBy: false,
                                                      addedByUserId: teacherId
                                                }],
                                                isActive: true
                                          })
                                          .sort({
                                                subjectName: 1
                                          })
                                          .exec()
                                          .then(subjectsList => {

                                                console.log(subjectsList);

                                                let selectedSubjects = [...groupSelectedSubjects.subjects, ...groupSelectedSubjects.secondLanguages, ...groupSelectedSubjects.thirdLanguages]

                                                let copySelectedSubjects = selectedSubjects.slice();

                                                let subjectsArray = new Array();

                                                let removedSubjectCount = 0;

                                                for (let index = 0; index < subjectsList.length; index++) {
                                                      const subject = subjectsList[index];

                                                      let found = 0;

                                                      if (selectedSubjects.length > 0) {

                                                            for (let index = 0; index < selectedSubjects.length; index++) {
                                                                  const GroupSelectedSubject = selectedSubjects[index];

                                                                  if (GroupSelectedSubject.toLowerCase() == subject.searchableSubjectName) {

                                                                        found = 1;
                                                                        removedSubjectCount++;

                                                                        let searchIndex = copySelectedSubjects.indexOf(subject.searchableSubjectName)

                                                                        console.log(searchIndex);

                                                                        if (searchIndex != -1) {
                                                                              copySelectedSubjects.splice(searchIndex, 1)
                                                                        }

                                                                        subjectsArray.push({
                                                                              // _id: GroupSelectedSubject.subjectId,
                                                                              subjectName: subject.subjectName,
                                                                              selected: "true",
                                                                        })

                                                                  }

                                                            }

                                                      }

                                                      if (found == 0) {

                                                            subjectsArray.push({
                                                                  // _id: subject._id,
                                                                  subjectName: subject.subjectName,
                                                                  selected: "false",
                                                            })

                                                      }

                                                }

                                                /** New Subjects Added */
                                                copySelectedSubjects.forEach(subject => {
                                                      subjectsArray.push({
                                                            // _id: subject._id,
                                                            subjectName: subject,
                                                            selected: "true",
                                                      })
                                                });

                                                console.log(copySelectedSubjects); //+ remove


                                                res.status(200).json({
                                                      statusCode: "1",
                                                      SubjectList: subjectsArray,
                                                      message: "Data Found..!!"
                                                });

                                          })
                                          .catch(err => {

                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: "Something Went Wrong. Plz try later..!!"
                                                });

                                          })

                              })
                              .catch(err => {

                                    console.log(err);
                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something Went Wrong. Plz try later..!!"
                                    });

                              });


                  } else {

                        return res.status(200).json({
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

module.exports = editGroupSubjects;