const http = require('http')
const fs = require('fs');
const port = 3000

var mysql = require('mysql');

const server = http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('login.html', function (error, data) {
        if (error) {
            response.writeHead(404)
            response.write('Error: File Not found')
        } else {
            response.write(data)
        }
        response.end();
    })
})
//

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'local',
    database: 'users'
});


connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
});

connection.end();
//
server.listen(port, function (error) {
    if (error) {
        console.log('Something went wrong', error)
    } else {
        console.log('Server is running on Port ' + port)
    }
})