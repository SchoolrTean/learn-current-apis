const mongoose = require('mongoose');

const mediumSchema = mongoose.Schema({
      _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },     
      medium               : { type : String,  required:true , trim:true },
      searchMedium         : { type : String,  required:true , trim:true,  lowercase:true},
      isActive             : { type : Boolean, default: true },//
      date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true },
});

mediumSchema.index( { _id : 1,  searchMedium: 'text' } );

module.exports = mongoose.model('master_medim', mediumSchema);