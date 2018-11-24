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

//const jquery = require('jQuery');

//const bootstrap = require('bootstrap');

// Webserver starten http://localhost:3000
app.listen(3000, function(){
	console.log("listening on 3000");
});

// ================================================================//
app.get('/', (req, res)=>{
    res.redirect('/login');
});

app.get('/login', (req, res)=>{
    if (! req.session['sessionVariable']){
        res.render('login.ejs');
    } else {
        res.redirect('/profile')
    }
 });
 
 app.post('/login', (req, res)=>{
	const userName = req.body['username'];
	const password = req.body['password'];
	db.get(`SELECT password FROM user WHERE username='${userName}'`, (err, row)=>{
        if(row != undefined){
            if(password == row.password){
                //User und Password valid
                db.get(`SELECT id FROM user WHERE username='${userName}'`, (err, row)=>{
                    if(row.id != null){
                        req.session['sessionVariable'] = row.id;
                        res.redirect('/profile');
                    } else {
                        res.redirect('/login');
                    }
                });
                
				//res.redirect('profile');
			}else{
                //Password invalid
                res.render('fehler.ejs');
                //Passwort vergessen option?
            }
        }else{
            //user nicht gefunden
            res.render('fehler.ejs', {'username' : userName});
        }
    })
 });

 app.post('/regristrieren', (req, res)=>{
	const userName = req.body['username'];
	const passWord = req.body['password'];
    const passWordRepeat = req.body['repeatpwd'];
    //TODO
	db.run(`INSERT INTO user(username, password) VALUES ('${userName}', '${password}')`, (err, row) =>{
        if(err){
            console.log(err);
        } else {
            db.run(`INSERT INTO profileData(id, username) VALUES ('${userName}', '${row.id}')`, (err) =>{
                if(err){
                    console.log(err);
                }
            });
        };
        
    });
	res.redirect('');
});

app.get('/profile', (req, res)=>{
    renderProfile(req, res);
 });

app.post('/uploadPicture', (req, res)=>{
    db.run(`UPDATE profileData SET profilePic = '${req.body['picture']}' WHERE id = '${req.session['sessionVariable']}'`, (err)=>{
        if(err){
            console.log(err);
        }
        res.redirect('/profile');
    });
});

app.post('/uploadBio', (req, res)=>{
    db.run(`UPDATE profileData SET bioText = '${req.body['bioText']}' WHERE id = '${req.session['sessionVariable']}'`, (err)=>{
        if(err){
            console.log(err);
        }
        res.redirect('/profile');
    });
});

//Funtions:
function renderProfile(req, res){
    if (!req.session['sessionVariable']){
        res.redirect('/login');
    } else {
        const sessionValue = req.session['sessionVariable']
        db.get(`SELECT * FROM profileData WHERE id='${req.session['sessionVariable']}'`, (err, row) =>{
            if(err){
                console.log(err);
            }
            res.render('profile.ejs', {'profileData': row});
        });
    };
};