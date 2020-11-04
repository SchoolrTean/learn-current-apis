const mongoose = require('mongoose');

const personalEventSchema = mongoose.Schema({
      _id                  : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },
      userId               : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:true, trim:true  },
      eventStartTimestamp  : { type : Date, required:true, trim:true  },
      eventEndTimestamp    : { type : Date, required:true, trim:true  },
      title                : { type : String, required : true, trim:true },
      body                 : { type : String, required : true, trim:true },
      fileUrls             : [ { type : String, required : true, trim:true } ],
      reminder             : { type : Date, required : false, trim:true },
      reminderNote         : { type : String, required : false, trim:true },
      isActive             : { type : Boolean, default: true },
      date                 : { type : Date, default: () => Date.now() + 5.5*60*60*1000 }
});

module.exports = mongoose.model('schoolr_calendar_personal_events', personalEventSchema);