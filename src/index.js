import dotenv from "dotenv"
dotenv.config({
    path : './.env',
    // debug : true,
    override : true
})

import connectDB from "./db/index.js"
import {app} from "./app.js"

const port = process.env.PORT || 8000;

// temp cause no internet so database will not be connected
// app.listen(port, ()=>{
//     console.log("Server is live on port : ",port);
// })

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Error before listing to port");
        throw error
    })
    app.listen(port ,  ()=>{
    console.log("Server is listing on port : ",port);   
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed error!! ",err);
    
})



/*
import express from "express"
const app = express();

;( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("erorr",(err)=>{
            console.log(err);
            throw err
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`Server is listning on the port : ${process.env.PORT}`);
            
        })
    }catch(err){
        console.log(err);
        throw err
    }
})()

*/