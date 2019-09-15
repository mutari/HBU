const express = require('express');
const mysql = require('mysql');
const imageUppload = require('./imageUppload.js');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
var cloudinary = require('cloudinary');

const app = express();

//port
const port = '80';

//midelware
const loger = (req, res, next) => {
    console.log("request :: " + req.url);
    next();
}

app.use(loger);

///usr/local/mysql/bin/mysql -uroot -p

//setting upp mysql database
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'phi001_tee_880',
    database: 'HBU'
});

cloudinary.config({
    cloud_name: "dds5jwnxx", 
    api_key: "198156312217582", 
    api_secret: "JgnHWSDgzpQZ5nNV9IWJJG3ZmO0"
});



app.use(bodyParser.json())
app.use(fileupload({
    useTempFiles : true
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/global.css', (req, res) => {
    res.sendFile(__dirname + "/public/global.css");
});

app.get('/bundle.js', (req, res) => {
    res.sendFile(__dirname + "/public/bundle.js");
});

app.get('/bundle.css', (req, res) => {
    res.sendFile(__dirname + "/public/bundle.css");
});

app.get('/images/:type/:file', (req, res) => {
    res.sendFile(__dirname + "/images/" + req.params.type + "/" + req.params.file);
});

//file uppload


app.post('/ImageUppload', (req, res) => { 
    const data = JSON.parse(req.body.profile);
    const file = req.files.icone;
    console.log("data ::: ", data);

    cloudinary.uploader.upload(file.tempFilePath, (result, error) => {

        if(error == undefined) {
            con.query('UPDATE profile SET Usericon = ? WHERE UserID = ?;', [result.url, data.UserID], (error1, result1) => {
                if(error1 != "") {
                    res.json({url: result.url});
                    console.log("RES ::  ", result1);
                } else 
                    console.log("ERR ::  ", error1, result1);
            })
        } else {
            console.log("Image ERROR: ", error);
        }

    });
});

//login to the acount
app.post('/Loggin', (req, res) => {
    var data = req.body;
    console.log(data);

    con.query('SELECT * FROM profile WHERE Username = ?', [data.Username], (err, result) => {
        if(result[0] != null) {
            result[0];
            if(result[0].Password == data.Password) {
                console.log(result[0].Username + " logged in");
                res.json({data: result[0], command: 'okey'});
                return;
            }
            return;
        }

        res.json({command: 'bad'});

    });
}); 

//create a new acount
app.post('/CreateAcount', (req, res) => {
    var data = req.body;

    con.query('INSERT INTO profile (UserId, Name, Username, Password, Email) VALUES (?, ?, ?, ?, ?)', [(Math.floor(Math.random() * 9999999+1)), data.Name, data.Username, data.Password, data.Email], (err, result) => {
        console.log("new profile added\n");
        res.json({res: 1});
    });
});

app.listen(port, () => {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    console.log("server started, runing on port " + port + ": http://localhost:" + port + "/\t time: " + time);
});