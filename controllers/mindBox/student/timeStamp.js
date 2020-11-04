const TimeStamp = require('../updateTimeStamp');

const VerifyStudent = require('../../../middleware/verifyStudent')


module.exports = (req, res, next) => {
      //Verify Teacher is active

      if (req.params.studentId) {

            let studentId = req.params.studentId;

            //Student Exists and active
            VerifyStudent(studentId, "")
                  .then(success => {

                        if (success.statusCode == "1") {

                              TimeStamp(studentId)
                                    .then(updated => {

                                          res.status(200).json({
                                                statusCode: "1",
                                                message: "Time Stamp Updated.....!!"
                                          })

                                    })
                                    .catch(err => {
                                          console.log(err);
                                          res.status(200).json({
                                                statusCode: "0",
                                                message: "Access Denied.....!!"
                                          })

                                    })

                        } else {

                              res.status(200).json({
                                    statusCode: "0",
                                    message: success.message
                              })

                        }

                  })
                  .catch(err => {
                        console.log(err);

                        res.status(200).json({
                              statusCode: "0",
                              message: "Something went wrong. Please Try Later..!!"
                        })
                  })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}