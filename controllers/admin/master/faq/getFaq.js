const FAQModel = require('../../../../models/admin/master/faqModel');



const GetFaq = (req, res, next) => {

      FAQModel.find({
                  isActive: true
            }).exec()
            .then(faqList => {

                  if (faqList.length > 0) {

                        let faqDataList = faqList.map(faqQuestion => {
                              return {
                                    questionId: faqQuestion._id,
                                    question: faqQuestion.question ? faqQuestion.question : "",
                                    questionUrl: faqQuestion.questionUrl ? faqQuestion.questionUrl : "",
                                    solution: faqQuestion.solution ? faqQuestion.solution : "",
                                    solutionUrls: faqQuestion.solutionUrls ? faqQuestion.solutionUrls : [],
                              }
                        });

                        res.status(200).json({
                              statusCode: "1",
                              faqList : faqDataList,
                              message: "Data Found..!!"
                        });

                  } else {

                        res.status(200).json({
                              statusCode: "0",
                              message: "No Records Found"
                        });

                  }

            })
            .catch(err => {
                  console.log(err);

                  res.status(200).json({
                        statusCode: "0",
                        message: "Something Went Wrong. Please Try Later..!!"
                  });
            })

}

module.exports = GetFaq