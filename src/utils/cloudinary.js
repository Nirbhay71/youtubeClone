import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

const uploadOnCloudinary = async (locatFilePath)=>{
    cloudinary.config({
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        api_key : process.env.CLOUDINARY_API_KEY,
        api_secret : process.env.CLOUDINARY_API_SECRET
    });

    try {
        if(!locatFilePath) return null
        //upload file on cloudinary
        const responce = await cloudinary.uploader.upload(locatFilePath, {
            resource_type : "auto"
        })

        // file uploaded successfull
        console.log("File uploaded", responce.url)
        fs.unlinkSync(locatFilePath)
        return responce
    } catch (error) {
        // This Unliinking is importanttttttttttttttttttttttttttt
        fs.unlinkSync(locatFilePath)  // remove the locally saved temp file as upload failed 
        return null;
    }
}

export {uploadOnCloudinary}


// import {v2 as cloudinary} from "cloudinary"
// import fs from "fs"

// const uploadOnCloudinary = async (filePath)=>{
//     try {
//         if(filePath){
//             const responce = await v2.uploader.upload(filePath, {
//                 resource_type : "auto"
//             })
//             console.log("File uploaded successfully on this url ", responce.url);
//             return responce;            
//         }else{
//             console.log("No such file path exsists");
//             return null;
//         }
//     } catch (err) {
//         fs.unlinkSync(filePath);   //   Importantttttttttttttttttttttttttttttttttttttt
//         console.log("Error on uploading file on cloudinary in file ./src/utils/cloudinary.js");
//         console.log("Here is the full error : ",err);
//         return null;
//     }
// }

// export {uploadOnCloudinary}