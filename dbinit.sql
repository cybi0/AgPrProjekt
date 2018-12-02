CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL);

CREATE TABLE profileData(id INTEGER FOREIGNKEY REFERENCES user(id), profilePic BLOB NOT NULL DEFAULT "", bioText TEXT NOT NULL DEFAULT "" ,
username TEXT);

CREATE TABLE notes (id INTEGER FOREIGNKEY REFERENCES user(id), notiz TEXT NOT NULL, ordner TEXT NOT NULL, link TEXT, linkName TEXT, dateTime TEXT, user TEXT);

CREATE TABLE ordner (id INTEGER FOREIGNKEY REFERENCES user(id), ordner TEXT NOT NULL, user TEXT);

CREATE TABLE postData(id INTEGER PRIMARY KEY AUTOINCREMENT, userid INTEGER FOREIGNKEY REFERENCES user(id),  postText TEXT NOT NULL DEFAULT "" );