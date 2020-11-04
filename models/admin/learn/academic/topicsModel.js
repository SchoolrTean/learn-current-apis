const mongoose = require('mongoose');

const topicsSchema = mongoose.Schema({
       _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       syllabusId           : { type : mongoose.Schema.Types.ObjectId, ref : "master_syllabus", required : false, trim:true },
       mediumId             : { type : mongoose.Schema.Types.ObjectId, ref : "master_medim", required : false, trim:true },
       gradeId              : { type: mongoose.Schema.Types.ObjectId, ref: "master_grade", required: false, trim: true },

       subjectId            : { type : mongoose.Schema.Types.ObjectId , ref : "master_subject", required:false, trim:true },
       bookId               : { type : mongoose.Schema.Types.ObjectId, ref : "learn_subject_book", required : false, trim:true },
       chapterId            : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter', required:false, trim:true},

       topicName            : { type : String, required : true, trim:true },
       searchableTopicName  : { type : String, required : true, trim:true },
       ncertChapterUrl      : { type : String, required : false, trim:true },
       pageNo               : { type : String, required : false, trim:true },
       videosExists         : { type : Boolean, default: false, trim:true },
       
       topicImageUrl        : { type : String, required : false, trim:true },
       topicColor           : { type : String, required : false, trim:true },
       topicText            : { type : String, required : false, trim:true },

       isPublished          : { type : Boolean, default: false, trim:true },
       isActive             : { type : Boolean, default: true, trim:true },
       date                 : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

topicsSchema.index( { _id : 1, bookId : 1, chapterId : 1, courseId : 1, courseType : 1, searchableTopicName : "text" } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('learn_subject_book_chapter_topic', topicsSchema);