const mongoose = require('mongoose');

const verificationSchema =  mongoose.Schema({
       /**Auto Generated id which is used to represent user through out the application */
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
       emailId                     : { type : String, required : false, trim : true },

       verificationCode            : { type : Number, trim: true },

       /**Failed Attempts for login and otp trails if its more than 3 the account gets blocked */
       failedAttempts              : { type : Number, trim: true }, // max 3 attempts for otp and wrong login

       isConfirmed                 : { type : Boolean, default: false }, //OTP Confirmation

       isActive                    : { type : Boolean, default: true },
       date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});


verificationSchema.index( { _id : 1, emailId : 1, isActive : 1} );

module.exports = mongoose.model('learn_user_verification_code', verificationSchema)
