const mongoose = require('mongoose');

const notificationSchema =  mongoose.Schema({
     /**
      * Auto Generated id by mongoose.
      */
     _id                 : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },


     /**
      *   userId- who pushed the notifications
      *   In Assignments this will be teacher userId who done some action on assignments 
      *   In MindBox this will be userId of user who pushed whats there in this mind or triggered some action on it.
      */
     userId              : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_teacher', required:true, trim:true },


     /**
      *   This is the groupId of group to which assignment or ask whats in your mind was pushed.
      */
     groupId             : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_teacherGroups', required:true, trim:true  }, //ref belong to model it belongs to


     /**
      *   If Notification belong to assignment section then SchoolId Or TIC then PostId Or MindBox then QuestionId Or Chat then conversationId Contains id of this section 
      */
     transactionId       : { type : mongoose.Schema.Types.ObjectId , required:true, trim:true },


     /**
      *   Assignment section from which notification was pushed
      *   1-assignments 2-TIC 3-chatBox
      */
     assignmentSection   : { type : Number, required : false, trim:true },


     /**
      *   Message that should be shown to the user
      */
     messageTitle        : { type : String, required : false, trim:true },


     /**
      *   Message that shoule be shown to the user
      */
     message             : { type : String, required : false, trim:true },


     /**
      *   MessageType to get single message shown to multiple people
      */
     messageType         : { type : String, required : false, trim:true },


     /**
      *   Type of notification that was pushed 
      *   1-Normal Notification 2- 3- Transfer Notification
      */
     notificationType    : { type : Number, required : false, default: 1, trim:true },


     /**
      *   Teacher who deleted this notification
      */
     deleted             : { type : Boolean, default: false },   


     /**
      *   True- This Notification is Shown to all
      *   False- This Notification is hided from user point of view usefull if its bad content 
      */
     isActive           : { type : Boolean, default: true },


     /**
      *   Date - Date and time when notification was pushed into database
      */
     date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});


module.exports = mongoose.model('sc_teacher_notifications', notificationSchema)
