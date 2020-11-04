const mongoose = require('mongoose');


const subQuestionSchema ={
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following  4-Short Answer Question */
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



const exerciseQuestionSchema = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      bookId                       : { type : mongoose.Schema.Types.ObjectId, ref : "learn_subject_book", required : true, trim : true },
      chapterId                    : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter', required : true, trim : true},
      topicId                      : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_subject_book_chapter_topic', required : false, trim : true},

      exerciseId                   : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_academic_exercise', required : false, trim : true},

      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following  4-Short Answer Question 5- paragraph or main Question */
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

exerciseQuestionSchema.index( { _id : 1, bookId : 1, chapterId : 1, topicId :1, exerciseId : 1 } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('learn_academic_exercise_question', exerciseQuestionSchema);




// const shortQuestionSchema = {
//       question                      : { type : String, required : false, trim:true },
//       questionNo                    : { type : String, required : false, trim:true },
//       questionUrls                  : [ { type : String, required : false, trim:true } ],

//       answer                        : { type : String, required : false, trim:true },
//       answerUrls                    : [ { type : String, required : false, trim:true } ]
// }

// const fillInTheBlanksSchema = {
//       question                      : { type : String, required : false, trim:true },
//       questionNo                    : { type : String, required : false, trim:true },
//       questionUrls                  : [ { type : String, required : false, trim:true } ],

//       blankSentances                : [ { type : String, required : true, trim:true } ],
//       blankAtStart                  : { type : Boolean, default: false, trim:true },
//       blankAtEnd                    : { type : Boolean, default: false, trim:true },
//       answers                       : [ { type : String, required : false, trim:true } ],
//       answerUrls                    : [ { type : String, required : false, trim:true } ]
// }


// const matchTheFollowingSchema = {
//       question                      : { type : String, required : false, trim:true },
//       questionNo                    : { type : String, required : false, trim:true },
//       questionUrls                  : [ { type : String, required : false, trim:true } ],

//       matchSetA                     : [ { type : String, required : true, trim:true } ],
//       matchSetB                     : [ { type : String, required : true, trim:true } ],
//       answerMapping                 : [ { type : String, required : true, trim:true } ] //1-2 match set A map with 2 element of match set B
// }

// const multipleChoiceQuestionSchema = {
//       question                      : { type : String, required : false, trim:true },
//       questionNo                    : { type : String, required : false, trim:true },
//       questionUrls                  : [ { type : String, required : false, trim:true } ],

//       options                       : [ { type : String, required : true, trim:true } ],
//       answer                        : { type : Number, required : true, trim:true }
// }