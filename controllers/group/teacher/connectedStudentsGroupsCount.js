const ClassStudentConnectionModel = require('../../../models/classes/classStudentConnectionModel');
const mongoose = require('mongoose');

const count = (groupIdsString) => {

      return new Promise((resolve, reject) => {

            if (groupIdsString) {

                  let groupIdsObjectsArray = groupIdsString.split(',').filter(el => el).map(groupId => mongoose.Types.ObjectId(groupId));

                  ClassStudentConnectionModel.aggregate([{
                              "$match": {
                                    "classId": {
                                          "$in": groupIdsObjectsArray
                                    },
                                    "connectionStatus": 1,
                                    "isActive": true,
                              }
                        }, {
                              "$group": {
                                    "_id": '$classId'
                              }
                        }])
                        .exec()
                        .then(connectionsFoundGroups => {

                              let connectionGroupArray = [];

                              for (let index = 0; index < connectionsFoundGroups.length; index++) {
                                    connectionGroupArray.push(connectionsFoundGroups[index]._id)
                              }

                              resolve({
                                    groups: connectionGroupArray,
                                    groupsCount: connectionGroupArray.length
                              });

                        })
                        .catch(err => {
                              console.log(err);
                              reject(1) //Something Went Wrong
                        })

            } else {
                  reject(2) // All fields are Mandatory
            }

      })



}

module.exports = count