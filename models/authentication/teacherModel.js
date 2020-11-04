const mongoose = require('mongoose');

const teacherSchema =  mongoose.Schema({
       /**Auto Generated id which is used to represent this teacher through out the application */
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       /** Mobile No and password of teacher used for authentication*/
       mobileNo                    : { type : Number, required : true, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999 },    
       password                    : { type : String, required : true, trim:true },  
       
       /**Basic Details data representation of teacher*/
       name                        : { type : String, required : true, trim:true },        
       profilePic                  : { type : String, required : false, trim : true },
       emailId                     : { type : String, required : false, trim:true, match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/}, // unique: true,
       notificationId              : { type : String, required : true, trim:true },
       
       /**School Details of teacher*/
       schoolName                  : { type : String, required : false, trim:true },
       schoolBranch                : { type : String, required : false, trim:true },
       schoolLocation              : { type : String, required : false, trim:true },

       /**Module Dependencies */
       mindBoxOpendTimestamp       : { type : Date, required : false, trim:true },
       chatOnlineStatus            : { type : Boolean, default: false },

       /**Last teacher Logged In time */
       lastLogin                   : { type : Date, trim : true},

       isActive                    : { type : Boolean, default: true },
       date                        : { type : Date, default: Date.now }
});


teacherSchema.index( { _id : 1, mobileNo : 1 } );

module.exports = mongoose.model('sc_teacher', teacherSchema)
