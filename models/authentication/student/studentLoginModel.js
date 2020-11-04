const mongoose = require('mongoose');

const StudentLoginSchema =  mongoose.Schema({
       /**Auto Generated id which is used to represent user account through out the application */
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       
       emailId                     : { type : String, required : false, trim : true },

       /** Mobile No and password of teacher used for authentication*/
       mobileNo                    : { type : Number, required : false, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999 },    
       password                    : { type : String, required : false, trim:true },  
       
       
       /**This flag is used for student to check student is logged in for the first time after sending password as 
        * sms to him.
        * 
        * This is used to check wheather the new student should be added to group with the status of pending or joined
        * if logged In is 1 - then its joined
        * if logged In is 0 - then its pending
        * 
        * Blocked Status - 2 //User Blocked due to completed attempts
        */
       loggedIn                    : { type : Number, default: false },


       /**Failed Attempts for login and otp trails if its more than 3 the account gets blocked */
       failedAttempts              : { type : Number, trim: true }, // max 3 attempts for otp and wrong login


       /** This key is updated every time when notificaiton List was seen by the user 
        * So that we can calculate unseen notificaitons count and notification list
        */
       // notificationListLastSeenTimestamp : { type : Date, trim:true },

       verificationCode            : { type : Number, trim: true },

       isActive                    : { type : Boolean, default: true },
       date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});


studentSchema.index( { _id : 1, mobileNo : 1, type : 1 } );

module.exports = mongoose.model('sc_studentlogin', StudentLoginSchema)
