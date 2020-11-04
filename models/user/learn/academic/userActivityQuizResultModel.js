const mongoose = require('mongoose');


const UserAnswerExerciseModel = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      activityQuizId               : { type : mongoose.Schema.Types.ObjectId, ref : "learn_academic_activity_quiz", required : true, trim : true },

      userId                       : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      attemptedQuestions           : { type : String, required : false, trim:true },
       
      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

UserAnswerExerciseModel.index( { _id : 1, bookId : 1, chapterId : 1, topicId : 1, testId : 1, userId : 1 } ); //syllabusId : 1, mediumId : 1, gradeId : 1, subjectId : 1,

module.exports = mongoose.model('learn_academic_activity_quiz_user_result', UserAnswerExerciseModel);