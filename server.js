const express = require('express');
const mysql = require('mysql');
var bodyParser = require('body-parser');

const app = express();

//port
const port = '80';

///usr/local/mysql/bin/mysql -uroot -p

//setting upp mysql database
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'phi001_tee_880',
    database: 'HBU'
});

app.use(bodyParser.json())

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


//login to the acount
app.post('/Loggin', (req, res) => {
    var data = req.body.Event;

    con.query('SELECT * FROM profile WHERE Username = ?', [data.Username], (err, result) => {
        if(result[0] != null) {
            var data = result[0];
            console.log(data.Username + " logged in");
            res.json(data);
        }
    });
}); 

//create a new acount
app.post('/CreateAcount', (req, res) => {
    var data = req.body.Event;

    con.query('INSERT INTO profile (UserId, Name, Username, Password, Email) VALUES (?, ?, ?, ?, ?)', [(Math.floor(Math.random() * 9999999+1)), data.Name, data.Username, data.Password, data.Email], (err, result) => {
        console.log("new profile added\n");
        res.json({res: 1});
    });
});

app.listen(port, () => {
    console.log("server started, runing on port " + port + ": http://localhost:" + port + "/");
});