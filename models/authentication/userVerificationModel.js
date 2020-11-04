const mongoose = require('mongoose');

/**Inserted  in the following scenarios
 * 1. On creation of teacher account verificaiton of mobile is needed
 * 2. On forgot password of both student/teacher
 * 
 * Deleted once its verification was done
 * */
const userVerificationSchema = mongoose.Schema({
        _id                     : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
        
        emailId                 : { type : String, required : false, trim : true },
        mobileNo                : { type : Number, required : false, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999, trim: true },

        /**Verification code is directly dependent on failed attempts if its greater than 3 new Verification Code is issued. */
        verificationCode        : { type : Number, required : true, trim:true },

        /**0-Not Verified, 1-Verified */
        verificationStatus      : { type : Number, default: 0 },
        userType                : { type : Boolean, default: true },// true-Student, false-teacher 

        /**Failed Attempts for login and otp trails if its more than 3 the account gets blocked */
        failedAttempts          : { type : Number, trim: true, default: 0 }, // max 3 attempts for otp and wrong login        
        isConfirmed             : { type : Boolean, default: false }, //OTP Confirmation
        
        isActive                : { type : Boolean, default: true },
        date                    : { type : Date, default: Date.now }
});

userVerificationSchema.index( {  _id : 1, mobileNo : 1, emailId : 1, isConfirmed : 1, isActive : 1} );

module.exports = mongoose.model('sc_mobile_verification', userVerificationSchema);