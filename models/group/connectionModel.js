const mongoose = require('mongoose');

const studentTeacherConnectionSchema = mongoose.Schema({
       _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
       studentId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true  }, 
       teacherId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true  }, 
       groupId              : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_teacherGroups', required:true, trim:true}, 
       studentMobileNo      : { type : Number, required:false, trim:true },
       connectionStatus     : { type : Number, default : 1, required : true, trim:true }, //1-Join Request sent 2-Student Joined 3-Teacher Disconnect Student 4-Student Disconnect 5- Teacher Cancelled Join Request

       /************************************************** Student Actions *******************************************/
       /**
        * This flag has been set to **true if teacher has cancelled assignment to notify student with a dot on cancelled notifications
        * **false if nothing has been cancelled or after user clicks on cancelled notifications when notified
        */
       cancelledDot         : { type : Boolean, default : false, required : true, trim:true },

       /** This is used for school groups if group disapper later it should be active for assignments and hidden for chat*/
       activeStatus         : { type : Boolean, default: true },

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

       isActive             : { type : Boolean, default: true },
       // joinedDate           : { type : Date, trim :true },
       date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});

module.exports = mongoose.model('sc_connection', studentTeacherConnectionSchema);