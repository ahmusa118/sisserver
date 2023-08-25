const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema=new Schema({
    name:{
        type: String,
        required: true,
        unique:true
    },
   password:{
    type: String,
        required: true 
   }, 
    email:{
        type: String,
        required: true 
    },
   coursecode:{
        type: String,
       required:true
    },
    level:{
        type: String,
        required:true
    }


})
const TeacherDb = mongoose.model('TeacherDb', teacherSchema)
module.exports = TeacherDb
