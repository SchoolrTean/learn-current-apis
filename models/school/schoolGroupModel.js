const mongoose = require('mongoose');

const schoolGroupSchema = mongoose.Schema({
      _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
      schoolId             : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true},
      gradeId              : { type : mongoose.Schema.Types.ObjectId, ref : 'master_grade', required:true, trim:true },
      grade                : { type : String, required : false, trim:true },
      section              : { type : String, required : false, trim:true },
      coordinator          : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true},
      isActive             : { type : Boolean, default: true },
      date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});

module.exports = mongoose.model('sc_schoolgroup', schoolGroupSchema);