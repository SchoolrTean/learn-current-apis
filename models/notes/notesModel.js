const mongoose = require('mongoose');

const noteSchema =  mongoose.Schema({
      /**Auto Generated id which is used to represent user through out the application */
      _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      userId                      : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
      
      title                       : { type : String, trim : false, required : true },
      content                     : { type : String, trim : true, required : true },
      color                       : { type : String, trim : true, required : true },
      reminderDate                : { type : Date, trim : true, required : false },

      noteUrls                    : [{ type : String, trim : true, required : true }],
      
      lastSavedDate               : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim : true, required : true },

      isActive                    : { type : Boolean, default: true },
      date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});


noteSchema.index( { _id : 1, userId : 1, lastSavedDate : -1 , isActive : 1 } );

module.exports = mongoose.model('note', noteSchema)
