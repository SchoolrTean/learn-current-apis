const mongoose = require('mongoose');

const studentTeacherConnectionSchema = mongoose.Schema({
       _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
       schoolId             : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim : true  }, 
       classId              : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_school_or_invidual_teacher_class', required:true, trim:true}, 
       studentId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true  }, 

       firstName            : { type : String, required : false, trim:true }, 
       surName              : { type : String, required : false, trim:true }, 
       mobileNo             : { type : Number, required : false, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999 },    
       emailId              : { type : String, required : false},
       
       subjects             : [ { type : String, required : false, trim:true } ],
       secondLanguage       : { type : String, required : false, trim:true }, 
       thirdLanguage        : { type : String, required : false, trim:true },

       teacherIds           : [ { type : String, required : false, trim:true } ],

       admissionNumber      : { type : String, required : false},
       connectionStatus     : { type : Number, default : 1, required : true, trim:true }, //1-Join Request sent 2-Student Joined 3-Teacher Disconnect Student 4-Student Disconnect 5- Teacher Cancelled Join Request

       isActive             : { type : Boolean, default: true },
       // joinedDate           : { type : Date, trim :true },
       date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});

module.exports = mongoose.model('schoolr_class_student_connection', studentTeacherConnectionSchema);



/************************************************** Student Actions *******************************************/
/**
 * This flag has been set to **true if teacher has cancelled assignment to notify student with a dot on cancelled notifications
 * **false if nothing has been cancelled or after user clicks on cancelled notifications when notified
 */
// cancelledDot         : { type : Boolean, default : false, required : true, trim:true },

/** This is used for school groups if group disapper later it should be active for assignments and hidden for chat*/
// activeStatus         : { type : Boolean, default: true },

// /**
//  * This flag has been set to **true if teacher has pushed some assignment to notify student with a dot in assignements all groups section
//  * **false if nothing has been pushed or after user clicks particular group and enters inside of it
//  */
// newDot               : { type : Boolean, default : false, required : true, trim:true },
// assignmentPoints     : { type : Number, required : false, trim:true },

// /**
//  * This contains last messageId which exists when the chat was opened by clicking on it
//  */
// lastChatMessageIdSeen: { type : mongoose.Schema.Types.ObjectId, ref : 'sc_chatmessages', required : false, trim:true },