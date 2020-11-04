const mongoose = require('mongoose');


const courseTopicTestSchema = mongoose.Schema({
       _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       courseId                     : { type : mongoose.Schema.Types.ObjectId, ref : "learn_course", required : true, trim : true },
       courseType                   : { type : Number, required : true, trim:true }, //1-Academinc 2- Aptitude 3-STEAM 4-LifeSkills

       courseTopicName              : { type : String, required : true, trim:true },
       searchableCourseTopicName    : { type : String, required : true, trim:true },

       courseTopicColor             : { type : String, required : false, trim:true },
       courseTopicText              : { type : String, required : false, trim:true },
       courseTopicImageUrl          : { type : String, required : false, trim:true },

       totalQuestionCount           : { type : Number, default:0, required : true, trim:true },

       totalNoofMinutes             : { type : String, default:0, required : true, trim:true },
       
       isPublished                  : { type : Boolean, default : false, trim:true },
       isActive                     : { type : Boolean, default: true, trim:true },
       date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
       
});

courseTopicTestSchema.index( { _id : 1, courseId : 1, courseTopicId : 1, searchableTestName : "text", isActive : 1 } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('learn_course_topic', courseTopicTestSchema);