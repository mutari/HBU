const express = require("express");
const app = express();
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

cloudinary.config({cloud_name: "dds5jwnxx",api_key: "198156312217582",api_secret: "JgnHWSDgzpQZ5nNV9IWJJG3ZmO0"});

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

const parser = multer({ storage: storage });

app.use(express.static("public"));

app.post('/api/images', parser.single("image"), (req, res) => {  
    console.log(req.file) // to see what is returned to you  
    const image = {};  
    image.url = req.file.url;  
    image.id = req.file.public_id;
});


app.listen('8000', () => {
    console.log("server started and running on 8000");
});