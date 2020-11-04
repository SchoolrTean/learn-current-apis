const mongoose = require('mongoose');

const testPaperSchema = mongoose.Schema({
      _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
      teacherId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true  },
      classId              : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_school_or_invidual_teacher_class',required:true, trim:true  }, //ref : 'master_grade', 

      // subjectId            : { type : mongoose.Schema.Types.ObjectId, ref : 'master_subject', required:true, trim:true }, 
      subjectName            : { type : String, required:true, trim:true },  //ref : 'master_subject',
      chapterId            : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_school_or_invidual_teacher_class',required:true, trim:true  },
      chapterName          : { type : String,  required : false, trim : true  },

      testPaperTitle       : { type : String, required : true, trim:true },
      instructions         : { type : String, required : true, trim:true },
      // questionCount        : { type : Number, required :false, trim:true },
      questionsIdsAdded    : [ { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_question_bank_work_sheet_question_model', required:true, trim:true  } ],

      isActive             : { type : Boolean, default: true },
      date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});

module.exports = mongoose.model('schoolr_question_bank_work_sheet_model', testPaperSchema);