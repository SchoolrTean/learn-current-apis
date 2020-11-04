const mongoose = require('mongoose');

const transferGroupSchema = mongoose.Schema({
        _id                   : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
        groupId               : { type : mongoose.Schema.Types.ObjectId,ref : 'sc_teacherGroups', required : true, trim : true },
        fromTeacherId         : { type : mongoose.Schema.Types.ObjectId,ref : 'sc_teacher', required : true, trim : true },
        toTeacherId           : { type : mongoose.Schema.Types.ObjectId,ref : 'sc_teacher', required : false, trim : true },
        toMobileNo            : { type : Number, required : true, trim : true },
        currentlyAt           : { type : mongoose.Schema.Types.ObjectId,ref : 'sc_teacher', required : false, trim : true },
        urlCode               : { type : String, required : false, trim : true },
        status                : { type : Number, default : true, trim : true }, // 1-transfer Initiated 2-transferred 
        isActive              : { type : Boolean, default : true , trim : true},
        date                  : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true }
});


transferGroupSchema.index( { _id : 1, groupId: 1, createdByTeacherId : 1, fromTeacherId : 1, toTeacherId : 1, toMobileNo : 1, currentlyAt : 1, status : 1, isActive : 1, date : 1 } );

module.exports = mongoose.model('schoolr_transfer_class', transferGroupSchema);