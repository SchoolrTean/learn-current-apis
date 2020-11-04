const mongoose = require('mongoose');


const activityQuizSchema = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      bookId                       : { type : mongoose.Schema.Types.ObjectId, ref : "learn_subject_book", required : true, trim:true },
      chapterId                    : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter', required:true, trim:true},
 
      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following  4-Short Answer Question */
      pageNo                       : { type : Number, required : true, trim:true },

      totalQuestioncount           : { type : Number, required : true, trim:true, default: 0 },

      attemptedUsers               : [ { type : mongoose.Schema.Types.ObjectId, required : true, trim:true } ],

      isPublished                  : { type : Boolean, default: false, trim:true }, 
      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

activityQuizSchema.index( { _id : 1, bookId : 1, chapterId : 1, pageNo :1 } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('learn_academic_activity_quiz', activityQuizSchema);