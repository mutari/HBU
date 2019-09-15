const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

cloudinary.config({cloud_name: "dds5jwnxx", api_key: "198156312217582", api_secret: "JgnHWSDgzpQZ5nNV9IWJJG3ZmO0"});

const storage = cloudinaryStorage(
    {
        cloudinary: cloudinary,folder: "demo",
        allowedFormats: ["jpg", "png"],
        transformation: [
            { 
                width: 600, 
                height: 660, 
                crop: "limit" 
            }
        ]
    });

module.exports.parser = multer({ storage: storage });


module.exports.fileUppload = (req, res) => {
    console.log(res.body);
    const image = {};  
    image.url = data.url;  
    image.id = data.public_id;
}

 /*imageUppload.parser.single("image"),*/
//imageUppload.fileUppload(req.body.Event.ProfileImage);


//on client side
//img.src = window.URL.createObjectURL(file.files[0]);