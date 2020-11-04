const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },

       syllabusId                  : { type : mongoose.Schema.Types.ObjectId, ref : "master_syllabus", required : true, trim:true },
       mediumId                    : { type : mongoose.Schema.Types.ObjectId, ref : "master_medim", required : true, trim:true },  
       gradeId                     : { type : mongoose.Schema.Types.ObjectId, ref : "master_grade", required : true, trim:true },  
            
       subjectId                   : { type : mongoose.Schema.Types.ObjectId, ref : "master_subject", required : true, trim:true }, 
     
       bookName                    : { type : String, required : true, trim : true },
       searchableBookName          : { type : String, required : true, trim : true, lowercase:true },
       
       bookImageUrl                : { type : String, required : false, trim : true},

       isActive                    : { type : Boolean, default : true },
       date                        : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

bookSchema.index( { _id : 1, syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1, searchableBookName: 'text' } );

module.exports = mongoose.model('learn_subject_book', bookSchema);