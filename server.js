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

 app.get('/logout', (req, res)=>{
    delete req.session['sessionVariable'];
    res.redirect('/login');
}); 
 
//Dashboard More or less finished!

 app.get('/dashboard', function(req, res) {
    if (!req.session['sessionVariable']){
        res.redirect('/login');
    }
    else {
        let sql = `SELECT username FROM user WHERE id='${req.session['sessionVariable']}'`;
        console.log(sql);
        db.get(sql, function(err, rows){

            console.log(rows);

            sql = `SELECT * FROM postData  `;
            console.log(sql);
            db.all(sql, function(err, rows){

                res.render('dashboard', { 'postData': rows || []});

            });              
        }); 
    }
});



app.post('/uploadPost', (req, res)=>{

    let sql = `SELECT username FROM user WHERE id='${req.session['sessionVariable']}'`;
    console.log(sql);
    db.get(sql, function(err, rows){

        console.log(rows);
        const postSender = rows.username;
        const postText = req.body["postText"];
        const namedPost = postSender + ":    " + postText;

        const sql = `INSERT INTO postData (userid, postText) VALUES ('${req.session['sessionVariable']}' , '${namedPost}')`;

        console.log(sql);
            db.run(sql, function(err){
                res.redirect('/dashboard');
            });

        /*
         db.run(`INSERT INTO postData (userid, postText) VALUES ( '${req.session['sessionVariable']}' , '${req.body['postText']}')`, (err)=>{
            if(err){
                console.log(err);
            }
            res.redirect('/dashboard');

        }); */     
    });
});

//login und registration 
 
/*Felix*/
 app.post('/login', (req, res)=>{
	const userName = req.body['username'];
	const password = req.body['password'];
	db.get(`SELECT password FROM user WHERE username='${userName}'`, (err, row)=>{
        if(row != undefined){
            if(passwordHash.verify(password, row.password)){
                //User und Password valid
                db.get(`SELECT id FROM user WHERE username='${userName}'`, (err, row)=>{
                    if(row.id != null){
                        req.session['sessionVariable'] = row.id;
                        res.redirect('/profile');
                    } else {
                        res.redirect('/login');
                    }
                });
			}else{
                //Password invalid
                res.render('fehler.ejs', {'fehlermeldung' : 'Falsches Passwort'});
                //Passwort vergessen option?
            }
        }else{
            //user nicht gefunden
            res.render('fehler.ejs', {'fehlermeldung' : 'Username wurde nicht gefunden'});
        }
    })
 });

 app.post('/regristrieren', (req, res)=>{
	const userName = req.body['username'];
	const passWord = req.body['password'];
    const passWordRepeat = req.body['repeatpwd'];
    if(passWord == passWordRepeat){
        db.get(`SELECT * FROM user WHERE username='${userName}'`, (err, checkrow)=>{
            if(err){
                console.log(err);
            } else if(checkrow == undefined) {
                db.run(`INSERT INTO user(username, password) VALUES ('${userName}', '${passwordHash.generate(passWord)}')`, (err) =>{
                    if(err){
                        console.log(err);
                    }
                    db.run(`INSERT INTO profileData(id, username) VALUES ((SELECT id FROM user WHERE username = '${userName}'), '${userName}')`, (err) =>{
                        if(err){
                            console.log(err);
                        }
                    });
                    res.redirect('/login');
                })
            } else {
                res.render('fehler.ejs', {'fehlermeldung' : 'Username existiert bereits'});
            }
        }
    )} else {
        res.render('fehler.ejs', {'fehlermeldung' : 'Passworter stimmt nicht überein'});
    };
});

app.get('/user/:userID', (req, res)=>{
    renderProfile(req, res, req.params['userID']);
 });

app.get('/profile', (req, res)=>{
    renderProfile(req, res, req.session['sessionVariable']);
 });

app.get('/allUsers', (req, res)=>{
    if (!req.session['sessionVariable']){
        res.redirect('/login');
    }
    else {
        db.all(`SELECT * FROM profileData WHERE NOT id='${req.session['sessionVariable']}'`, (err, rows) =>{
            if(err){
                console.log(err);
            }
            res.render('allUsers.ejs', {'profiles' : rows});
        });
    }
});

app.post('/uploadBio', (req, res)=>{
    db.run(`UPDATE profileData SET bioText = '${req.body['bioText']}' WHERE id = '${req.session['sessionVariable']}'`, (err)=>{
        if(err){
            console.log(err);
        }
        res.redirect('/profile');
    });
});

// ================================================================//

/***********************************************
**                   Niklas                   **
***********************************************/
app.get('/messenger', function (req, res) {
    if (!req.session['sessionVariable']){
        res.redirect('/login');
	} else {
        let sql = `SELECT username FROM user WHERE id='${req.session['sessionVariable']}'`;
		console.log(sql);
		db.get(sql, function(err, rows){
			if (err){
				console.log(err.message);
			}
			else{
                console.log(rows);
                const username = rows.username;
                sql = `SELECT * FROM messages WHERE username='${username}'`;
                console.log(sql);
				db.all(sql, function(err, rows){
                    if (err){
                        console.log(err.message);
                    }
                    else{
                        console.log(rows);
                        let messages = rows;
                        sql = `SELECT username FROM user`;
                        console.log(sql);
                        db.all(sql, function(err, rows){
                            if (err){
                                console.log(err.message);
                            }
                            else{
                                console.log(rows);
                                let names = rows;
                                res.render('messenger', {'username': username || [], 'messages': messages || [], 'names': names || []});
                            }
                        });
                    }
				});
			}
		});
    }
});

app.post('/neueMail', function(req, res){
    let sql = `SELECT username FROM user WHERE id='${req.session['sessionVariable']}'`;
    console.log(sql);
    db.get(sql, function(err, rows){
        if (err){
            console.log(err.message);
        }
        else{
            console.log(rows);
            const sender = rows.username;
            const mail = req.body["mail"];
            const namedMail = sender + ":    " + mail;
            const empfaenger = req.body["username"];
	
            const sql = `INSERT INTO messages (mail, username) VALUES ('${namedMail}', '${empfaenger}')`;
            console.log(sql);
            db.run(sql, function(err){
                res.redirect('/messenger');
            });	
        }
    });
});

//Funtions:
function renderProfile(req, res, userID){
    if (!req.session['sessionVariable']){
        res.redirect('/login');
    } else {
        db.get(`SELECT * FROM profileData WHERE id='${userID}'`, (err, row) =>{
            if(err){
                console.log(err);
            }
            if (userID == req.session['sessionVariable']){
                res.render('profile.ejs', {'profileData': row});
            } else {
                res.render('viewUser.ejs', {'profileData': row});
            };
        });
    };
};
