const mongoose = require('mongoose');


/************************************************* Announcements ************************************************/

const chatSchema     = mongoose.Schema({   
            _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true }, 

            /**Student/ Teacher who had sent the message */
            userId                      : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:false, trim:true },

            /**Conversation Id b/w 2 users */
            roomId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_chat_connection', required:true, trim:true },
            
            /** Reply for the Message Exists */
            replyId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_chat_messages', required : false, trim:true },
            replyUserId                 : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:false, trim:true },

            
            /**Clarify Assignment*/
            assignmentSchoolId          : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_assignment', required : false, trim:true },
            

            /** Message sent by the user */
            message                     : { type : String, required : false, trim:true },
            messageType                 : { type : Number, required : true, trim:true, default : 1 },// 1-message 2-image 3-leave letter 4-School Assignment 5-audio

            /** File Urls or Leave letter pdf urls */
            urls                        : [ { type : String, required : false, trim:true } ],//file Urls

            /** If it was an video or audio then its timeing will be saved and sent */
            fileTiming                  : { type : String, required : false, trim:true }, //file Urls

            deleteAllStatus             : { type : Boolean, default: false },// if user deleted this message then it becomes true
            seenStatus                  : { type : Boolean, default: false },// It get effected if other user had seen the message or not
            seenUsers                   : [ { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:false, trim:true } ],// It get effected if other user had seen the message or not

            deletedUsers                : [ { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:false, trim:true } ],

            isActive                    : { type : Boolean, default: true },// is Active or deleted and should be removed
            date                        : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true },

});

/************************************************* ./Announcements ************************************************/


chatSchema.index({ _id : 1, userId : 1, userTypeId : 1, groupId : 1, messageType : 1, IndividualUserId : 1, isActive : 1, deletedUsers : 1, date :1 });

module.exports = mongoose.model('schoolr_chat_messages', chatSchema);