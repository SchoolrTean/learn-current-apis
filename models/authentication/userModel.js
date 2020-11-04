const mongoose = require('mongoose');

const studentSchema =  mongoose.Schema({
       /**Auto Generated id which is used to represent user through out the application */
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
       

       /** EmailId or Mobile No and password of teacher or student or school used for authentication **/
       emailId                     : { type : String, required : false, trim : true },
       mobileNo                    : { type : Number, required : false, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999 },    
       password                    : { type : String, required : false, trim:true },  
       
       /**Basic Details data representation of User*/
       firstName                   : { type : String, required : false, trim:true }, 
       surName                     : { type : String, required : false, trim:true }, 

       /**This flag is used for editing student name by first teacher in private teacher
        * For school this is schoolId who had added this user
        * 
        * This id is overided by school has added the same student then school will have option to change student Name
        */
       addedBy                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true },

       // 0-Teacher, 1-Student, 2-school, 3-Coordinator, 4-CoordinatorAndTeacher
       type                        : { type : Number, default: 1 }, 
       profilePic                  : { type : String, required : false, trim : true },

       /**School Teacher/Student will have schoolId and schoolInvitationStatus for invitationSent or invitation Pening but added to the school*/
       schoolId                    : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true },
       schoolInvitationStatus      : { type: Number, default: 1 }, //1-connected, 0-not connected

       schoolName                  : { type : String, required : false, trim : true },
       schoolBranch                : { type : String, required : false, trim : true },
       schoolAddress               : { type : String, required : false, trim : true },
       schoolCity                  : { type : String, required : false, trim : true },
       schoolEmailId               : { type : String, required : false, trim : true },
       schoolContactNumber         : { type : String, required : false, trim : true },

       
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

       isConfirmed                 : { type : Boolean, default : false }, //OTP Confirmed or Not
       status                      : { type : Boolean, default : false },//false - Suspended true - Active
       subscribedTillDate          : { type : Date, trim : true }, // User can access account upto this date
       

       notificationId              : { type : String, required : false, trim:true },


       /**Failed Attempts for login and otp trails if its more than 3 the account gets blocked */
       failedAttempts              : { type : Number, trim: true }, // max 3 attempts for otp and wrong login


       /** false-dont show online, true-show online status in chat conversation */
       chatOnlineStatus            : { type : Boolean, default : false }, 

       /**DND end time is pushed depending on hours selected */
       dndEndTimestamp             : { type : Date, trim : true },

       /** This key is updated every time when notificaiton List was seen by the user 
        * So that we can calculate unseen notificaitons count and notification list
        */
       // notificationListLastSeenTimestamp : { type : Date, trim:true },

       mindBoxCoins                : {type :Number, trim:true, default : 0},

       mindBoxOpendTimestamp       : { type : Date, trim:true },

       verificationCode            : { type : Number, trim: true },

       isActive                    : { type : Boolean, default: true },
       date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});


studentSchema.index( { _id : 1, emailId : 1, mobileNo : 1, type : 1 } );

module.exports = mongoose.model('sc_user', studentSchema)
