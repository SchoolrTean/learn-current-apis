const mongoose = require('mongoose');

const partnersSchema = mongoose.Schema({
       _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },     
       partnerName          : { type : String,  required:true , trim:true },
       searchPartnerName    : { type: String, required: true, trim: true },
       partnerEmailId       : { type : String, trim :true },
       password             : { type : String, trim :true  },
       isActive             : { type : Boolean, default: true },
       date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
});

module.exports = mongoose.model('sc_partner',partnersSchema);