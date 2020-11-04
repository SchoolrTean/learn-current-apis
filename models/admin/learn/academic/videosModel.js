const mongoose = require('mongoose');

const videosSchema = mongoose.Schema({
       _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },       
       gradeId              : { type: mongoose.Schema.Types.ObjectId, ref: "master_grade", required: true, trim: true },
       //sectionId            : { type : mongoose.Schema.Types.ObjectId, ref : "sc_appsection", default : "5cd2a3912358182d302fe6e2" , required : true, trim:true  },
       subjectId            : { type : mongoose.Schema.Types.ObjectId , ref : "master_subject", required:true, trim:true },
       // chapterId            : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter', required:true, trim:true},
       topicId              : { type : mongoose.Schema.Types.ObjectId,ref : "learn_subject_book_chapter_topic", required : true, trim :true},
       partnerId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_partner', required:false, trim:true },
       videoTitle           : { type : String, required : true, trim:true },
       searchTitle          : { type : String, required : true, trim:true, lowercase: true },
       videoUrl             : { type : String, required : true, trim:true },
       videoDuration        : { type : String, required : false, trim:true },
       videoViews           : { type : String, required : false, trim:true },
       prioprity            : { type : Number, required : false, trim:true }, //top 3 will be choosen by us to display
       subscription         : { type : Boolean, required : true, trim:true, default: false },
       isActive             : { type : Boolean, default: true },
       date                 : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

videosSchema.index( { _id : 1, grade :"text", subjectId : 1, chapterId : 1,  topicId : 1 , partnerId : 1, searchTitle : "text", videoUrl: "text" } );

module.exports = mongoose.model('learn_subject_book_chapter_topic_video',videosSchema);