//================================================================//

//Code übernommen von Prof Dr. Plaß, HAW Hamburg

// Datenbank initialisieren
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(__dirname + '/db/projekt.db', (err)=>{
    if(err){
        console.error(err.message);
    }else{
        console.log('Connected to Database');
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

/**********************************************************************************
**                                    Max                                        **
***********************************************************************************/

app.locals.ckeckForImage = (link) => {
	const ausgabe = link.match(/\.(jpeg|jpg|gif|png|svg)$/) != null;
	return(ausgabe);
};

app.get('/notebook', function(req, res) {
	if (!req.session['sessionVariable']){
        res.redirect('/login');
	} else {
		let sql = `SELECT * FROM notes WHERE id='${req.session['sessionVariable']}'`;
		console.log(sql);
		db.all(sql, function(err, rows){
			if (err){
				console.log(err.message);
			}
			else{
				console.log(rows);
				let notes = rows;
				sql = `SELECT * FROM ordner WHERE id='${req.session['sessionVariable']}'`;
				db.all(sql, function(err, rows){
					let ordner = rows;
					res.render('notebook', {'notes':  notes || [], 'ordner': ordner || []});
				});
			}
		})
	}
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
	
	if ((ordner == "" || ordner == null) || (notiz == "" && link == "")){
		res.redirect('/notebook');
	} else {
		if (linkName == "" || linkName == null) {
			linkName = link;
		}

		const sql = `INSERT INTO notes (id, notiz, ordner, link, linkName, dateTime) VALUES ('${req.session['sessionVariable']}', '${notiz}', '${ordner}', '${link}', '${linkName}', '${dateTime}')`;
		console.log(sql);
		db.run(sql, function(err){
			res.redirect('/notebook');
		});
	}
	
});

app.post('/onNeuerOrdner', function(req, res){
	const ordner = req.body["ordner"];
	
	const sql = `INSERT INTO ordner (id, ordner) VALUES ('${req.session['sessionVariable']}', '${ordner}')`;
	console.log(sql);
	db.run(sql, function(err){
		res.redirect('/notebook');
	});
});

app.post('/onOrdnerAuswahl', function(req, res){
	const ordn = req.body["ordner"];
	
	let sql = `SELECT * FROM notes WHERE ordner='${ordn}' AND id='${req.session['sessionVariable']}'`;
	console.log(sql);
	db.all(sql, function(err, rows){
		if (err){
			console.log(err.message);
		}
		else{
			console.log(rows);
			let notes = rows;
			sql = `SELECT * FROM ordner WHERE id='${req.session['sessionVariable']}'`;
			db.all(sql, function(err, rows){
				let ordner = rows;
				res.render('notebook', {'notes':  notes || [], 'ordner': ordner || []});
			});
		}
	})
});