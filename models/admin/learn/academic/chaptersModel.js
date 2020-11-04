const mongoose = require('mongoose');

const chapterSchema = mongoose.Schema({
       _id                   : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
       
       syllabusId            : { type : mongoose.Schema.Types.ObjectId, ref : "master_syllabus", required : true, trim:true },
       mediumId              : { type : mongoose.Schema.Types.ObjectId, ref : "master_medim", required : true, trim:true },  
       gradeId               : { type : mongoose.Schema.Types.ObjectId, ref : "master_grade", required : true, trim:true },  
            
       subjectId             : { type : mongoose.Schema.Types.ObjectId, ref : "master_subject", required : true, trim:true }, 
       bookId                : { type : mongoose.Schema.Types.ObjectId, ref : "learn_subject_book", required : true, trim:true }, 
       
       chapterName           : { type : String, required : true, trim : true },
       chapterNumber         : { type : Number, required : true, trim : true },
       searchableChapterName : { type : String, required : true, trim : true, lowercase:true },
       isActive              : { type : Boolean, default : true },
       date                  : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

chapterSchema.index( { _id : 1, bookId : 1, searchableChapterName: 'text' } );// syllabusId : 1,  mediumId : 1,  gradeId : 1,  subjectId : 1,

module.exports = mongoose.model('learn_subject_book_chapter', chapterSchema);