const mongoose = require('mongoose');

const studentSchema =  mongoose.Schema({
       /**Auto Generated id which is used to represent user through out the application */
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       
       emailId                     : { type : String, required : false, trim : true },

       /** Mobile No and password of teacher used for authentication*/
       mobileNo                    : { type : Number, required : false, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999 },    
       password                    : { type : String, required : false, trim:true },  
       
       /**Basic Details data representation of User*/
       name                        : { type : String, required : false, trim:true }, 
       profilePic                  : { type : String, required : false, trim : true },

       loginType                   : { type : Number, required : true, default:1, trim:true },//1-Normal Login 2-Social Login

       syllabusId                  : { type : mongoose.Schema.Types.ObjectId, ref : "master_syllabus", required : true, trim:true },
       mediumId                    : { type : mongoose.Schema.Types.ObjectId, ref : "master_medim", required : true, trim:true },
       gradeId                     : { type : mongoose.Schema.Types.ObjectId, ref : "master_grade", required : true, trim:true },


       /**Failed Attempts for login and otp trails if its more than 3 the account gets blocked */
       failedAttempts              : { type : Number, trim: true }, // max 3 attempts for otp and wrong login

       isConfirmed                 : { type : Boolean, default : false }, //OTP Confirmed or Not
       status                      : { type : Boolean, default : false },//false - Suspended true - Active
       subscribedTillDate          : { type : Date, trim : true }, // User can access account upto this date

       chatOpenedTimeStamp         : { type : Date, trim : true }, // User can access account upto this date

       mindBoxCoins                : { type : Number, default : 0, trim: true },

       notificationId              : { type : String, required : false, trim:true },
       
       isActive                    : { type : Boolean, default: true },
       date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});


studentSchema.index( { _id : 1, emailId : 1, mobileNo : 1, isActive : 1 } );

module.exports = mongoose.model('learn_user', studentSchema)
