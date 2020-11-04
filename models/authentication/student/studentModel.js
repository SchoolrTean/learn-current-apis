const mongoose = require('mongoose');

const studentSchema =  mongoose.Schema({
       /**Auto Generated id which is used to represent user through out the application */
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       
       emailId                     : { type : String, required : false, trim : true },

       /** Mobile No and password of teacher used for authentication*/
       mobileNo                    : { type : Number, required : false, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999 },    
       
       /**Basic Details data representation of User*/
       firstName                   : { type : String, required : false, trim:true }, 
       surName                     : { type : String, required : false, trim:true }, 

       /**This flag is used for editing student name by first teacher in private teacher
        * For school this is schoolid who had added this user
        * 
        * This id is overided by school has added the same student then school will have option to change student Name
        */
       addedBy                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true },

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
       

       notificationId              : { type : String, required : false, trim:true },


       /** false-dont show online, true-show online status in chat conversation */
       chatOnlineStatus            : { type : Boolean, default : false }, 

       /**DND end time is pushed depending on hours selected */
       dndEndTimestamp             : { type : Date, trim : true },

       /** This key is updated every time when notificaiton List was seen by the user 
        * So that we can calculate unseen notificaitons count and notification list
        */
       // notificationListLastSeenTimestamp : { type : Date, trim:true },

       isActive                    : { type : Boolean, default: true },
       date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});


studentSchema.index( { _id : 1, mobileNo : 1, type : 1 } );

module.exports = mongoose.model('sc_student', studentSchema)
