const mongoose = require('mongoose');


const testSchema = mongoose.Schema({
       _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       bookId                       : { type : mongoose.Schema.Types.ObjectId, ref : "learn_subject_book", required : true, trim : true },
       chapterId                    : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter', required : true, trim : true},
       topicId                      : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter_topic', required : false, trim : true},

       testName                     : { type : String, required : true, trim:true },
       searchableTestName           : { type : String, required : true, trim:true },

       totalTestQuestionsCount      : { type : Number, default:0, required : true, trim:true },
       
       isActive                     : { type : Boolean, default: true, trim:true },
       date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

testSchema.index( { _id : 1, bookId : 1, chapterId : 1, topicId :1, searchableTestName : "text" } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('learn_academic_test', testSchema);