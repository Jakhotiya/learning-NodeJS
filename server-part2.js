/* ## HANDLING HTTP GET AND POST DATA ##
* Author: Abhishek Jakhotiya
* Email : Jakhotiyaabhishek@gmail.com
*
* Handling POST data involves handling url-encoded data and multipart data.
* We will handle url-encoded data to create normal sign up system
*/

/* If you console.log(request) you will see a long object and not everything is
worth our attention hence console.log(Object.keys(request)). It will only log keys.
Keys in request object:
[ '_readableState',
'readable',
'domain',
'_events',
'_eventsCount',
'_maxListeners',
'socket',
'connection',
'httpVersionMajor',
'httpVersionMinor',
'httpVersion',
'complete',
'headers',
'rawHeaders',
'trailers',
'rawTrailers',
'upgrade',
'url',
'method',
'statusCode',
'statusMessage',
'client',
'_consuming',
'_dumped' ]
*/

var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
var querystring = require('querystring');
var users={};

var myServer = http.createServer(function(req, res) {
  parsed_url=url.parse(req.url,true);
  var requestURL=parsed_url.pathname;
  var $get=parsed_url.query;
  if(req.method==='POST'){
    var body='';
    req.on('data',function(chunk){
      body+=chunk;
    });
    req.on('end',function(){
      var $post=querystring.parse(body);
      users[$post.username]=$post.password;
      console.log(users);
    });
  }
  sendFile(requestURL,res);

});
myServer.listen(8080);
console.log('listening on port 8080');


//function to read a resource and send response;
function sendFile(filepath, res) {
  filepath = path.join(__dirname, filepath);
  fs.open(filepath, 'r', function(err, fd) {
    if (err) {
      console.log(err);
      send404(res);
    } else {
      fs.readFile(fd, function(err, data) {
        if (err) {
          console.log(err);
          send404(res);
        } else {
          res.writeHead(200, {
            'Content-type': mimeType(filepath)
          });
          res.write(data);
          res.end();
        }
      });
    }

  });

}

//send 404 resonse if file not found
function send404(res) {
  res.writeHead(404, {
    'Content-type': 'text/html'
  });
  res.end('<h1>404! Resource you are looking for not found </h1>');
  return false;
}

//detect mime-type
function mimeType(filepath) {
  var ext = path.extname(filepath);
  ext = ext.toLowerCase();
  var mimetype = '';
  if (ext === '.html') mimetype = 'text/html';
  else if (ext === '.css') mimetype = 'text/css';
  else if (ext === '.js') mimetype = 'text/javascript';
  else if (ext === '.png') mimetype = 'image/png';
  else if (ext === '.gif') mimetype = 'image/gif';
  else if (ext === '.jpg') mimetype = 'image/jpg';
  else if (ext === '.jpeg') mimetype = 'image/jpeg';
  else {
    mimetype = 'application/octet-stream';
  }
  return mimetype;
}



/*
{ host: 'localhost:8080',
'user-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0',
accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,/*;q=0.8',
'accept-language': 'en-US,en;q=0.5',
'accept-encoding': 'gzip, deflate',
referer: 'http://localhost:8080/resources/myserver.html',
cookie: 'fbm_777638322363732=base_domain=.localhost; G_ENABLED_IDPS=google',
connection: 'keep-alive',
'content-type': 'application/x-www-form-urlencoded',
'content-length': '37' }

  This is what our headers object looks like. Notice 'content-type' field and its
  value here. we will use this field to distinguish between multipart request and
  url-encoded request.
*/
