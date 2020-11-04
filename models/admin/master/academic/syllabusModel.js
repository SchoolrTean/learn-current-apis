const mongoose = require('mongoose');

const syllabusSchema = mongoose.Schema({
      _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },     
      syllabus             : { type : String,  required:true , trim:true },
      searchSyllabus       : { type : String,  required:true , trim:true,  lowercase:true},
      isActive             : { type : Boolean, default: true },//
      date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true },
});

syllabusSchema.index( { _id : 1,  searchSyllabus: 'text' } );

module.exports = mongoose.model('master_syllabus', syllabusSchema);