const mongoose = require('mongoose');

const gradeSchema = mongoose.Schema({
       _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },     
       grade                : { type : String,  required:true , trim:true },
       searchGrade          : { type : String,  required:true , trim:true,  lowercase:true},
       isActive             : { type : Boolean, default: true },//
       date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true },
});

gradeSchema.index( { _id : 1,  searchGrade: 'text' } );

module.exports = mongoose.model('master_grade', gradeSchema);