const mongoose = require('mongoose');


const studentHomeWorkSubmissionRating = mongoose.Schema({
       _id                                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
       studentId                            : { type : mongoose.Schema.Types.ObjectId , ref : 'sc_user', required:true, trim : true },
       subject                              : { type : String, required : false, trim:true },
       assignmentId                         : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_assignment', required:true, trim : true },
       
       projectGroupId                       : { type : mongoose.Schema.Types.ObjectId,  required : false, trim:true }, //ref : 'schoolr_question_bank_work_sheet_model',

       fileUrl                              : { type : String, required : false, trim : true },
       exerciseId                           : { type : mongoose.Schema.Types.ObjectId, ref : 'learn_academic_exercise', required : false, trim:true },
       workSheetId                          : { type : mongoose.Schema.Types.ObjectId, ref : 'schoolr_question_bank_work_sheet_model', required : false, trim:true },

       submitAssignmentInClass              : { type : Boolean, required : false, trim : true }, 

       howCompleteWereTheAnswers            : { type : Number, required : false, trim : true },
       howWellStudentUnderstandConcept      : { type : Number, required : false, trim : true },
       
       doYouThinkStudentNeedExtraRevision   : { type : Boolean, required: false, default: false, trim: true },
       
       rating                               : { type : Number, required : false, trim : true }, 

       submitted                            : { type : Boolean, default: false },
       isActive                             : { type : Boolean, default: true }, // 0 - Delete for everyone 1- visible to everyone  

       /** Date at which homework need to be sent or Sent **/
       date                         : { type : Date, required : true, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});

// schoolSchema.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, cancelStatus : 1, date : 1, deletedStudents : 1 });
studentHomeWorkSubmissionRating.index({ _id : 1, teacherId : 1, groupId : 1, sectionType : 1, eventDate: 1, cancelStatus : 1, date : 1, isActive : 1,  deleted : 1   });

module.exports = mongoose.model('schoolr_student_homework_submitted_rating', studentHomeWorkSubmissionRating);