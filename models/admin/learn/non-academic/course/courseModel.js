const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },

      //  gradeId                     : [ { type : mongoose.Schema.Types.ObjectId, ref : "master_grade", required : true, trim:true } ],  
     
       courseName                  : { type : String, required : true, trim : true },
       searchableCourseName        : { type : String, required : true, trim : true, lowercase:true },
       
       courseImageUrl              : { type : String, required : false, trim : true},
       courseText                  : { type : String, required : false, trim : true},

       courseColor                 : { type : String, required : false, trim : true},
       courseType                  : { type : Number, required : false, trim : true}, //2-aptitude 4-lifeskills

       isPublished                 : { type : Boolean, default : false, trim:true  },
       isActive                    : { type : Boolean, default : true, trim:true  },
       date                        : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

courseSchema.index( { _id : 1, searchableCourseName : 1, isActive: 1 } );

module.exports = mongoose.model('learn_course', courseSchema);