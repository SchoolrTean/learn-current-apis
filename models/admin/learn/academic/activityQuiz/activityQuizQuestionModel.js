const mongoose = require('mongoose');



const subQuestionSchema ={
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following */
      questionType                 : { type : Number, required : true, trim:true },     
      questionNo                   : { type : Number, required : false, trim:true }, //Question or Section Number

      question                     : [ { type : String, required : false, trim:true } ], //Section Text or Main Question with Sub Questions
      questionUrls                 : [ { type : String, required : false, trim:true } ], //Main Question with urls or section urls

      options                       : [ { type : String, required : false, trim:true } ],
      answer                        : { type : String, required : false, trim:true },
      answerUrls                    : [ { type : String, required : false, trim:true } ],

      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
}



const activityQuizQuestionSchema = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      activityQuizId               : { type : mongoose.Schema.Types.ObjectId, ref : "learn_academic_activity_quiz", required : true, trim : true },

      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following 5- paragraph or main Question */
      questionType                 : { type : Number, required : true, trim:true },     
      questionNo                   : { type : String, required : false, trim:true }, //Question or Section Number

      question                     : [ { type : String, required : false, trim:true } ], //Section Text or Main Question with Sub Questions
      questionUrls                 : [ { type : String, required : false, trim:true } ], //Main Question with urls or section urls

      options                      : [ { type : String, required : false, trim:true } ],
      answer                       : { type : String, required : false, trim:true },
      answerUrls                   : [ { type : String, required : false, trim:true } ],

      subQuestions                 : [subQuestionSchema],

      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

activityQuizQuestionSchema.index( { _id : 1, activityQuizId : 1 } );

module.exports = mongoose.model('learn_academic_activity_quiz_question', activityQuizQuestionSchema);
