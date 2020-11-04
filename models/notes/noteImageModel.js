const mongoose = require('mongoose');

const noteImageSchema =  mongoose.Schema({
      /**Auto Generated id which is used to represent user through out the application */
      _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

      userId                      : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
      noteUrl                    : { type : String, trim : true, required : true },

      isActive                    : { type : Boolean, default: true },
      date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});


noteImageSchema.index( { _id : 1, userId : 1, isActive : 1 } );

module.exports = mongoose.model('note_image_url', noteImageSchema)
