const mongoose = require('mongoose');


const WorkSheetUserAnswerModel = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      assignmentId                 : { type : mongoose.Schema.Types.ObjectId, ref : "sc_assignment", required : true, trim : true },
     
      workSheetId                  : { type : mongoose.Schema.Types.ObjectId , ref : 'schoolr_question_bank_work_sheet_model', required : true, trim : true},
      workSheetQuestionId          : { type : mongoose.Schema.Types.ObjectId , ref : 'schoolr_question_bank_work_sheet_question_model', required : true, trim : true},

      userId                       : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      answer                       : { type : String, required : false, trim:true },
      answerUrls                   : [ { type : String, required : false, trim:true } ],
      
      answeredStatus               : { type : Boolean, default: true, trim:true },
       
      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

WorkSheetUserAnswerModel.index( { _id : 1, assignmentId : 1, workSheetId : 1, workSheetQuestionId : 1, userId : 1, isActive : 1 } );

module.exports = mongoose.model('worksheet_user_answer', WorkSheetUserAnswerModel);