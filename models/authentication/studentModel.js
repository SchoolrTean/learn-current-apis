const mongoose = require('mongoose');

const studentSchema =  mongoose.Schema({
       /**Auto Generated id which is used to represent this teacher through out the application */
       _id                         : { type : mongoose.Schema.Types.ObjectId, required : true, trim:true },

       /** Mobile No and password of teacher used for authentication*/
       mobileNo                    : { type : Number, required : true, match:/[2-9]{2}\d{8}/, trim:true, min: 6000000000, max: 9999999999 },    
       password                    : { type : String, required : true, trim:true },  
       
       /**Basic Details data representation of teacher*/
       name                        : { type : String, required : true, trim:true },        
       profilePic                  : { type : String, required : false, trim : true },
       notificationId              : { type : String, required : true, trim:true },
       
       isActive                    : { type : Boolean, default: true },
       date                        : { type : Date, default: Date.now }
});


studentSchema.index( { _id : 1, mobileNo : 1 } );

module.exports = mongoose.model('sc_student', studentSchema)
