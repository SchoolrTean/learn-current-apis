const mongoose = require('mongoose');

const PartnerModel = require('../../models/partner/partner');

exports.createPartner = (req, res, next) => {

       if (req.body.partnerName && req.body.partnerEmailId && req.body.password) {
              let _partnerName = req.body.partnerName;
              let _partnerEmailId = req.body.partnerEmailId;
              let _password = req.body.password;


              _partnerEmailId = _partnerEmailId.toLowerCase();

              //check if teacher exists
              PartnerModel.findOne({
                            partnerEmailId: _partnerEmailId
                     })
                     .exec()
                     .then(partnerFound => {

                            if (!partnerFound) {

                                   const partnerDetails = new PartnerModel({
                                          _id: new mongoose.Types.ObjectId(),
                                          partnerName: _partnerName,
                                          searchPartnerName: _partnerName.toLowerCase(),
                                          partnerEmailId: _partnerEmailId,
                                          password: _password
                                   });

                                   partnerDetails.save()
                                          .then(TopicVideos => {

                                                 return res.status(200).json({
                                                        statusCode: "1",
                                                        message: "Partner Added Successfully...!!"
                                                 });

                                          })
                                          .catch(err => {
                                                 console.log(err);
                                                 return res.status(200).json({
                                                        statusCode: "0",
                                                        message: "Something went wrong. Please try again..!!"
                                                 })
                                          });

                            } else {
                                   return res.status(200).json({
                                          statusCode: "0",
                                          message: "Already registered..!!"
                                   });
                            }
                     })
                     .catch(err => {
                            return res.status(200).json({
                                   statusCode: "0",
                                   message: "Something went wrong. Please try again..!!"
                            })
                     });
       } else {
              return res.status(200).json({
                     statusCode: "0",
                     message: "All fields are mandatory..!!"
              });
       }

}