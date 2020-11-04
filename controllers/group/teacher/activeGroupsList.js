const TeacherClassModel = require('../../../models/classes/classTeacherConnectionModel');

const groupList = (teacherId) => {

      return new Promise((resolve, reject) => {

            if (teacherId) {

                  TeacherClassModel.find({
                              teacherId,
                              // transferGroup: false,
                              isActive: true
                        }, {
                              "classId": 1,
                        })
                        .exec()
                        .then(groupsList => {
                              console.log("groupList" + groupsList);

                              let groupsListArray = groupsList.map(groupId => groupId.classId);

                              resolve(groupsListArray);

                        })
                        .catch(err => {
                              console.log(err);
                              reject(1) //Something Went Wrong
                        })
            } else {
                  console.log(err);
                  reject(1) //Something Went Wrong
            }

      })

}

module.exports = groupList;

