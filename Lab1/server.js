const http = require('http')
const fs = require('fs');


const express = require("express");
const session = require("express-session");
const path = require("path");

var mysql = require('mysql');


//

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'itsecurity'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to Database!");
});

const app = express();
//app.set("views", path.join(__dirname + "views"))
app.set("view engine", "ejs");

// By Dustin Gohl and Patrick Thuemer
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    // Dustin Gohl, Patrick Thuemer
    // Seconds vulnerability, xss attack is possible and cookie can get output by adding
    // onmouseover = alert(document.cookie)
    // console.log(document.cookie)
    cookie: { httpOnly: false },
    keys: [session.loggedin]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function (request, response) {
    // Render login template
    response.sendFile(path.join(__dirname + '/login.html'));
});



// http://localhost:3000/auth
app.post('/auth', function (request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty



    //vulnerability fixed
    // By Dustin Gohl and Patrick Thuemer
    // if (username && password && checkForSigns(request.body.username)==false && checkForSigns(request.body.password)==false ) {

    //vulnerability not fixed
    if (username && password ) {

        // Execute SQL query that'll select the account from the database based on the specified username and password

        // First Vulnerability SQL Injection
        // E.g   Username : "dustin" password: "test"  in the database
        //Injection: username input : "dustin'; -- "
        // With the added signs the password is irrelevant and u get access to the user dustin

        // OLD Query changed to get the SQL Injection:
        //connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
        // Dustin Gohl Patrick Thuemer

        connection.query("SELECT * FROM accounts WHERE username = '" + request.body.username + "' AND password = '" + request.body.password + "'", function (error, results) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                request.session.loggedin = true;
                request.session.username = username;
                // Redirect to home page
                response.redirect('/home');
            } else {
                response.redirect('/');
            }
            response.end();
        });
       
    }
    
    else {
        response.redirect('/');
        response.end();
    }
});


// http://localhost:3000/
app.get('/register', function (request, response) {

    response.sendFile(path.join(__dirname + '/register.html'));

});

// http://localhost:3000/home
// CODE BY DUSTIN UND PATRICK
app.get('/home', function (request, response) {

    //Frühere Abfrage ob ein Nutzer eingeloggt ist
    // By Dustin Gohl und Patrick Thuemer
    /*
    if(request.session.loggedin){
        console.log("User ist eingeloggt");
    }
    else {
        response.send("please login to view this page");
    }
    */


    let username = request.session.username;
    // If the user is loggedin
    //if (request.session.loggedin) {
    connection.query("SELECT text FROM notes WHERE username= '" + request.session.username + "' ORDER BY ID DESC", function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        response.render(path.join(__dirname + '/home.ejs'), { buttonName: results });

    });

    //} else {
    // Not logged in
    //response.send('Please login to view this page!');
    //}
});

// http://localhost:3000/post
app.post('/post', function (request, response) {
    // Capture the input fields
    let username = request.session.username;
    let note = request.body.note;

    connection.query('INSERT INTO notes(username,text) VALUES(?,?)', [username, note], function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
    });
    response.redirect('/home');

}
);

app.post('/register', function (request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;

    if (username && password) {
        connection.query('INSERT INTO accounts (username,password) VALUES(?,?)', [username, password], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
        });
        response.redirect('/');
    }

}
);


// http://localhost:3000/
app.get('/XSS_by_Patrick_Dustin', function (request, response) {
    // Render login template
    response.send("<script>alert(document.cookie)</script>" + "XSS Attacke by Patrick und Dustin ")
    //response.render(path.join(__dirname + '/home.ejs'), { buttonName: testVariable });
});

app.listen(3000);

//

// Function to filter a string for not allowed signs
// By Dustin Gohl and Patrick Thuemer
function checkForSigns(string){
    const notAllowedSigns = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return notAllowedSigns.test(string);
}