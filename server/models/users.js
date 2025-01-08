// this file contains the table that will store the posts
const mongoose = require('mongoose');

// schema is the database build (building the attributes of the pots table )
const schema = mongoose.Schema;
const userschema = new schema({
        username:{
            type:String,
            required:true,
            unique:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
});

// expoerting the schema (the name users inside the model is made up name , you can named what you want)
module.exports = mongoose.model('Users',userschema);
