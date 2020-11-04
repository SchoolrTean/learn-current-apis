const mongoose = require('mongoose');

const notificationSchema =  mongoose.Schema({
     /**
      * Auto Generated id by mongoose.
      */
     _id                 : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },


     /**
      *  UserId to which notification has to be sent i.e student UserId
      */
     userId              : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:true, trim:true },



     /**
      *   Notification is sent to multiple Users then this list contains those multiple Users
      */
     sharedUsers        : [{ type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:false, trim:true }],


     /**
      *   This is the groupId of group to which assignment or ask whats in your mind was pushed.
      */
     groupId             : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_teacherGroups', required:false, trim:true  }, //ref belong to model it belongs to


     /**
      *   If Notification could be any of the following
      *   ConnectionId for connection established or deleted or readmited or removed
      *   AssignmentId ofr Assignments
      *   PostId for TIC
      *   ConversationId for Chat 
      */
     transactionId       : { type : mongoose.Schema.Types.ObjectId , required:true, trim:true },


     /**
      *   Assignment section from which notification was pushed
      *   1 - Assignments 
      *   2 - TIC 
      *   3 - Chat Box
      *   4 - learn
      *   7 - Connections
      */
     notificationSection   : { type : Number, required : false, default:0, trim:true },


     /**
      *   Type of notification that was pushed 
      *   1-Normal Notification 2-cancelled Notification only for assignments
      */
     notificationType    : { type : Number, required : false, default: 1, trim:true },



     /**
      *   MessageType  1-single message 2-muliple people 3-All
      */
     messageType         : { type : Number, required : false, trim:true, default : 1, trim:true },



     /**
      *   Message that should be shown to the user
      */
     messageTitle        : { type : String, required : false, trim:true },


     /**
      *   Message that shoule be shown to the user
      */
     message             : { type : String, required : false, trim:true },


     /**
      *   Flag to know wheather user has viewed the cancelled notification
      */
     cancelledNotificationViewStatus       : { type : Boolean, trim: true },


     /**
      *   Users who deleted this notification
      */
     deletedUsers       : [{ type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:false, trim:true }],   


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


module.exports = mongoose.model('sc_notifications', notificationSchema)
