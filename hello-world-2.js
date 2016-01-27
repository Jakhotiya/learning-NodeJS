/* ## INTRODUCTION TO NODE.JS ##
 * Author: Abhishek Jakhotiya
 * Email: Jakhotiyaabhishek@gmail.com
*/

var http = require('http');

var server1=http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World server1\n');
});

var server2=http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World server2\n');
});

server1.on('error',function(e){
  //code to handle error the way you want or send a proper response code
  console.log(e);
});
server2.on('error',function(e){
  //code to handle error the way you want or send a proper response code
  console.log(e);
});
server1.listen(8080);
server2.listen(8080);
console.log('two servers can not be bound to one port hence our code should throw error now');


/*
* In this file we have modified our code to handle errors. This will prevent our
* server from crashing. These errors can also be used to send 500 ERROR page or
* display error log in development mode.
* Handling errors is important since it won't crash your server
* Notice that if error is not handled (comment the  'error' event code and run script again)
* it throws error and script execution stops,but it stops after console logging our message.
* That is because .listen() function is asychronous and we can pass a callback to it like

      server1.listen(8080,function(){
        console.log('server1 listening on port 8080');
      });
* Change port for server2 and both servers will work.
 */
