var cloudinary = require("../config/cloudinary")


async function uploadToCloudinary(filepath){
    try{
        var result = await cloudinary.uploader.upload(filepath,{
            folder : "uploads/"
        })
        return {
            url : result.secure_url,
            publicId : result.public_id
        }
        
    }catch(error){
        console.log("error",error);
    }
}
module.exports = {
    uploadToCloudinary
}