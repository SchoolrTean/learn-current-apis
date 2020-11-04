const mongoose = require('mongoose');


const faqSchema = mongoose.Schema({
       _id                          : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
       
      question                     : { type : String, required : false, trim:true },
      questionUrl                  : { type : String, required : false, trim:true },

      solution                     : { type : String, required : false, trim:true },
      solutionUrls                  : [ { type : String, required : false, trim:true } ],

      isActive                     : { type : Boolean, default: true, trim:true },
      date                         : { type : Date,  default: () => Date.now() + 5.5*60*60*1000 }
});

faqSchema.index( { _id : 1, isActive : true } );

module.exports = mongoose.model('sc_faq', faqSchema);