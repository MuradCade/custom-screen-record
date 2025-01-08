const mangoose = require('mongoose');

const connectdb = async()=>{
    try {
        mangoose.set('strictQuery',false);
        const connect  = await mangoose.connect(process.env.MANGODB_URL);
        console.log(`database connected ${connect.connection.host}`);
    } catch (error) {
            console.log(error);
            
    }
}


module.exports = connectdb;