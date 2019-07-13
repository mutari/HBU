const express = require('express');
const mysql = require('mysql');

const app = express();

///usr/local/mysql/bin/mysql -uroot -p

//setting upp mysql database
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'phi001_tee_880',
    database: 'mediaDB'
});


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
})

app.listen('3000', () => {
    console.log("server started, runing on port 3000: http://localhost:3000/");
});