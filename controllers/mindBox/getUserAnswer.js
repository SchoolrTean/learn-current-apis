const MindBoxAnswerModel = require('../../models/mindBox/mindBoxAnswerModel');


module.exports = (questionId, userId) => {

      return new Promise(async (resolve, reject) => {

            MindBoxAnswerModel.findOne({
                        questionId,
                        answeredUserId: userId,
                        answerDeletedStatus: false,
                        isActive: true
                  }).then(userAnswer => {

                        if (userAnswer) {
                              resolve(userAnswer);
                        } else {
                              resolve("");
                        }

                  })
                  .catch(err => {
                        console.log(err);
                        reject(0);
                  });

      });
}