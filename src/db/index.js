import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

async function connectDB(){
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log("Mongo Connected");
        console.log(`Host : ${connectionInstance.connection.host}`); // used to know on which conenction you are on cause many servers are there in production like production, testing, development,etc.
        // console.log(connectionInstance);        
    } catch (error) {
        console.log("Dabase connection error : ",error);
        process.exit(1);    
    }
}

export default connectDB;