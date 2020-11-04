const mongoose = require('mongoose');

const topicsSchema = mongoose.Schema({
       _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
       gradeId              : { type: mongoose.Schema.Types.ObjectId, ref: "master_grade", required: true, trim: true },
       subjectId            : { type : mongoose.Schema.Types.ObjectId , ref : "master_subject", required:true, trim:true },
       isActive             : { type : Boolean, default: true, trim:true },
       date                 : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

topicsSchema.index( { _id : 1, grade : "text", subjectId : 1, chapterId: 1, searchableTopicName : "text" } );

module.exports = mongoose.model('master_grade_subject',topicsSchema);