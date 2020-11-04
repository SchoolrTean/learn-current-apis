const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
       subjectName                 : { type : String,  required:true , trim:true },
       searchableSubjectName       : { type : String,  required:true , trim:true, lowercase : true},
       addedBy                     : { type : Boolean, default: true }, //1-admin 0-someUserid
       addedByUserId               : { type : mongoose.Schema.Types.ObjectId, ref :"sc_user", required:false , trim:true,}, //user who added it
       isActive                    : { type : Boolean, default: true },//
       date                        : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

subjectSchema.index( { _id : 1,  searchableSubjectName: 'text' } );

module.exports = mongoose.model('master_subject', subjectSchema);