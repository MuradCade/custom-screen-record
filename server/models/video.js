// this file contains the table that will store the posts
const mongoose = require('mongoose');

// schema is the database build (building the attributes of the pots table )
const schema = mongoose.Schema;
const videoschema = new schema({
        videoplaceholder:{
            type:String,
            required:true,
            unique:true
        },
        videoname:{
            type:String,
            required:true,
            unique:true
        },
        userid:{
            type:String,
            required:true,
            unique:false
        },
        uploaddate:{
            type:Date,
            default:Date.now
        }
});

// expoerting the schema (the name users inside the model is made up name , you can named what you want)
module.exports = mongoose.model('video',videoschema);
