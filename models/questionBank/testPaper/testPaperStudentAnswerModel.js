const mongoose = require('mongoose');


const TestPaperAnswerModel = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      assignmentId                 : { type : mongoose.Schema.Types.ObjectId, ref : "sc_assignment", required : true, trim : true },
     
      testPaperId                  : { type : mongoose.Schema.Types.ObjectId , ref : 'schoolr_question_bank_test_paper_model', required : true, trim : true},
      testPaperQuestionId          : { type : mongoose.Schema.Types.ObjectId , ref : 'schoolr_question_bank_test_paper_question_model', required : true, trim : true},

      userId                       : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      answer                       : { type : String, required : false, trim:true },
      answerUrls                   : [ { type : String, required : false, trim:true } ],
      
      answeredStatus               : { type : Boolean, default: true, trim:true },
       
      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

TestPaperAnswerModel.index( { _id : 1, assignmentId : 1, testPaperId : 1, testPaperQuestionId : 1, userId : 1, isActive : 1 } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('test_papaer_user_answer', TestPaperAnswerModel);