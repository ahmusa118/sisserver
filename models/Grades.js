const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gradeSchema=new Schema({
 
  id:{
    type: Number,
        required: true 
   },
      courseCode:{
        type: String,
        required: true 
    },
    level:{
        type:Number}
        ,
    grade:{type:String, default :'IP'},
    courseName:{
        type: String,
        required: true 
    }
    


})
const Grades = mongoose.model('Grades', gradeSchema)
module.exports = Grades

