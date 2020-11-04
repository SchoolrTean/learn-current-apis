const mongoose = require('mongoose');

const mindBoxAnswerSchema = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },  
       questionId                  : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_doubtBox', required:false },
       subjectName                 : { type : String, required: false, trim: true},
       
       answeredUserId              : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true },
       answer                      : { type : String, required: false, trim: true } ,
       answerUrls                  : [ { type : String, required: false, trim:true } ] ,

       correctAnswerStatus         : { type : Boolean, default: false, trim: true} ,//Answered by student is correct answer or not

       answerEditedStatus          : { type : Boolean, default: false, trim: true}, //true - deleted, false - Not Deleted       
       answerDeletedStatus         : { type : Boolean, default: false, trim: true}, //true - deleted, false - Not Deleted
       answerDeletedByUserId       : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', trim:true }, //user Id
       
       teacherSeenStatus           : { type : Boolean, default: false, trim: true}, //Seen Status - false - teacher Not read, true- teacher Seen
       teacherAnsweredStatus       : { type : Boolean, default: false, trim: true }, //if teacher had answered this question then its true
       
       // reportedCount               : { type : Number, default: 0, trim:true },
       // teacherUnreported           : { type : Boolean, default: false, trim:true },
       // reportedUsers               : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', trim:true } ],
       reported                    : { type : Boolean, default: false, trim:true },
       teacherUnreported           : { type : Boolean, default: false, trim:true },

       likedUsers                  : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', trim:true } ],
       deletedUsers                : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', trim:true } ],

       isActive                    : { type : Boolean, default: true, trim: true },
       date                        : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
})

mindBoxAnswerSchema.index( { _id : 1, questionId : 1, answeredUserId : 1, answerDeleted : 1, date : 1, isActive : 1} );

module.exports = mongoose.model('schoolr_mind_box_question_answer', mindBoxAnswerSchema);