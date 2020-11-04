const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserModel = require('../../../models/authentication/userModel');
const findDuplicates = require('../shared/findDupilicates');


const CreateTeacherAccountAndConnect = (schoolName, schoolBranch, schoolAddress, schoolCity, SchoolEmailId, schoolContactNumber, firstName, surName, emailId, mobileNo, schoolId, invitationType) => {

      return new Promise((resolve, reject) => {

            try {

                  bcrypt.hash(mobileNo, 13, (err, hash) => {

                        if (err) {
                              console.log(err);

                              res.status(200).json({
                                    "statusCode": 0,
                                    "message": "Something went wrong..! Please try later...!!"
                              });

                        } else {

                              const TeacherData = new UserModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    firstName,
                                    surName,
                                    emailId,
                                    mobileNo,
                                    password: hash,
                                    type: 0, //Teacher
                                    schoolId,
                                    schoolTeacherInvitationStatus: invitationType,
                                    schoolName,
                                    schoolBranch,
                                    schoolAddress,
                                    schoolCity,
                                    SchoolEmailId,
                                    schoolContactNumber
                              });

                              TeacherData.save()
                                    .then(success => {
                                          resolve(1);
                                    })
                                    .catch(err => {
                                          console.log(err);
                                          reject(0);
                                    })

                        }
                  });

            } catch (error) {
                  console.log(error);
                  reject(0);
            }

      })

}


const addSchoolTeachers = (req, res, next) => {


      try {
            if (req.body.schoolId && req.body.firstNameData && req.body.surNameData && req.body.emailIdData && req.body.mobileNoData && req.body.invitationType &&
                  (req.body.firstNameData.split(',').length == req.body.surNameData.split(',').length) &&
                  (req.body.emailIdData.split(',').length == req.body.mobileNoData.split(',').length) &&
                  (req.body.firstNameData.split(',').length == req.body.mobileNoData.split(',').length)) {

                  let schoolId = req.body.schoolId;
                  let firstNameData = req.body.firstNameData;
                  let surNameData = req.body.surNameData;
                  let emailIdData = req.body.emailIdData;
                  let mobileNoData = req.body.mobileNoData;
                  let invitationType = req.body.invitationType; // 1-invitation sent 0-saved

                  let firstNameList = firstNameData.split(',')
                  let surNameList = surNameData.split(',')
                  let emailIdList = emailIdData.split(',')
                  let mobileNoList = mobileNoData.split(',')

                  let findEmailIdDuplicates = findDuplicates(emailIdList);
                  let findMobileNoDuplicates = findDuplicates(mobileNoList);

                  Promise.all([findEmailIdDuplicates, findMobileNoDuplicates])
                        .then(result => {

                              if (result[0].length == 0 && result[1].length == 0) {

                                    UserModel.findOne({
                                          _id: schoolId,
                                          type: 2, //school
                                          isActive: true
                                    })
                                          .exec()
                                          .then(schoolData => {

                                                if (schoolData) {

                                                      /**Because login is same for all users*/
                                                      UserModel.find({
                                                            $or: [{
                                                                  emailId: {
                                                                        $in: emailIdList
                                                                  }
                                                            }, {
                                                                  mobileNo: {
                                                                        $in: mobileNoList
                                                                  }
                                                            }],
                                                            $or: [{
                                                                  type: 0 //teacher
                                                            },
                                                            {
                                                                  type: 2 //school
                                                            },
                                                            {
                                                                  type: 3 //coordinator
                                                            }],
                                                            isActive: true
                                                      })
                                                            .exec()
                                                            .then(async registeredUsers => {

                                                                  if (registeredUsers.length > 0) {

                                                                        let registeredUserEmailList = new Array();
                                                                        let registeredUserMobieNoList = new Array();

                                                                        registeredUsers.forEach(user => {
                                                                              registeredUserEmailList.push(user.emailId)
                                                                        });

                                                                        registeredUsers.forEach(user => {
                                                                              registeredUserMobieNoList.push(String(user.mobileNo))
                                                                        });


                                                                        let alreadyRegisteredUserList = new Array();

                                                                        for (let index = 0; index < emailIdList.length; index++) {

                                                                              let checkEmailExists = registeredUserEmailList.indexOf(emailIdList[index]);
                                                                              let checkMobileExists = registeredUserMobieNoList.indexOf(mobileNoList[index]);

                                                                              if (checkEmailExists != -1 || checkMobileExists != -1) {

                                                                                    alreadyRegisteredUserList.push({
                                                                                          firstName: firstNameList[index],
                                                                                          surName: surNameList[index],
                                                                                          mobileNo: mobileNoList[index],
                                                                                          emailId: emailIdList[index],
                                                                                          emailIdError: checkEmailExists != -1 ? 1 : 0,
                                                                                          mobileNoError: checkMobileExists != -1 ? 1 : 0
                                                                                    })

                                                                              } else {
                                                                                    alreadyRegisteredUserList.push({
                                                                                          firstName: firstNameList[index],
                                                                                          surName: surNameList[index],
                                                                                          mobileNo: mobileNoList[index],
                                                                                          emailId: emailIdList[index],
                                                                                          emailIdError: 0,
                                                                                          mobileNoError: 0
                                                                                    })

                                                                              }

                                                                        }

                                                                        res.status(200).json({
                                                                              statusCode: "0",
                                                                              teacherData: alreadyRegisteredUserList,
                                                                              message: 'Already registered with this emailId...!!'
                                                                        });


                                                                  } else {

                                                                        let connections = new Array();

                                                                        for (let index = 0; index < emailIdList.length; index++) {

                                                                              connections.push(CreateTeacherAccountAndConnect(schoolData.schoolName, schoolData.schoolBranch, schoolData.schoolAddress, schoolData.schoolCity, schoolData.emailId, schoolData.schoolContactNumber, firstNameList[index], surNameList[index], emailIdList[index], mobileNoList[index], schoolId, invitationType))

                                                                        }

                                                                        Promise.all(connections)
                                                                              .then(connected => {

                                                                                    res.status(200).json({
                                                                                          statusCode: "1",
                                                                                          message: 'Teachers Added Successfully...!!'
                                                                                    });
                                                                              })
                                                                              .catch(err => {
                                                                                    console.log(err);

                                                                                    res.status(200).json({
                                                                                          statusCode: "0",
                                                                                          message: 'Something Went Wrong. Please Try Later...!!'
                                                                                    });
                                                                              })
                                                                  }

                                                            })
                                                            .catch(err => {
                                                                  console.log(err);

                                                                  res.status(200).json({
                                                                        statusCode: "0",
                                                                        message: 'Something Went Wrong. Please Try Later...!!'
                                                                  });
                                                            })

                                                } else {

                                                      res.status(200).json({
                                                            statusCode: "0",
                                                            message: 'Something Went Wrong. Please Try Later...!!'
                                                      });

                                                }

                                          }).catch(err => {
                                                console.log(err);

                                                res.status(200).json({
                                                      statusCode: "0",
                                                      message: 'Something Went Wrong. Please Try Later...!!'
                                                });
                                          })

                              } else {

                                    let dupilcateDataList = new Array();

                                    for (let index = 0; index < firstNameList.length; index++) {

                                          let pushed = 0;

                                          console.log(result);
                                          console.log(result);

                                          if (result[0].length > 0 && result[0].indexOf(emailIdList[index]) != -1) {

                                                dupilcateDataList.push({
                                                      firstName: firstNameList[index],
                                                      surName: surNameList[index],
                                                      emailId: emailIdList[index],
                                                      mobileNo: mobileNoList[index],
                                                      emailIdError: 1,
                                                      mobileNoError: 0
                                                })

                                                pushed = 1;
                                          }

                                          if (!pushed) {

                                                if (result[1].length > 0 && result[1].indexOf(mobileNoList[index]) != -1) {

                                                      dupilcateDataList.push({
                                                            firstName: firstNameList[index],
                                                            surName: surNameList[index],
                                                            emailId: emailIdList[index],
                                                            mobileNo: mobileNoList[index],
                                                            emailIdError: 0,
                                                            mobileNoError: 1
                                                      })

                                                }


                                          }

                                    }

                                    res.status(200).json({
                                          statusCode: "0",
                                          teacherData: dupilcateDataList,
                                          message: 'Duplicates Mobile No or Email Not Allowed...!!'
                                    });
                              }

                        })
                        .catch(err => {
                              console.log(err);

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something Went Wrong. Please try later..!!"
                              });
                        })

            } else {
                  return res.status(200).json({
                        statusCode: "0",
                        message: "All fields are mandatory..!!"
                  });
            }

      } catch (error) {
            res.status(200).json({
                  statusCode: "0",
                  message: 'Something Went Wrong. Please Try Later...!!'
            });
      }

}

module.exports = addSchoolTeachers;