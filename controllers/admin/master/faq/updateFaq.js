const FAQModel = require('../../../../models/admin/master/faqModel');



const GetFaq = (req, res, next) => {

      let questionUrl = "";
      let solutionUrls = [];

      console.log(req.files);

      if (req.files['questionImage'] && req.files['questionImage'].length == 1) {
            questionUrl = req.files['questionImage'][0].path.replace(/\\/g, '/');
      }

      if (req.files['answerImage'] && req.files['answerImage'].length > 0) {

            req.files['answerImage'].forEach(file => {
                  let correctPath = file.path.replace(/\\/g, '/');
                  solutionUrls.push(correctPath);
            });

      }


      if (req.body.question && (req.body.solution || solutionUrls.length > 0) && req.params.faqId) {

            try {

                  let question = req.body.question;
                  let solution = req.body.solution;

                  FAQModel.update({
                              _id: faqId,
                              isActive: true
                        }, {
                              $set: {
                                    question,
                                    questionUrl,
                                    solution,
                                    solutionUrls
                              }
                        })
                        .then(FAQSaved => {

                              if (FAQSaved) {
                                    res.status(200).json({
                                          statusCode: "1",
                                          message: "Successful..!!"
                                    });
                              } else {
                                    res.status(200).json({
                                          statusCode: "0",
                                          message: "Something Went Wrong. Please Try Later..!!"
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

            } catch (error) {

                  console.log(error);

                  return res.status(200).json({
                        statusCode: "0",
                        message: "Something Went Wrong. Please Try Later..!!"
                  });
            }



      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }


}

module.exports = GetFaq