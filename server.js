//================================================================//

//Code übernommen von Prof Dr. Plaß, HAW Hamburg

// Datenbank initialisieren
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/db/user.db', (error)=>{
	if(error){
		console.error(error.message);
	}else{
		console.log('Connected to DB');
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


app.post('/onNewPost', function(req, res){
	const post = req.body["post"];
	const link = req.body["link"];
	let postName = req.body["postName"]
});

app.post('/uploadPost', (req, res)=>{
    db.run(`UPDATE postData SET postText = '${req.body['postText']}' WHERE id = '${req.session['sessionVariable']}'`, (err)=>{
        if(err){
            console.log(err);
        }
        res.redirect('/dashboard');
    });
});