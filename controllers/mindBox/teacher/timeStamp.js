const TimeStamp = require('../updateTimeStamp');

const VerifyTeacher = require('../../../middleware/verifyTeacher');


module.exports = (req, res, next) => {
      //Verify Teacher is active

      if (req.params.teacerId) {

            let teacerId = req.params.teacerId;

            //Student Exists and active
            VerifyTeacher(teacherId, (error, response) => {

                  if (response && response.statusCode != "0") {

                        TimeStamp(teacerId)
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

                        return res.status(200).json({
                              statusCode: "0",
                              message: "Access Denied.....!!"
                        })

                  }
            })

      } else {
            return res.status(200).json({
                  statusCode: "0",
                  message: "All fields are mandatory..!!"
            });
      }

}