const MindBoxAnswerModel = require('../../models/mindBox/mindBoxAnswerModel');


exports.count = (doubtId, mindBoxOpendTimestamp = null) => {

      return new Promise(async (resolve, reject) => {

            MindBoxAnswerModel.countDocuments({
                        doubtId,
                        answerDeleted: false,
                        date: {
                              $gt: mindBoxOpendTimestamp
                        },
                        isActive: true
                  }).then(newAnswersCount => {

                        if (newAnswersCount > 0) {
                              resolve(true);
                        } else {
                              resolve(false);
                        }

                  })
                  .catch(err => {
                        console.log(err);
                        reject(0);
                  });

      });
}