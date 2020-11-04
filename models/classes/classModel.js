const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
        _id             : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
        
        /**School Id is present only for school groups */
        // schoolId         : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required:false, trim:true},
        
        /**School GroupId is to which schooGroupId is this assignment Group belong to*/
        // schoolGroupId    : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_schoolgroup', required:false, trim:true},

        //SchoolId or Individual TeacherId
        createdBy       : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim : true },

        grade           : { type : String, required : false, trim : true },
        gradeId         : { type : mongoose.Schema.Types.ObjectId, ref : 'master_grade', required : true, trim : true },
        section         : { type : String, required : false, trim : true },
        subjects        : [{ type : String, required : false, trim : true }],

        secondLanguages : [{ type : String, required : false, trim : true }],
        thirdLanguages  : [{ type : String, required : false, trim : true }],

        groupName       : { type : String, required : false, trim : true },
        groupPic        : { type : String, required : false, trim : true },
        groupLink       : { type : String, required : true, trim : true },

        coordinator     : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim : true },

        // Transfer Class, Transfer To, Creator is Used By Individual Teachers 
        transferClass   : { type : Boolean, default : false , trim : true},
        transferto      : { type : mongoose.Schema.Types.ObjectId, required : false, trim : true },
        creator         : { type : mongoose.Schema.Types.ObjectId, ref : 'sc_user', required : true, trim : true },

        isActive        : { type: Boolean, default: true, trim: true },
        date            : { type : Date, default: () => Date.now() + 5.5*60*60*1000, trim:true}
});


classSchema.index( { _id : 1, teacherId: 1, groupLink : 1, isActive : 1 } );

module.exports = mongoose.model('schoolr_school_or_invidual_teacher_class', classSchema);