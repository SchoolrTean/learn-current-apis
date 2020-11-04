const AssignmentModel = require('../../../models/common/assignmentsModel');


exports.addStudent = (groupId, studentId) => {

      //Add this student to last date assignments so that he can give response and part of the reports.
      AssignmentModel.findOne({
                  groupId,
                  isActive: true,
                  teacherDeleteStatus: false,
                  teacherDeleteAllStatus: false,
            })
            .sort({
                  'date': -1
            })
            .exec()
            .then(lastAssignment => {

                  let todayMonth = (lastAssignment.date.getUTCMonth() + 1) < 10 ? "0" + String(lastAssignment.date.getUTCMonth() + 1) : lastAssignment.date.getUTCMonth() + 1;

                  let todayDate = lastAssignment.date.getDate() < 10 ? "0" + String(lastAssignment.date.getDate()) : lastAssignment.date.getDate();

                  let latestOnlyDate = new Date(lastAssignment.date.getFullYear() + '-' + todayMonth + '-' + todayDate + 'T00:00:00.000Z');

                  AssignmentModel.updateMany({
                              // teacherId,
                              groupId,
                              isActive: true,
                              teacherDeleteStatus: false,
                              teacherDeleteAllStatus: false,
                              date: {
                                    $gte: new Date(latestOnlyDate),
                              }

                        }, {
                              $push: {

                                    presetStudentIds: studentId

                              }
                        })
                        .exec()
                        .then(records => {

                              res.status(200).json({
                                    "statusCode": "1",
                                    "message": "joined Group successfully...!!"
                              });

                        })
                        .catch(err => {
                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something went wrong. Please try again..!!"
                              })
                        })

            })
            .catch(err => {
                  console.log(err);

                  res.status(200).json({
                        statusCode: "0",
                        message: "Something went wrong. Please try again..!!"
                  })
            })
}