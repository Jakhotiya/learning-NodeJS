/* ## INTRODUCTION TO NODE.JS ##
 * Author: Abhishek Jakhotiya
 * Email: Jakhotiyaabhishek@gmail.com
*/

var http = require('http');

var server=http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});
server.listen('8080');
console.log('Server running at localhost:8080');


/*
 * This is basic nodejs server example given on Node's website,All this server does is print 'hello world'.
 * To run this script navigate to scripts directory and type 'node scriptname.js'
 *
 * 'http' is inbuilt node module which has createServer method.
 * createServer function has callback function which has two arguments. First is request object that is recieved,
 * second is response object to send back.
 * response.writeHead sends headers and status code.
 * 200 means ok. If we wanted to send 'page not found' status we would send 404 instead of 200.
 * response.end function tells node and client that it's finished sending response.
 * .listen(8080) method tells server to listen for requests on port 8080.
 * Obviously we can provide any other valid port that is not bound to any other application
 */
