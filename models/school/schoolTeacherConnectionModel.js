const mongoose = require('mongoose');

const SchoolTeacherConnectionSchema = mongoose.Schema({
      _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
      schoolId             : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true},
      teacherId            : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true},
      firstName            : { type : String, required : false, trim:true }, 
      surName              : { type : String, required : false, trim:true },  
      mobileNo             : { type : Number, required : false, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999 },    
      emailId              : { type : String, required : false},    
      connectionStatus     : { type : Boolean, required : true, trim:true }, //0-Not invited 1-Invited
      isActive             : { type : Boolean, default: true },
      date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});

module.exports = mongoose.model('sc_schoolteacherconnection', SchoolTeacherConnectionSchema);