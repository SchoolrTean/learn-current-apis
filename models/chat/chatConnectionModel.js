const mongoose = require('mongoose');

const StudentTeacherChatConnectionSchema = mongoose.Schema({
       _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },

       roomId               : {  type : mongoose.Schema.Types.ObjectId, required:false, trim:true },
       connectionType       : { type : Number, required:false, trim:true }, //1-One To One Connection 2-One To Many Connection i.e Group 3-Read Only Group Connection

       initiatorUserId      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim : true}, 
       receiverUserId       : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : false, trim:true}, 

       groupName            : { type : String, required:false, trim:true},
       groupPic             : { type : String, required:false, trim:true},
       groupUserIds         : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true} ],
       groupAdmins          : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true} ], //Creator of group is by default group admin
       // relationId           : { type : mongoose.Schema.Types.ObjectId, required:false, trim:true }, //ClassId Assigned to teacher or Project Student GroupId

       lastMessageId        : {  type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_chat_messages', required:false, trim:true },
       lastMessageDate      : {  type : Date, required:false, trim:true },

       newMessageCount      : { type : Number, default: 0,  required:false, trim:true },
       newMailCount         : { type : Number, default: 0,  required:false, trim:true },

       deleteStatus         : { type : Boolean, default: false },
       isActive             : { type : Boolean, default: true },
       
       date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});

StudentTeacherChatConnectionSchema.index({ _id : 1, roomId : 1, connectionType : 1, initiatorUserId : 1, receiverUserId : 1, lastMessageDate : -1, deleteStatus : 1, isActive : 1});

module.exports = mongoose.model('schoolr_chat_connection', StudentTeacherChatConnectionSchema);


// const StudentTeacherChatConnectionSchema = mongoose.Schema({
//        _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

//        studentId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true  }, 
//        teacherId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true  }, 


//        groupId              : [{ type : mongoose.Schema.Types.ObjectId, ref : 'sc_teacherGroups', required:true, trim:true}],

//        /**
//         * This contains last messageId which exists when the chat was opened by clicking on it
//         */
//        studentLastMessageId        : {  type : mongoose.Schema.Types.ObjectId, ref : 'sc_chatmessages', required:false, trim:true },
//        teacherLastMessageId        : {  type : mongoose.Schema.Types.ObjectId, ref : 'sc_chatmessages', required:false, trim:true },

//        isActive             : { type : Boolean, default: true },

//        date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
// });