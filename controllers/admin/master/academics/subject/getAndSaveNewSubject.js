const mongoose = require('mongoose');

const SubjectsModel = require('../../../../../models/admin/master/academic/subjectsModel');



module.exports = (subjectName, teacherId) => {

    return new Promise((resolve, reject) => {

        try {

            if (subjectName && teacherId) {

                SubjectsModel.findOne({
                    searchableSubjectName: subjectName.toLowerCase(),
                    $or:[{
                        addedBy: true,
                    },{
                        addedByUserId: teacherId,
                        addedBy: false,
                    }],                    
                    isActive: true

                }).exec()
                    .then(SubjectFound => {

                        if (!SubjectFound) {

                            const SubjectData = new SubjectsModel({
                                _id: new mongoose.Types.ObjectId(),
                                subjectName: subjectName,
                                searchableSubjectName: subjectName.toLowerCase(),
                                addedByUserId: teacherId,
                                addedBy: false
                            });

                            SubjectData.save()
                                .then(subjectSaved => {
                                   resolve(subjectSaved._id);
                                })
                                .catch(err => {
                                    reject(0);
                                })

                        } else {
                            resolve(SubjectFound._id);
                        }

                    }).catch(err => {
                        console.log(err);
                        reject(0);
                    })

            } else {
                reject(0);
            }

        } catch (error) {
            reject(0);
        }

    })

}