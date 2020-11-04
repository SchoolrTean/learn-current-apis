const mongoose = require('mongoose');

const projectWorkGroupSchema      = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
       groupTopic                  : { type : String, required : false, trim:true },
       students                    : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_student', required:true }  ],
});
 

const notCompletedSchema = mongoose.Schema({
       userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_student', required : false, trim:true },
       reason                      : { type : String, required : true, trim : true },
})

/************************************************* Announcements ************************************************/

const schoolAssignmentSchema = mongoose.Schema({

       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true }, 
       teacherId                   : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_teacher', required:true, trim:true },
       groupId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_teacherGroups', required:true, trim:true }, //grade and section Id or group name enterd Id
       sectionType                 : { type : String, required : false, trim:true},

/********************************************************** Announcement Fields *****************************************************/

       announcementTitle           : { type : String, required : false, trim:true },
       eventDate                   : { type : Date, required : false, trim:true }, //announcementDate
       announcement                : { type : String, required : false, trim:true },
       studentConfirmation         : { type : Boolean, default : false, trim:true }, 


/*********************************************************** Test Fields *****************************************************/

       testTitle                   : { type : String, required : false, trim:true }, 
       subject                     : { type : String, required:true, trim : true },
       chapter                     : { type : String, required:false, trim : true },
       eventDate                   : { type : Date, required:true, trim : true }, //testDate


/********************************************************** Project Fields *****************************************************/

       projectTitle                : { type : String, required : true, trim:true},
       eventDate                   : { type : Date, required : false, trim:true },//dateOfSubmission
       groupData                   : [ projectWorkGroupSchema ],      

/***************************************************** Taught In Class *******************************************************/

       topicsIds                   : [ { type : mongoose.Schema.Types.ObjectId , required : false, trim : true, ref : 'sc_topics' } ],
       newTopics                   : [ { type : String , required : false, trim : true } ],


/********************************************************** Home Work Fields *****************************************************/

       subject                     : { type : String, required : false, trim:true },
       bookType                    : { type : String, required : false, trim:true },
       chapter                     : { type : String, required : false, trim:true },
       exercises                   : { type : String, required : false, trim:true },

       star                        : { type : Boolean, default: false },
       cancelStatus                : { type : Boolean, default: false },
       teacherDeleteStatus         : { type : Boolean, default: false },
       teacherDeleteAllStatus      : { type : Boolean, default: false },
       isActive                    : { type : Boolean, default: true },


/***************************************************** Common for All for independent Entity *******************************************************/

       sectionUrls                 : [{ type : String, required : false, trim:true }],//Documents sent saved here
       note                        : { type : String, required : false, trim:true },
       completedStudents           : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_student', required : false, trim:true } ],
       remindedUsers               : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_student', required : false, trim:true } ],
       notCompletedStudents        : [ notCompletedSchema ],

       /**This column takes all students at the current instance when teacher pushes the assignment.
        * If new candidate had done some action he/she will also be added and shown in the report 
        * New Student was added on current day then he/she will automatically got added to this list**/
       presetStudentIds            : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_student', required : false, trim:true } ],
          

/***************************************************** Common for All for independent Entity *******************************************************/

       stared                     : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_student', required : false, trim:true } ],
       deleted                    : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_student', required : false, trim:true } ],


/***************************************************** Common for All *******************************************************/

       /** true-Sent, false-Saved i.e it is a scheduled homework. This homework should get confirmation from teacher to send Students **/
       sentStatus                 : { type : Boolean, default : true },  

       date                       : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
});

/************************************************* ./Announcements ************************************************/


schoolAssignmentSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, testDate: 1, cancelStatus : 1, dateOfSubmission :1, date : 1,  announcementDate : 1, isActive : 1, star : 1   });//completedStudents: 1,notCompletedStudents :1,deleted : 1,

module.exports = mongoose.model('sc_schoolassignments', schoolAssignmentSchema);

