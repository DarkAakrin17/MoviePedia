const mongoose=require("mongoose")
const username = 'DarkAakrin7';
const password = 'Aakthivi@7';
const host = 'cluster0.fysnarf.mongodb.net';
const database_name = 'flask';

// Escape username and password
const escaped_username = encodeURIComponent(username);
const escaped_password = encodeURIComponent(password);

// Construct the connection string
// const connection_string = `mongodb+srv://${escaped_username}:${escaped_password}@${host}/${database_name}?retryWrites=true&w=majority`;

mongoose.connect(`mongodb+srv://${escaped_username}:${escaped_password}@${host}/${database_name}?retryWrites=true&w=majority`)
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log('failed');
})


const newSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const collection = mongoose.model("users_react",newSchema)

module.exports=collection
