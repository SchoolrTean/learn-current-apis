const mongoose = require('mongoose');

/******************************** Remind Schema **************************/
const remindSchema = mongoose.Schema({
       userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim:true },
       reminderDate                : { type : Date, trim:true },
       reminderNote                : { type : String, trim:true },
       date                        : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
})

/*******************************./ End of Remind Schema */


/******************************* Home Work Schema *******************************/
const notCompletedSchema = mongoose.Schema({
       userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim:true },
       reason                      : { type : String, required : true, trim : true },
})
/******************************** /.End of Home Work Schema  ****************************/


/******************************* Home Work Completed Schema *******************************/
const completedSchema = mongoose.Schema({
       userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim:true },
       completionTimeStamp         : {  type : Date, required : true, default : () => Date.now() + 5.5*60*60*1000, trim:true }
})
/******************************** /.End of Home Work Completed Schema  ****************************/


/******************************** Project Schema *****************************/
const projectWorkGroupSchema      = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
       groupTopic                  : { type : String, required : false, trim : true },
       projectSubmittedStatus      : { type : String, default: "" },
       students                    : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true } ],
});
/******************************** /.Project Schema **************************/


/********************************** ./Test Schema ********************************/



const assignmentSchema = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
       teacherId                   : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:true, trim : true },
       groupId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_school_or_invidual_teacher_class', required:true, trim : true },//grade and section Id or group name enterd Id
       sectionType                 : { type : String, required : true, trim : true }, // section name TaughtInClass OR HomeWork OR ProjectWork OR Announcement OR Test
       
       subject                     : { type : String, required : false, trim:true },
       title                       : { type : String, required : false, trim:true },
       eventDate                   : { type : Date, required : false, trim:true },
       duration                    : { type : Number, required : false, trim:true },
       // endDateAndTime              : { type : Date, required : false, trim:true },

       chapter                     : [ { type : String, required : false, trim:true } ],
       // chapterId                   : [ { type : mongoose.Schema.Types.ObjectId, ref: 'learn_subject_book_chapter', required : false, trim:true } ],

       topics                      : [ { type : String, required : false, trim:true } ],
       // topicIds                    : [ { type : mongoose.Schema.Types.ObjectId, ref: 'learn_subject_book_chapter_topic', required : false, trim:true } ],

       // exercises                   : [ { type : String, required : false, trim:true } ],
       // exerciseIds                 : [ { type : mongoose.Schema.Types.ObjectId, ref : 'learn_academic_exercise', required : false, trim:true } ],
       exerciseId                  : { type : mongoose.Schema.Types.ObjectId, ref : 'learn_academic_exercise', required : false, trim:true },

       workSheetIds                : [ { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_question_bank_work_sheet_model', required : false, trim:true } ],
       
       completedStudentList        : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim:true } ],
       completedStudents           : [ completedSchema ],
       notCompletedStudents        : [ notCompletedSchema ],

       announcement                : { type : String, required : false, trim:true },
       studentConfirmation         : { type : Boolean, default : false, trim:true }, 
       coming                      : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim:true } ],
       notComing                   : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim:true } ],

       groupData                   : [ projectWorkGroupSchema ],  
       

       fileUrls                    : [ { type : String, required : false, trim : true } ],//Documents sent saved here
       additionalInformation       : { type : String, required : false, trim : true }, 


       /**This column takes all students at the current instance when teacher sends** the assignment.
        * If new candidate had done some action he/she will also be added and shown in the report 
        * New Student was added on current day then he/she will automatically got added to this list**/
       activeStudentIds            : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],


       /**This column takes all students at the current instance when teacher sends** the assignment.
        * If new candidate had done some action he/she will also be added and shown in the report 
        * New Student was added on current day then he/she will automatically got added to this list**/
       // studentsAddedToPortfolio            : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],


       
       /**Teacher Action Status was recoreded seperatly because group can be transfered to other teacher so 
         * if we save id then it may become problem when transfered so all teacher actions was recorded seperatly
       */
       // teacherStared               : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
       teacherDeleteStatus         : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
       teacherDeleteAllStatus      : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
       cancelStatus                : { type : Boolean, default: false }, // 0 - Not cancelled, 1-Cancelled 

       /**If Assignment has been updated then the interlinking b/w updated assignment is made with this key */
       // updatedAssignmentId         : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_assignment', required : false, trim : true },
       // updatedAssignmentDate       : { type : Date, required : false, trim : true },

       /**Previous recored && updated record which was updated will have this flag true so that they could be recognized as updated in assignments*/
       updatedStatus               : { type : Boolean, default: false },  //1- New 2-rescheduled i.e date has been changed 3-updated Datai.e data has been changed

       /**Previous recored which was updated will have this flag true so that they could be removed in planner*/
       updatedText                 : { type : String, trim:true }, 

       /**Previous recored which was updated will have this flag true so that they could be removed in planner*/
       // previousRecord              : { type : Boolean, default: false }, 
       
       //Both Teahcer and Student Actions 
       stared                      : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],
       // deleted                     : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],

       //Student Actions
       seenStudents                 : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],
       remindedUsers                : [ remindSchema ],

       /** Date and Time at which record was saved **/
       lastActionTimeStamp          : { type : Date, trim : true, default : () => Date.now() + 5.5*60*60*1000 },

       /** Date and Time at which record was saved **/
       scheduledDateAndTime         : { type : Date, trim : true },//, default : () => Date.now() + 5.5*60*60*1000

       /** true-Sent, false-Saved i.e it is a scheduled homework. This homework should get confirmation from teacher to send Students **/
       sentStatus                   : { type : Boolean, default : true },  


       isActive                     : { type : Boolean, default: true }, // 0 - Delete for everyone 1- visible to everyone  

       /** Date at which homework need to be sent or Sent **/
       date                         : { type : Date, required : true, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});

// schoolSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, cancelStatus : 1, date : 1, deletedStudents : 1 });
assignmentSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, eventDate: 1, cancelStatus : 1, date : 1, isActive : 1,  deleted : 1   });

module.exports = mongoose.model('sc_assignment', assignmentSchema);



// const mongoose = require('mongoose');

// /******************************** Remind Schema **************************/
// const remindSchema = mongoose.Schema({
//        userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim:true },
//        reminderDate                : { type : Date, trim:true },
//        reminderNote                : { type : String, trim:true },
//        date                        : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
// })

// /*******************************./ End of Remind Schema */


// /******************************* Home Work Schema *******************************/
// const notCompletedSchema = mongoose.Schema({
//        userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim:true },
//        reason                      : { type : String, required : true, trim : true },
// })

// const homeWorkSchema = mongoose.Schema({
//        subject                     : { type : String, required : false, trim:true },
//        homeWorkTitle               : { type : String, required : false, trim:true },
//        eventDate                   : { type : Date, required : false, trim:true },
//        chapter                     : { type : String, required : false, trim:true },
//        topics                      : { type : String, required : false, trim:true },
//        completedStudents           : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim:true } ],
//        notCompletedStudents        : [ notCompletedSchema ],
// })
// /******************************** /.End of Home Work Schema  ****************************/


// /******************************** Announcement Schema *****************************/
// const announcementSchema = mongoose.Schema({
//        announcementTitle           : { type : String, required : false, trim:true },
//        eventDate                   : { type : Date, required : false, trim:true }, //announcementDate
//        announcement                : { type : String, required : false, trim:true },
//        studentConfirmation         : { type : Boolean, default : false, trim:true }, 
//        coming                      : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim:true } ],
//        notComing                   : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim:true } ]
// })
// /******************************** /.Announcement Schema **************************/


// /******************************** Project Schema *****************************/
// const projectWorkGroupSchema      = mongoose.Schema({
//        _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
//        groupTopic                  : { type : String, required : false, trim:true },
//        students                    : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true }  ],
// });

// const projectWorkSchema = mongoose.Schema({
//        projectTitle                : { type : String, required : true, trim:true},
//        subject                     : { type : String, required : false, trim:true },
//        eventDate                   : { type : Date, required : false, trim:true },//dateOfSubmission
//        groupData                   : [ projectWorkGroupSchema ],  
//        completedStudents           : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim:true } ],
//        notCompletedStudents        : [ notCompletedSchema ],
// })
// /******************************** /.Project Schema **************************/


// /********************************** Individual Test Schema ***********************************/

// const individualTestSchema = mongoose.Schema({
//        subject                     : { type : String, required:true, trim : true },
//        chapter                     : { type : String, required:false, trim : true },
//        eventDate                   : { type : Date, required:true, trim : true }, //testDate
// })

// /********************************** ./Individual Test Schema ********************************/


// /********************************** Test Schema ***********************************/

// const testSchema = mongoose.Schema({
       
//        testTitle                   : { type : String, required : false, trim : true }, 
//        testSchedule                : [individualTestSchema],
// })

// /********************************** ./Test Schema ********************************/


// /******************************* Topics Schema *******************************/
// const topicsSchema = mongoose.Schema({
//       topicId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_topics', required : true, trim:true },
//       topicName                   : { type : String, required : true, trim : true }, 
//       videoId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_video', required : false, trim:true },
//       videoName                   : { type : String, required : false, trim : true }, 
//       videoUrl                    : { type : String, required : false, trim : true }
// })

// /******************************** /.End of Topics Schema  ****************************/


// const assignmentSchema = mongoose.Schema({
//        _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
//        // teacherId                   : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:true, trim : true },
//        groupId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_school_or_invidual_teacher_class', required:true, trim : true },//grade and section Id or group name enterd Id
//        sectionType                 : { type : String, required : true, trim : true }, // section name TaughtInClass OR HomeWork OR ProjectWork OR Announcement OR Test
//        // subject                     : { type : String, required : false, trim:true },

//        homeWork                    : [ homeWorkSchema ] ,
//        announcement                : announcementSchema,
//        projectWork                 : projectWorkSchema,
//        test                        : testSchema ,
       
//        topics                      : [topicsSchema],

//        fileUrls                    : [ { type : String, required : false, trim : true } ],//Documents sent saved here
//        additionalInformation       : { type : String, required : false, trim : true }, 


//        /**This column takes all students at the current instance when teacher sends** the assignment.
//         * If new candidate had done some action he/she will also be added and shown in the report 
//         * New Student was added on current day then he/she will automatically got added to this list**/
//        activeStudentIds            : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],


//        /**This column takes all students at the current instance when teacher sends** the assignment.
//         * If new candidate had done some action he/she will also be added and shown in the report 
//         * New Student was added on current day then he/she will automatically got added to this list**/
//        studentsAddedToPortfolio            : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],


       
//        /**Teacher Action Status was recoreded seperatly because group can be transfered to other teacher so 
//          * if we save id then it may become problem when transfered so all teacher actions was recorded seperatly
//        */
//        teacherStared               : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
//        teacherDeleteStatus         : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
//        teacherDeleteAllStatus      : { type : Boolean, default: false }, // 0 - Not deleted , 1-Deleted       
//        cancelStatus                : { type : Boolean, default: false }, // 0 - Not cancelled, 1-Cancelled 

//        /**If Assignment has been updated then the interlinking b/w updated assignment is made with this key */
//        updatedAssignmentId         : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_assignment', required : false, trim : true },
//        updatedAssignmentDate       : { type : Date, required : false, trim : true },

//        /**Previous recored && updated record which was updated will have this flag true so that they could be recognized as updated in assignments*/
//        updatedStatus               : { type : Boolean, default: false }, 

//        /**Previous recored which was updated will have this flag true so that they could be removed in planner*/
//        previousRecord              : { type : Boolean, default: false }, 
       
//        //Both Teahcer and Student Actions 
//        stared                      : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],
//        deleted                     : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],

//        //Student Actions
//        seenStudents                : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true } ],
//        remindedUsers               : [ remindSchema ],

//        /** Date and Time at which record was saved **/
//        savedDateAndTime            : { type : Date, trim : true, default : () => Date.now() + 5.5*60*60*1000 },

//        /** true-Sent, false-Saved i.e it is a scheduled homework. This homework should get confirmation from teacher to send Students **/
//        sentStatus                  : { type : Boolean, default : true },  

//        /** Can Edit Upto Date */
//        upcomingDate                : { type : Date, trim : true },

//        isActive                    : { type : Boolean, default: true }, // 0 - Delete for everyone 1- visible to everyone  

//        /** Date at which homework need to be sent or Sent **/
//        date                        : { type : Date, required : true, default : () => Date.now() + 5.5*60*60*1000, trim:true }
// });

// // schoolSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, cancelStatus : 1, date : 1, deletedStudents : 1 });
// assignmentSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, eventDate: 1, cancelStatus : 1, date : 1, isActive : 1,  deleted : 1   });

// module.exports = mongoose.model('sc_assignment', assignmentSchema);