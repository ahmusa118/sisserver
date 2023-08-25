const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema=new Schema({
    fullName:{
        type: String,
        required: true
    },
  id:{
    type: Number,
        required: true ,
        unique:true
   }, 
   status:{
        type: String,
        default:'Studying'
       
    },
    images: {
        type: [String],
        validate: {
          validator: function (array) {
            return array.every(item => item.match(/\.(jpg|jpeg|png)$/));
          },
          message: 'Invalid image format. Only JPG, JPEG, and PNG files are allowed.'
        }
      },
      courseSelected:{
        type: String,
        required: true 
    },
    gpa:{
        type:[{
            level:{type:Number},
            gpa:{type:String}
        }]
    },
    count:{type:Number, default:0},
    
    cgpa:{type:Number},
    email:{
        type:String,
        required:true,
        unique:true
    },
    phoneNumber:{type:String, required:true},
    dateOfBirth:{
        type:Date
    },
    level:{type:Number, default:100},
    dateOfRegistration:{type:Date,default: Date.now},
    password:{type:String, required:true},
    paid:{type:String}
    


})
const Student = mongoose.model('Student', studentSchema)
module.exports = Student
