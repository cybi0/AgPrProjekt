// Datenbank initialisieren
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('notebook.db', (error)=>{
	if(error){
		console.error(error.message);
	}else{
		console.log('Connected to the notebook.db');
	}
});

// Express.js Webserver
const express = require('express');
const app = express()

// Body-Parser: wertet POST-Formulare aus
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

// EJS Template Engine
app.engine('.ejs', require('ejs').__express);
app.set('view engine', 'ejs');

// Sessionvariablen
const session = require('express-session');
app.use(session({ 
	secret: 'example',
	resave: false,
	saveUninitialized: true
}));

// Passwort Verschlüsselung
const passwordHash = require('password-hash');

// Webserver starten http://localhost:3000
app.listen(3000, function(){
	console.log("listening on 3000");
});

// ================================================================//
/*
app.get('/notebook', function(req, res) {
	res.render('notebook');
});
*/
/*
String.isNullOrEmpty = function (value) {
    return (!value || value == undefined || value == "" || value.length == 0);
}
*/
app.locals.ckeckForImage = (link) => {
	const ausgabe = link.match(/\.(jpeg|jpg|gif|png)$/) != null;
	return(ausgabe);
};

app.get(['/', '/notebook'], function(req, res) {
	const user = "Max";		//Muss noch geändert werden!!
	
	const sql = `SELECT * FROM notes WHERE user='${user}'`;
	console.log(sql);
	db.all(sql, function(err, rows){
		if (err){
			console.log(err.message);
		}
		else{
			console.log(rows);
			res.render('notebook', {'rows':  rows || []});
		}
	})
	//res.render('notebook', {'rows':  ""});
});

app.post('/onNeueNotiz', function(req, res){
	const notiz = req.body["notiz"];
	const ordner = req.body["ordner"];
	const link = req.body["link"];
	let linkName = req.body["linkName"];
	const today = new Date();
	const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	const dateTime = date+' '+time;
	const user = "Max";		//Muss noch geändert werden!!
	
	if ((ordner == "" || ordner == null) || (notiz == "" && link == "")){
		res.redirect('/notebook');
	} else {
		if (linkName == "" || linkName == null) {
			linkName = link;
		}

		const sql = `INSERT INTO notes (notiz, ordner, link, linkName, dateTime, user) VALUES ('${notiz}', '${ordner}', '${link}', '${linkName}', '${dateTime}', '${user}')`;
		console.log(sql);
		db.run(sql, function(err){
			res.redirect('/notebook');
		});
	}
	
});

app.post('/onOrdnerAuswahl', function(req, res){
	const ordner = req.body["ordner"];
	const user = "Max";		//Muss noch geändert werden!!
	
	const sql = `SELECT * FROM notes WHERE ordner='${ordner}' AND user='${user}'`;
	console.log(sql);
	db.all(sql, function(err, rows){
		if (err){
			console.log(err.message);
		}
		else{
			console.log(rows);
			res.render('notebook', {'rows':  rows || []});
		}
	})
});
