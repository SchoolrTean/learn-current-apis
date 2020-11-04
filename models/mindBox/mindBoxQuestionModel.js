const mongoose = require('mongoose');

const mindBoxSchema = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
       userId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false },
       groupId                     : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_school_or_invidual_teacher_class', required : true, trim:true },
       subjectName                 : { type : String, required : true, trim:true }, 


       question                    : { type : String, required : false, trim:true },
       questionUrls                : [ { type : String, required : false, trim:true } ],

       
       /****** %-% seperated answer ******/
       multipleChoiceAnswers       : { type : String, required : false, trim:true },
       selectedCorrectAnswer       : { type : Number, required : false, trim:true },

       /******* This is used to save correct doubt answer ******/
       selectedCorrectAnswerId     : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_mind_box_question_answer', required : false, trim:true },
       selectedCorrectAnswerUserId : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false },


       /**1-Multiple Choice Question 2-Short Answer Question 3-doubt**/
       questionType                : { type:Number, required : true, trim:true }, 


       /***** If any user delete doubt he will be inserted into this ******/
       questionDeletedStatus       : { type : Boolean, default: false }, //true - deleted, false - Not Deleted
       questionDeletedByUserId     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', trim:true },
       questionDeletedUserName     : { type : String }, //deleted user Name


       answerCount                 : { type : Number, default: 0, trim:true }, //Active Answers Count
       correctAnswerCount          : { type : Number, default: 0, trim:true }, //Correct Answers Count


       // reportedCount               : { type : Number, default: 0, trim:true },
       reported                    : { type : Boolean, default: false, trim:true },
       teacherUnreported           : { type : Boolean, default: false, trim:true },
       // reportedUsers               : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', trim:true } ],
       likedUsers                  : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', trim:true } ],
       deletedUsers                : [ { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', trim:true } ],
       

       isActive                    : { type : Boolean, default: true, trim:true  },
       date                        : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
});



mindBoxSchema.index( { _id : 1, userId : 1, groupId : 1, subjectName : 1, questiontype :1, reportedCount : 1, deletedUsers : 1, isActive:1, date : 1} );

module.exports = mongoose.model('schoolr_mind_box_question', mindBoxSchema);