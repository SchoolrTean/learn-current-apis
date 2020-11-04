const mongoose = require('mongoose');


// const subQuestionSchema ={
//       _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

//       /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Match the Following  4-Short Answer Question */
//       questionType                 : { type : Number, required : true, trim:true },     
//       questionNo                   : { type : String, required : false, trim:true }, //Question or Section Number

//       question                     : [ { type : String, required : false, trim:true } ], //Section Text or Main Question with Sub Questions
//       questionUrls                 : [ { type : String, required : false, trim:true } ], //Main Question with urls or section urls

//       options                       : [ { type : String, required : false, trim:true } ],
//       answer                        : { type : String, required : false, trim:true },
//       answerUrls                    : [ { type : String, required : false, trim:true } ],

//       isActive                     : { type : Boolean, default: true, trim:true },
//       date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
// }



const exerciseQuestionSchema = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      teacherId                    : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true  },
      classId                      : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_school_or_invidual_teacher_class',required:true, trim:true  }, //ref : 'master_grade', 
      // subjectId                    : { type : mongoose.Schema.Types.ObjectId, ref : 'master_subject', required:true, trim:true  }, 
      subjectName                  : { type : String,  required:true, trim:true  },
      chapterName                  : { type : String,  required:true, trim:true  },
      
      /** 1-Multiple Choice Questions 2-Fill In The Blanks 3-Short Answer Question 4-Match the Following   */
      questionType                 : { type : Number, required : true, trim:true },     

      question                     : { type : String, required : false, trim:true }, 
      questionUrls                 : [ { type : String, required : false, trim:true } ],

      options                      : [ { type : String, required : false, trim:true } ], //Fill in the blanks answers or MCQ Options
      answer                       : { type : String, required : false, trim:true },
      // answerUrls                   : [ { type : String, required : false, trim:true } ],
      
      marks                        : { type : Number, required : true, trim:true }, 

    //   subQuestions                 : [subQuestionSchema],

      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

exerciseQuestionSchema.index( { _id : 1, teacherId : 1, classId : 1, subjectName :1, chapterName : 1, questionType : 1 } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('schoolr_question_bank_test_paper_question_model', exerciseQuestionSchema);
