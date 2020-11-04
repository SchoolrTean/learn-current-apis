const mongoose = require('mongoose');


const UserTopicRatingModel = mongoose.Schema({
      _id                           : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      bookId                        : { type : mongoose.Schema.Types.ObjectId, ref : "learn_subject_book", required : true, trim:true },
      chapterId                     : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter', required:false, trim:true},
      topicId                       : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter_topic', required:false, trim:true},

      userId                        : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      ratedPercentage              : { type : String, required : false, trim:true },
      selfAssessmentRating         : [ { type : Number, required : false, trim:true } ],
       
      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

UserTopicRatingModel.index( { _id : 1, bookId : 1, chapterId : 1, topicId : 1, testId : 1, userId : 1 } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('learn_subject_book_chapter_topic_self_access', UserTopicRatingModel);