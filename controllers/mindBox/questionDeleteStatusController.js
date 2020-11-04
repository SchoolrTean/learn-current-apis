const MindBoxAnswerModel = require('../../models/mindBox/mindBoxAnswerModel');
const MindBoxQuestionModel = require('../../models/mindBox/mindBoxQuestionModel');

exports.updateCanDeleteQuestionStatus = (doubtId) => {

      return new Promise((resolve, reject) => {

            MindBoxAnswerModel.findOne({
                        doubtId,
                        $or: [{
                              crowned: true
                        }, {
                              coinedAnswer: true
                        }, {
                              teacherAnswer: true
                        }],
                        answerDeleted: false,
                        isActive: true
                  })
                  .exec()
                  .then(answerFound => {

                        let deleteStatus = true;

                        if (answerFound) {
                              deleteStatus = false;
                        }

                        MindBoxQuestionModel.updateOne({
                                    _id: doubtId
                              }, {
                                    $set: {
                                          deleteStatus: deleteStatus
                                    }
                              })
                              .exec()
                              .then(updated => {

                                    if (updated.ok == 1) {
                                          resolve(1)
                                    } else {
                                          resolve(0)
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    reject(1);
                              })
                  })
                  .catch(err => {

                        console.log(err);
                        reject(1);

                  })
      });

}