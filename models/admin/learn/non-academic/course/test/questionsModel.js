const mongoose = require('mongoose');



const courseTopicTestQuestionSchema = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      courseId                     : { type : mongoose.Schema.Types.ObjectId, ref : "learn_course", required : true, trim : true },
      courseTopicId                : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_course_topic', required : false, trim : true},

      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following */
      questionType                 : { type : Number, required : true, trim:true },       
      
      paragraph                    : [ { type : String, required : false, trim:true } ],
      paragraphUrl                 : { type : String, required : false, trim:true },

      question                     : { type : String, required : false, trim:true },
      questionUrls                 : [ { type : String, required : false, trim:true } ],

      options                      : [ { type : String, required : false, trim:true } ],
      answer                       : { type : String, required : false, trim:true },
      
      explanation                  : { type : String, required : false, trim:true },
      explanationUrl               : { type : String, required : false, trim:true },

      // subQuestions                 : [subQuestionSchema],

      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});



courseTopicTestQuestionSchema.index( { _id : 1, courseId : 1, courseTopicId : 1, questionType : 1, isActive : 1, date : 1 } );

module.exports = mongoose.model('learn_course_topic_test_question', courseTopicTestQuestionSchema);



// const subQuestionSchema ={
//       _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

//       /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following */
//       questionType                 : { type : Number, required : true, trim:true },     
//       questionNo                   : { type : String, required : false, trim:true }, //Question or Section Number

//       question                     : [ { type : String, required : false, trim:true } ], //Section Text or Main Question with Sub Questions
//       questionUrls                 : [ { type : String, required : false, trim:true } ], //Main Question with urls or section urls

//       options                       : [ { type : String, required : false, trim:true } ],
//       answer                        : { type : String, required : false, trim:true },

//       explanation                  : { type : String, required : false, trim:true },
//       explanationUrl               : { type : String, required : false, trim:true },

//       isActive                     : { type : Boolean, default: true, trim:true },
//       date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
// }
