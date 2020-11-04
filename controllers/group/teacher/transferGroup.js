const mongoose = require('mongoose');
const randomize = require('randomatic');

const VerifyTeacher = require('../../../middleware/verifyTeacher');

const TransferGroupModel = require('../../../models/group/teacher/tranferGroupModel')
const TeacherModel = require('../../../models/authentication/teacherModel')
const TeacherGradesModel = require('../../../models/group/teacherGroupModel');

const Sms = require('../../../third-party/sms/sendSms')
const GroupTransferNotification = require('../../../third-party/notification/teacher/groupTransfer');

/**
 * Transfer Group to another teacher by passing mobileNo or teacherId
 * If the teacher already exists then id is passed along with mobileno
 * -- Teacher does not exist an sms will be sent with download link 
 * -- Teahcer exists notification will be sent.
 * 
 * Once group was transferred the teacher will have no access to it
 * teacher should revert or cancel transfer group to have access to it
 */
const transferGroup = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId && req.body.transferTeacherMobileNo) {

            let teacherId = req.params.teacherId
            let groupId = req.params.groupId
            let transferTeacherMobileNo = req.body.transferTeacherMobileNo
            let transferTeacherId = req.body.transferTeacherId

            mongoose.set('debug', true);

            //Verify Teacher and Grade
            VerifyTeacher(teacherId, groupId, async(error, response) => {

                  console.log(response);

                  if (response && response.statusCode != "0" && response.teacherData.mobileNo != transferTeacherMobileNo) {

                        /**
                         * This operation is done to update created teacher to the new transfer teacher
                         * 
                         * Why should the teacher who is tranferring whould know about who created this group..??
                         * 
                         * English test was pushed by teacher 1 who created the group
                         * teacher 1 was on some work so transferred it to teacher 2
                         * const TransferGroupModel = require('../../../models/group/teacher/tranferGroupModel')
                         * teacher 2 meet with accident and transferred to teacher 3 
                         * Now teacher 3 who is current teacher want to know on which topic
                         * teacher 1 want to conduct exam. If teacher 1 has pushed project then 
                         * teacher 3 may had to correct it like soo on ..!!  
                         * 
                         * We are giving hierarchy of 3 so that its easy to track.
                         */

                        let error = 0;

                        if (transferTeacherId) {

                              /**
                               * If teacher already exists then transferTeahcerId will be sent along with mobileNo
                               * Check whether this user is valid user and teacher
                               * Check wheather mobileNo and id of user matches and there is no mismatch
                               */
                              await TeacherModel.findOne({
                                          _id: transferTeacherId,
                                          mobileNo: transferTeacherMobileNo,
                                          userType: true,
                                          isActive: true
                                    }).exec()
                                    .then(tranferTeacherExists => {

                                          if (tranferTeacherExists) {

                                                /**
                                                 * Check whether transfer groupName already exists with teahcer 
                                                 * whome you want to transfer group.if teacher accepts it make
                                                 * dublicate after accepting and made confusion for the teacher.
                                                 */
                                                TeacherGradesModel.findOne({
                                                            teacherId: transferTeacherId,
                                                            groupNameSearch: response.classData.groupNameSearch,
                                                            isActive: true
                                                      })
                                                      .exec()
                                                      .then(teacherGroupExists => {

                                                            if (teacherGroupExists) {
                                                                  error = 2;
                                                            } else {

                                                            }

                                                      })
                                                      .catch(err => {
                                                            console.log(err);

                                                            res.status(200).json({
                                                                  'statusCode': '0',
                                                                  'message': 'Something went wrong.Please try later....!'
                                                            })
                                                      })

                                          } else {
                                                error = 1;
                                          }

                                    })
                                    .catch(err => {

                                          console.log(err);

                                          res.status(200).json({
                                                'statusCode': '0',
                                                'message': 'Something went wrong.Please try later....!'
                                          })

                                    })
                        }


                        if (error == 0) {

                              const teacherGroupTransferData = new TransferGroupModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    groupId: groupId,
                                    fromTeacherId: teacherId,
                                    toMobileNo: transferTeacherMobileNo,
                                    urlCode: randomize('a0A', 10),
                                    status: 1, // 1-transfer Initiated 
                              })

                              if (transferTeacherId) {
                                    teacherGroupTransferData.toTeacherId = transferTeacherId
                              }

                              teacherGroupTransferData.save()
                                    .then(saveTranfer => {

                                          TeacherGradesModel.updateOne({
                                                      _id: groupId,
                                                      teacherId,
                                                      isActive: true
                                                }, {
                                                      $set: {
                                                            transferGroup: true
                                                      }
                                                })
                                                .exec()
                                                .then(transferUpdated => {

                                                      if (!transferTeacherId) {

                                                            let message = response.teacherData.name + " has tansferred group in schoolr. Please Download App by clicking on this Link below. Register and accept transfer group " + process.env.API_URL + process.env.APP_LINK;

                                                            Sms.send(transferTeacherMobileNo, message, "")
                                                                  .then(success => {

                                                                        if (success.statusCode == 1) {

                                                                              res.status(200).json({
                                                                                    'statusCode': '1',
                                                                                    'message': 'Transfer Link has been sent..!'
                                                                              })

                                                                        } else {
                                                                              res.status(200).json({
                                                                                    'statusCode': '0',
                                                                                    'message': 'Something went wrong.Please try later....!'
                                                                              })
                                                                        }

                                                                  })
                                                                  .catch(err => {
                                                                        error = 1;
                                                                        console.log(err);
                                                                        res.status(200).json({
                                                                              'statusCode': '0',
                                                                              'message': 'Something went wrong.Please try later....!'
                                                                        })
                                                                  })

                                                      } else {

                                                            let groupName = response.classData.section ? response.classData.grade + '-' + response.classData.section : response.classData.grade

                                                            GroupTransferNotification(transferTeacherMobileNo, groupId, saveTranfer._id, response.teacherData.name, groupName)
                                                                  .then(success => {
                                                                        
                                                                        res.status(200).json({
                                                                              'statusCode': '1',
                                                                              'message': 'Group Transferred Successfully...!'
                                                                        })
                                                                  })
                                                                  .catch(err => {
                                                                        console.log(err);

                                                                        res.status(200).json({
                                                                              'statusCode': '0',
                                                                              'message': 'Something went wrong.Please try later....!'
                                                                        })
                                                                  })

                                                      }

                                                })
                                                .catch(err => {
                                                      console.log(err);

                                                      res.status(200).json({
                                                            'statusCode': '0',
                                                            'message': 'Something went wrong.Please try later....!'
                                                      })
                                                })



                                    })
                                    .catch(err => {
                                          console.log(err);

                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong.Please try later....!!"
                                          })
                                    })

                        } else if (error == 1) {

                              res.status(200).json({
                                    'statusCode': '0',
                                    'message': 'Access Denied....!'
                              })

                        } else if (error == 2) {

                              res.status(200).json({
                                    'statusCode': '0',
                                    'message': 'This group name already exists with teacher. Rename and tranfer it....!'
                              })

                        } else {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Something Went Wrong.Please try later....!!"
                              })

                        }

                  } else {

                        if (response && response.statusCode != "0" && response.teacherData.mobileNo == transferTeacherMobileNo) {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Cannot transfer group to yourself.....!!"
                              })


                        } else {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: "Access Denied.....!!"
                              })

                        }

                  }
            })

      } else {
            res.status(200).json({
                  "statusCode": "0",
                  "message": "All Fields are mandatory...!!"
            })
      }

}

module.exports = transferGroup;