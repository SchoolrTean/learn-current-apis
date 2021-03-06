const mongoose = require('mongoose');


const exerciseSchema = mongoose.Schema({
       _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       bookId                       : { type : mongoose.Schema.Types.ObjectId, ref : "learn_subject_book", required : true, trim:true },
       chapterId                    : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter', required:true, trim:true},
       topicId                      : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter_topic', required:false, trim:true},

       exerciseName                 : { type : String, required : true, trim:true },
       searchableExerciseName       : { type : String, required : true, trim:true },
       totalExerciseQuestionsCount  : { type : Number, required : true, default:0, trim:true },
       
       isActive                     : { type : Boolean, default: true, trim:true },
       date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

exerciseSchema.index( { _id : 1, bookId : 1, chapterId : 1, topicId :1, searchableExerciseName : "text" } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('learn_academic_exercise', exerciseSchema);