const mongoose = require('mongoose');



const subQuestionSchema ={
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following */
      questionType                 : { type : Number, required : true, trim:true },     
      questionNo                   : { type : String, required : false, trim:true }, //Question or Section Number

      question                     : [ { type : String, required : false, trim:true } ], //Section Text or Main Question with Sub Questions
      questionUrls                 : [ { type : String, required : false, trim:true } ], //Main Question with urls or section urls

      options                       : [ { type : String, required : false, trim:true } ],
      answer                        : { type : String, required : false, trim:true },
      answerUrls                    : [ { type : String, required : false, trim:true } ],

      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
}



const testQuestionSchema = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      bookId                       : { type : mongoose.Schema.Types.ObjectId, ref : "learn_subject_book", required : true, trim : true },
      chapterId                    : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter', required : true, trim : true},
      topicId                      : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter_topic', required : false, trim : true},
      
      testId                   : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_academic_test', required : false, trim : true},

      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following 5- paragraph or main Question */
      questionType                 : { type : Number, required : true, trim:true },     
      questionNo                   : { type : Number, required : false, trim:true }, //Question or Section Number

      question                     : [ { type : String, required : false, trim:true } ], //Section Text or Main Question with Sub Questions
      questionUrls                 : [ { type : String, required : false, trim:true } ], //Main Question with urls or section urls

      options                      : [ { type : String, required : false, trim:true } ],
      answer                       : { type : String, required : false, trim:true },
      answerUrls                   : [ { type : String, required : false, trim:true } ],

      subQuestions                 : [subQuestionSchema],

      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

testQuestionSchema.index( { _id : 1, bookId : 1, chapterId : 1, topicId :1, testId : 1 } );

module.exports = mongoose.model('learn_academic_test_question', testQuestionSchema);
