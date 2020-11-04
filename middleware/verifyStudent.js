const StudentModel = require('../models/authentication/userModel');
const ClassStudentConnectionModel = require('../models/classes/classStudentConnectionModel');

module.exports = (studentId, groupId = undefined) => {

       return new Promise((resolve, reject) => {

              if (studentId) {

                     StudentModel.findOne({
                                   _id: studentId,
                                   type: 1
                            })
                            .exec()
                            .then(studentDetails => {

                                   console.log(studentDetails);

                                   if (studentDetails && (!groupId || groupId.trim() == "")) {

                                          if (studentDetails.isActive == true) {

                                                 console.log(studentDetails);

                                                 resolve({
                                                        "statusCode": "1",
                                                        "studentData": {
                                                               "firstName": studentDetails.firstName,
                                                               "surName": studentDetails.surName,
                                                               // "password": studentDetails.password,
                                                               "mobileNo": String(studentDetails.mobileNo),
                                                               "profilePic": studentDetails.profilePic ? studentDetails.profilePic : "",
                                                               "emailId": studentDetails.emailId ? studentDetails.emailId : "",
                                                               "notificationId": studentDetails.notificationId,
                                                               "mindBoxOpendTimestamp": studentDetails.mindBoxOpendTimestamp ? studentDetails.mindBoxOpendTimestamp : studentDetails.date,
                                                               "mindBoxCoins": studentDetails.mindBoxCoins,
                                                        }
                                                 })

                                          } else {

                                                 resolve({
                                                        statusCode: "0",
                                                        message: "Please Activate Your Account..!!"
                                                 })

                                          }

                                   } else if (studentDetails && groupId && groupId.trim() != "") {

                                          ClassStudentConnectionModel.findOne({
                                                        studentId,
                                                        classId : groupId,
                                                        connectionStatus: 1,
                                                        isActive: true
                                                 })
                                                 .exec()
                                                 .then(ConnectionExists => {

                                                        if (ConnectionExists) {

                                                               resolve({
                                                                      "statusCode": "1",
                                                                      "studentData": {
                                                                             "firstName": studentDetails.firstName,
                                                                             "surName": studentDetails.surName,
                                                                             // "password": studentDetails.password,
                                                                             "mobileNo": studentDetails.mobileNo,
                                                                             "profilePic": studentDetails.profilePic,
                                                                             "emailId": studentDetails.emailId ? studentDetails.emailId : "",
                                                                             "notificationId": studentDetails.notificationId,
                                                                             "mindBoxOpendTimestamp": studentDetails.mindBoxOpendTimestamp ? studentDetails.mindBoxOpendTimestamp : studentDetails.date,
                                                                             "mindBoxPoints": studentDetails.mindBoxPoints,
                                                                      }

                                                               })

                                                        } else {
                                                               resolve({
                                                                      statusCode: "0",
                                                                      message: "Access Denied..!!"
                                                               })
                                                        }

                                                 })
                                                 .catch(err => {
                                                        console.log(err);
                                                        reject(0)
                                                 })

                                   } else {
                                          resolve({
                                                 statusCode: "0",
                                                 message: "Access Denied..!!"
                                          })
                                   }

                            })
                            .catch(err => {
                                   console.log(err);
                                   reject(0)
                            });

              } else {

                     reject(0)

              }
       });
};