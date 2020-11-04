const mongoose = require('mongoose');

/******************************** Remind Schema **************************/
const remindSchema = mongoose.Schema({
       userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim:true },
       reminderDate                : { type : Date, trim:true },
       reminderNote                : { type : String, trim:true },
       date                        : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
})

/*******************************./ End of Remind Schema */


/******************************** Announcement Schema *****************************/
const announcementSchema = mongoose.Schema({
       announcementTitle           : { type : String, required : false, trim:true },
       eventDate                   : { type : Date, required : false, trim:true }, //announcementDate
       announcement                : { type : String, required : false, trim:true },
       studentConfirmation         : { type : Boolean, default : false, trim:true }, 
})
/******************************** /.Announcement Schema **************************/

const assignmentSchema = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
       // teacherId                   : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:true, trim : true },
       groupId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_teacherGroups', required:true, trim : true },//grade and section Id or group name enterd Id
       sectionType                 : { type : String, required : true, trim : true }, // section name TaughtInClass OR HomeWork OR ProjectWork OR Announcement OR Test

       announcement                : announcementSchema,

       fileUrls                    : [ { type : String, required : false, trim : true } ],//Documents sent saved here
       additionalInformation       : { type : String, required : false, trim : true }, 


       /**This column takes all students at the current instance when teacher sends** the assignment.
        * If new candidate had done some action he/she will also be added and shown in the report 
        * New Student was added on current day then he/she will automatically got added to this list**/
       activeStudentIds            : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],


        /**Teacher Action Status was recoreded seperatly because group can be transfered to other teacher so 
         * if we save id then it may become problem when transfered so all teacher actions was recorded seperatly
       */
       teacherStared               : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
       teacherDeleteStatus         : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
       teacherDeleteAllStatus      : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
       cancelStatus                : { type : Boolean, default: false }, // 0 - Not cancelled, 1-Cancelled 

       //Both Teahcer and Student Actions 
       stared                      : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],
       deleted                     : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],

       //Student Actions
       seenStudents                : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],
       remindedUsers               : [ remindSchema ],

       /** Date and Time at which record was saved **/
       savedDateAndTime            : { type : Date, trim : true, default : () => Date.now() + 5.5*60*60*1000  },

       /** true-Sent, false-Saved i.e it is a scheduled homework. This homework should get confirmation from teacher to send Students **/
       sentStatus                  : { type : Boolean, default : true },  

       /** Can Edit Upto Date */
       upcomingDate                : { type : Date, trim : true },

       isActive                    : { type : Boolean, default: true }, // 0 - Delete for everyone 1- visible to everyone  

       /** Date at which homework need to be sent or Sent **/
       date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});

// schoolSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, cancelStatus : 1, date : 1, deletedStudents : 1 });
assignmentSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, eventDate: 1, cancelStatus : 1, date : 1, isActive : 1, stared : 1, sentStatus : 1 });

module.exports = mongoose.model('Announcement', assignmentSchema, 'sc_assignments');