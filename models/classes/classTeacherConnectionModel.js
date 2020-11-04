const mongoose = require('mongoose');

const SchoolTeacherConnectionSchema = mongoose.Schema({
      _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
      schoolId             : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true},
      classId              : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_school_or_invidual_teacher_class', required:true, trim:true},
      teacherId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true},
      subjects             : [ { type : String, required : false, trim:true } ],
      secondLanguages      : [ { type : String, required : false, trim : true } ],
      thirdLanguages       : [ { type : String, required : false, trim : true } ],
      isActive             : { type : Boolean, default: true },
      date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});

module.exports = mongoose.model('schoolr_class_teacher_connection', SchoolTeacherConnectionSchema);