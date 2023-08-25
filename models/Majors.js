const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const majorSchema=new Schema({
    courseName:{
        type: String,
        required: true,
        unique:true
    },

    majorType:{
        type: String,
       required:true
    },
    level:{
        type:Number,
        required:true
    },

    departmentName:{
        type: String,
        required:true   
    },
    courseCode:{
        type: String,
        required:true
    }


})
const Majors = mongoose.model('Major', majorSchema)
module.exports = Majors
