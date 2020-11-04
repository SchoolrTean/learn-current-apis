const mongoose = require('mongoose');

/******************************** Remind Schema **************************/
const reminderSchema = mongoose.Schema({
      userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim:true },
      reminderDate                : { type : Date, trim:true },
      reminderNote                : { type : String, trim:true },
      date                        : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
})

/*******************************./ End of Remind Schema */


/******************************* Topics Schema *******************************/
const topicsSchema = mongoose.Schema({
      topicId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_topics', required : true, trim:true },
      topicName                   : { type : String, required : true, trim : true }, 
      videoId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_video', required : false, trim:true },
      videoName                   : { type : String, required : false, trim : false }, 
      videoUrl                    : { type : String, required : false, trim : false }
})

/******************************** /.End of Topics Schema  ****************************/



const classRoomSchema = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
       // teacherId                   : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:true, trim : true },
       groupId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_teacherGroups', required:true, trim : true },//grade and section Id or group name enterd Id
       sectionType                 : { type : String, required : true, trim : true }, // section name TaughtInClass OR HomeWork OR ProjectWork OR Announcement OR Test

       topics                       : [topicsSchema],

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

       /**If Assignment has been updated then the interlinking b/w updated assignment is made with this key */
       updatedAssignmentId         : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_assignment', required : false, trim : true },
       updatedAssignmentDate       : { type : Date, required : false, trim : true },

      /**Previous recored && updated record which was updated will have this flag true so that they could be recognized as updated in assignments*/
       updatedStatus               : { type : Boolean, default: false }, 

       /**Previous recored which was updated will have this flag true so that they could be removed in planner*/
       previousRecord              : { type : Boolean, default: false }, 
       
       
       //Both Teahcer and Student Actions 
       stared                      : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],
       deleted                     : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],

       //Student Actions
       seenStudents                : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],
       remindedUsers               : [ reminderSchema ],

       /** Date and Time at which record was saved **/
       savedDateAndTime            : { type : Date, trim : true, default : () => Date.now() + 5.5*60*60*1000 },

       /** true-Sent, false-Saved i.e it is a scheduled homework. This homework should get confirmation from teacher to send Students **/
       sentStatus                  : { type : Boolean, default : true },  

       isActive                    : { type : Boolean, default: true }, // 0 - Delete for everyone 1- visible to everyone  

       /** Date at which homework need to be sent or Sent **/
       date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});

// schoolSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, cancelStatus : 1, date : 1, deletedStudents : 1 });
classRoomSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, eventDate: 1, cancelStatus : 1, date : 1, isActive : 1, deleted : 1});
classRoomSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, eventDate: 1, cancelStatus : 1, date : 1, isActive : 1, stared : 1});

module.exports = mongoose.model('ClassRoom', classRoomSchema, 'sc_assignments');