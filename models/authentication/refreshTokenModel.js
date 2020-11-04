const mongoose = require('mongoose');

const learnRefreshTokenSchema =  mongoose.Schema({
       /**Auto Generated id which is used to represent user through out the application */
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       
       userId                      : { type : mongoose.Schema.Types.ObjectId, ref: 'learn_user', required : true, trim:true },

       /** Mobile No and password of teacher used for authentication*/
       key                         : { type : String, required : true, trim:true },  
       createdDate                 : { type : Date, default : () => Date.now() + 965.5*60*60*1000, trim:true },
       
       isActive                    : { type : Boolean, default: true },
       date                        : { type : Date, default : () => Date.now() + 5.5*60*60*1000, trim:true }
});


learnRefreshTokenSchema.index( { _id : 1, emailId : 1, mobileNo : 1, isActive : 1 } );

module.exports = mongoose.model('learn_user_refresh_token', learnRefreshTokenSchema)
