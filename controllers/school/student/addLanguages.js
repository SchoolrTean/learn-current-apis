const UserModel = require('../../../models/authentication/userModel');
const ClassModel = require('../../../models/classes/classModel');
const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');


const updateLanguageForConnectedStudents = (connectionId, subject, languageType) => {

      return new Promise((resolve, reject) => {

            try {

                  let updateValue = languageType == 2 ? {
                        secondLanguage: subject
                  } : {
                        thirdLanguage: subject
                  };

                  ClassStudentConnectionModel.updateOne({
                              _id: connectionId,
                        }, {
                              $set: updateValue
                        }).exec()
                        .then(updated => {
                              resolve(1);
                        })
                        .catch(err => {
                              console.log(err);
                              reject(0);
                        })

            } catch (error) {
                  reject(0);
            }



      })

}



const addStudentToSchoolGroup = (req, res, next) => {

      try {

            if (req.body.schoolId && req.body.groupId && req.body.secondLanguages && req.body.thirdLanguages && req.body.secondLanguageConnections && req.body.thirdLanguageConnections) {

                  let schoolId = req.body.schoolId;

                  let classId = req.body.groupId; //Data

                  let secondLanguages = req.body.secondLanguages.toLowerCase();
                  let thirdLanguages = req.body.thirdLanguages.toLowerCase();

                  let secondLanguageConnections = req.body.secondLanguageConnections;
                  let thirdLanguageConnections = req.body.thirdLanguageConnections;

                  let secondLanguageList = secondLanguages.split(',');
                  let thirdLanguageList = thirdLanguages.split(',');

                  let secondLanguageConnectionList = secondLanguageConnections.split('%-%');
                  let thirdLanguageConnectionList = thirdLanguageConnections.split('%-%');


                  if (secondLanguageList.length == secondLanguageConnectionList.length && thirdLanguageList.length == thirdLanguageConnectionList.length) {

                        UserModel.findOne({
                              _id: schoolId,
                              isActive: true
                        })
                              .exec()
                              .then(schoolData => {

                                    if (schoolData) {

                                          ClassModel.findOne({
                                                _id: classId,
                                                isActive: true
                                          })
                                                .exec()
                                                .then(async groupFound => {

                                                      if (groupFound) {

                                                            // teacherGroupModel.find({
                                                            //       schoolGroupId: groupId,
                                                            // })

                                                            let languageList = new Array();

                                                            if (secondLanguageConnectionList.length > 0) {
                                                                  for (let index = 0; index < secondLanguageConnectionList.length; index++) {
                                                                        const languageConnections = secondLanguageConnectionList[index].split(',');
                                                                        const subject = secondLanguageList[index];

                                                                        for (let index1 = 0; index1 < languageConnections.length; index1++) {

                                                                              languageList.push(updateLanguageForConnectedStudents(languageConnections[index1], subject, 2))

                                                                        }

                                                                  }
                                                            }

                                                            if (thirdLanguageConnectionList.length > 0) {
                                                                  for (let index = 0; index < thirdLanguageConnectionList.length; index++) {
                                                                        const languageConnections = thirdLanguageConnectionList[index].split(',');
                                                                        const subject = thirdLanguageList[index];

                                                                        for (let index1 = 0; index1 < languageConnections.length; index1++) {

                                                                              languageList.push(updateLanguageForConnectedStudents(languageConnections[index1], subject, 3))

                                                                        }

                                                                  }
                                                            }

                                                            Promise.all(languageList)
                                                                  .then(allStudentsSaved => {

                                                                        return res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Successfull...!!"
                                                                        });

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

                        res.status(200).json({
                              statusCode: "0",
                              message: "Please Enter Valid EmailIds..!!"
                        });

                  }

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



module.exports = addStudentToSchoolGroup;