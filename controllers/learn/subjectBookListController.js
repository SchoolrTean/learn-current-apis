const UserModel = require('../../models/user/authentication/userModel');
const BookModel = require('../../models/admin/learn/academic/bookModel');

const CourseModel = require('../../models/admin/learn/non-academic/course/courseModel');

const ScoreCalculation = require('../learn/non-academic/aptitude/scoreCalculation')
const BookCompletedStatus = require('./academic/completedStatusCalculation/book');


const SubjectBookList = (req, res) => {

      if (req.params.userId && req.params.syllabusId && req.params.mediumId && req.params.gradeId) {

            let userId = req.params.userId;
            let syllabusId = req.params.syllabusId;
            let mediumId = req.params.mediumId;
            let gradeId = req.params.gradeId;

            UserModel.findOne({
                        _id: userId,
                        isActive: true
                  }).exec()
                  .then(userRegistered => {

                        if (userRegistered && userRegistered.isConfirmed == true && userRegistered.status == true) {

                              let booksList = BookModel.find({
                                          syllabusId,
                                          mediumId,
                                          gradeId,
                                          isActive: true,
                                    })
                                    .populate('subjectId')
                                    .exec()

                              let aptitudeList = CourseModel.find({
                                          courseType: 2,
                                          isActive: true
                                    })
                                    .exec()

                              let steamList = CourseModel.find({
                                          courseType: 3,
                                          isActive: true
                                    })
                                    .exec()


                              let lifeSkillsList = CourseModel.find({
                                          courseType: 4,
                                          isActive: true
                                    })
                                    .exec()

                              Promise.all([booksList, aptitudeList, steamList, lifeSkillsList])
                                    .then(async promiseData => {

                                          console.log(promiseData);

                                          let subjectBookList = [];
                                          let aptitudeCourseList = [];
                                          let steamCourseList = [];
                                          let lifeSkillCourseList = [];


                                          if (promiseData.length > 0) {


                                                if (promiseData[0].length > 0) {

                                                      for (let index = 0; index < promiseData[0].length; index++) {
                                                            const book = promiseData[0][index];

                                                            subjectBookList.push({
                                                                  bookId: book._id,
                                                                  bookName: book.bookName,
                                                                  subjectId: book.subjectId._id,
                                                                  subjectName: book.subjectId.subjectName,
                                                                  bookImageUrl: book.bookImageUrl ? book.bookImageUrl : "",
                                                                  completedStatus: await BookCompletedStatus(userId, book._id)
                                                            })

                                                      }

                                                }


                                                if (promiseData[1].length > 0) {

                                                      for (let index = 0; index < promiseData[1].length; index++) {
                                                            const course = promiseData[1][index];

                                                            aptitudeCourseList.push({
                                                                  courseId: course._id,
                                                                  courseName: course.courseName,
                                                                  courseImageUrl: course.courseImageUrl ? course.courseImageUrl : "",
                                                                  courseText: course.courseText ? course.courseText : "",
                                                                  courseColor: course.courseColor ? course.courseColor : "",
                                                                  courseScore: await ScoreCalculation.courseScore(course._id, userId)
                                                            })

                                                      }

                                                }


                                                if (promiseData[2].length > 0) {

                                                      steamCourseList = promiseData[2].map(course => {
                                                            return {
                                                                  courseId: course._id,
                                                                  courseName: course.courseName,
                                                                  courseImageUrl: course.courseImageUrl ? course.courseImageUrl : "",
                                                                  courseText: course.courseText ? course.courseText : "",
                                                                  courseColor: course.courseColor ? course.courseColor : "",
                                                                  courseCompleted: 0
                                                            }
                                                      });

                                                }

                                                if (promiseData[3].length > 0) {

                                                      lifeSkillCourseList = promiseData[3].map(course => {
                                                            return {
                                                                  courseId: course._id,
                                                                  courseName: course.courseName,
                                                                  courseImageUrl: course.courseImageUrl ? course.courseImageUrl : "",
                                                                  courseText: course.courseText ? course.courseText : "",
                                                                  courseColor: course.courseColor ? course.courseColor : "",
                                                                  courseCompleted: 0
                                                            }
                                                      });

                                                }



                                          }

                                          console.log({
                                                statusCode: "1",
                                                academicBookData: subjectBookList,
                                                aptitudeCourses: aptitudeCourseList,
                                                steamCourses: steamCourseList,
                                                lifeSkills: lifeSkillCourseList,
                                                message: "Data Found..!!"
                                          })

                                          return res.status(200).json({
                                                statusCode: "1",
                                                academicBookData: subjectBookList,
                                                aptitudeCourses: aptitudeCourseList,
                                                steamCourses: steamCourseList,
                                                lifeSkills: lifeSkillCourseList,
                                                message: "Data Found..!!"
                                          });

                                    })
                                    .catch(err => {
                                          console.log(err);

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something went wrong. Please try again..!!"
                                          });

                                    });


                        } else {

                              return res.status(200).json({
                                    statusCode: "0",
                                    message: !userRegistered ? "Access Denied..!!" : userRegistered && userRegistered.isConfirmed == false ? "Please Confirm your account..!!" : "Please Activate Your Account...!!"
                              });

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        return res.status(200).json({
                              statusCode: "0",
                              message: err.name == "ValidationError" ? "Please fill all fields correctly..!!" : "Something went wrong. Please try again..!!"
                        });

                  });

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }
}

module.exports = SubjectBookList