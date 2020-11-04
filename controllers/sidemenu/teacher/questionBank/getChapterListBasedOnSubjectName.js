const verifyTeacher = require('../../../../middleware/verifyTeacher');

const ChapterModel = require('../../../../models/admin/learn/academic/chaptersModel')

const GetAndSaveNewSubjectId = require('../../../admin/master/academics/subject/getAndSaveNewSubject')


module.exports = (req, res, next) => {

       try {

              if (req.params.teacherId && req.body.classIds && req.body.subjectName) //&& req.body.date
              {

                     let teacherId = req.params.teacherId;
                     let classIds = req.body.classIds;
                     let subjectName = req.body.subjectName; //Old HomeWorkId for check its not out of date

                     verifyTeacher(teacherId, classIds, async (error, response) => {

                            if (response && response.statusCode != "0" && response.classData) {

                                   if (!Array.isArray(response.classData)) {
                                          response.classData = [response.classData]
                                   }

                                   let uniquieGradeIds = []

                                   response.classData.forEach(classDetails => {
                                          uniquieGradeIds.indexOf(String(classDetails.gradeId)) == -1 && uniquieGradeIds.push(String(classDetails.gradeId))
                                   });

                                   let subjectId = await GetAndSaveNewSubjectId(subjectName, teacherId)

                                   ChapterModel.find({
                                          gradeId: {
                                                 $in: uniquieGradeIds,
                                          },
                                          subjectId,
                                          isActive: true
                                   }, {
                                          chapterName: 1
                                   })
                                          .exec()
                                          .then(chapterNameList => {

                                                 if (chapterNameList.length > 0) {

                                                        res.status(200).json({
                                                               statusCode: "1",
                                                               chapterNameList,
                                                               message: "Data Found..!!"
                                                        });

                                                 } else {
                                                        res.status(200).json({
                                                               statusCode: "0",
                                                               message: "No Records Found..!!"
                                                        });
                                                 }

                                          })
                                          .catch(err => {
                                                 console.log(err)
                                                 res.status(200).json({
                                                        statusCode: "0",
                                                        message: "Something went wrong. Please Try Later..!!"
                                                 });
                                          })


                            } else {
                                   res.status(200).json({
                                          statusCode: "0",
                                          message: error.message
                                   })
                            }
                     })

              } else {
                     res.status(200).json({
                            statusCode: "0",
                            message: "All fields are mandatory..!!"
                     });
              }

       } catch (error) {
              console.log(error)
              res.status(200).json({
                     statusCode: "0",
                     message: "Something went wrong. Please Try Later..!!"
              });
       }


}

