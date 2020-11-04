const mongoose = require('mongoose');

const teacherGroupSubjectSchema = mongoose.Schema({
        _id             : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
        groupId         : { type : mongoose.Schema.Types.ObjectId,ref : 'sc_teacherGroups', required : true, trim : true },
        subjectId       : { type : mongoose.Schema.Types.ObjectId,ref : 'sc_subjects', required : false, trim : true },
        subjectName     : { type : String, required : false, trim : true },
        isActive        : { type: Boolean, default: true, trim: true },
        date            : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true}
});


teacherGroupSubjectSchema.index( { _id : 1, teacherId: 1, groupLink : 1, isActive : 1 } );

module.exports = mongoose.model('sc_teachergroupSubject', teacherGroupSubjectSchema);