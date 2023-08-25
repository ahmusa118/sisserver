const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema=new Schema({
    name:{
        type: String,
        required: true,
        unique:true
    },
   departmentId:{
    type: Number,
        required: true 
   }, 
    price:{
        type: Number,
        required: true 
    },
    departmentType:{
        type: String,
       required:true
    },
    


})
const Department = mongoose.model('Department', departmentSchema)
module.exports = Department
