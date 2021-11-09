var http = require('http');

var server = http.createServer(function (req, res) {
    if (req.url == '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        res.write('<html><body><p>This is the home page.</p></body></html>');
        res.end();
    }
});

server.listen(5001);
console.log('Node.js web server at port 5001 is running..')