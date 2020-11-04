const mongoose = require('mongoose');


const UserAnswerExerciseModel = mongoose.Schema({
      _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      courseId                     : { type : mongoose.Schema.Types.ObjectId, ref : "learn_course", required : true, trim : true },
      courseTopicId                : { type : mongoose.Schema.Types.ObjectId , ref : 'learn_course_topic', required : false, trim : true},

      userId                       : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      correctAnswerPercentage      : { type : String, required : false, trim:true },
      wrongAnswersPercentage       : { type : String, required : false, trim:true },

      latestFlag                   : { type : Boolean, default: true, trim:true },
       
      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

UserAnswerExerciseModel.index( { _id : 1, userId : 1, courseId : 1, courseTopicId : 1, latestFlag : 1 } );

module.exports = mongoose.model('learn_aptitude_user_test_result', UserAnswerExerciseModel);