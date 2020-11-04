const ChapterModel = require('../../../../models/admin/learn/academic/chaptersModel');
const ChapterCalculation = require('./chapter');


const SubjectBookChapterList = (userId, bookId) => {

      return new Promise((resolve, reject) => {

            try {

                  if (userId && bookId) {

                        ChapterModel.find({
                                    bookId,
                                    isActive: true
                              })
                              .exec()
                              .then(async chapterList => {

                                    if (chapterList.length > 0) {

                                          let totalChapterPercentage = 0;

                                          for (let index = 0; index < chapterList.length; index++) {
                                                const chapter = chapterList[index];
                                                totalChapterPercentage += parseInt(await ChapterCalculation(userId, chapter._id))
                                          }

                                          resolve(totalChapterPercentage != 0 ? Math.round((totalChapterPercentage / (chapterList.length * 100)) * 100) : 0);

                                    } else {
                                          resolve(0);
                                    }

                              })
                              .catch(err => {
                                    console.log(err);
                                    reject(0)
                              })


                  } else {
                        reject(0)
                  }

            } catch (error) {
                  console.log(error);
                  reject(0)
            }

      })

}

module.exports = SubjectBookChapterList