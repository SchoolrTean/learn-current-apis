const mongoose = require('mongoose');


const testPaperSchema = mongoose.Schema({
       _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
      
      syllabusId                    : { type : mongoose.Schema.Types.ObjectId, ref : "master_syllabus", required : true, trim : true },
      mediumId                      : { type : mongoose.Schema.Types.ObjectId, ref : "master_medim", required : true, trim : true },
      gradeId                       : { type : mongoose.Schema.Types.ObjectId, ref : "master_grade", required : true, trim : true } ,
      subjectId                     : { type : mongoose.Schema.Types.ObjectId, ref : "master_subject", required : true, trim : true } ,

      testPaperYear                 : { type : Number, required : true, trim:true },

      testPaperUrls                 : [ { type : String, required : true, trim:true } ],

      isActive                      : { type : Boolean, default: true, trim:true },
      date                          : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

testPaperSchema.index( { _id : 1, syllabusId : 1, mediumId :1, gradeId :1, subjectId :1, testPaperYear : -1, isActive : 1 } );

module.exports = mongoose.model('learn_academic_test_paper', testPaperSchema);