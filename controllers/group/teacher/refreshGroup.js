const mongoose = require('mongoose');
const randomize = require('randomatic');

const VerifyTeacher = require('../../../middleware/verifyTeacher');

const ConnectionModel = require('../../../models/group/connectionModel')
const GroupModel = require('../../../models/group/teacherGroupModel');


/**
 * Refresh Group - Its like reset your mobile. 
 * All data of the group will be lost and its like a new group created and students added to it.!!
 */
const refreshGroup = (req, res, next) => {

      if (req.params.teacherId && req.params.groupId) {

            let teacherId = req.params.teacherId
            let groupId = req.params.groupId

            //Verify Teacher and Grade
            VerifyTeacher(teacherId, groupId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        const groupData = new GroupModel({
                              _id: new mongoose.Types.ObjectId(),
                              teacherId,
                              grade: response.classData.grade,
                              gradeId: response.classData.gradeId,
                              section: response.classData.section,
                              groupPic:response.classData.groupPic,
                              groupLink: randomize('a0', 10),
                              createdBy: teacherId
                        });

                        groupData.save()
                              .then(teacherDetails => {

                                    if (teacherDetails) {

                                          /**
                                           * Check whether group is transferred or not.
                                           */
                                          GroupModel.updateOne({
                                                      _id: groupId,
                                                      isActive: true
                                                }, {
                                                      $set: {
                                                            isActive: false
                                                      }
                                                })
                                                .exec()
                                                .then(groupRemoved => {

                                                      ConnectionModel.updateMany({
                                                                  groupId: groupId,
                                                                  isActive: true
                                                            }, {
                                                                  $set: {
                                                                        isActive: false
                                                                  }
                                                            })
                                                            .exec()
                                                            .then(connectionsRemoved => {

                                                                  if (groupRemoved && connectionsRemoved.ok > 0) {

                                                                        return res.status(200).json({
                                                                              statusCode: "1",
                                                                              message: "Successfull...!!"
                                                                        });

                                                                  } else {
                                                                        res.status(200).json({
                                                                              'statusCode': '0',
                                                                              'message': 'Access Denied....!'
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
                                                            'statusCode': '0',
                                                            'message': 'Something went wrong.Please try later....!'
                                                      })
                                                })

                                    } else {

                                          return res.status(200).json({
                                                statusCode: "0",
                                                message: "Something Went Wrong. Plz try later..!"
                                          });

                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    return res.status(200).json({
                                          statusCode: "0",
                                          message: "Something Went Wrong. Plz try later..!!"
                                    });
                              });



                  } else {

                        res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied.....!!"
                        })

                  }
            })

      } else {
            res.status(200).json({
                  "statusCode": "0",
                  "message": "All Fields are mandatory...!!"
            })
      }

}

module.exports = refreshGroup;