/* ## BUILDING A MULTIPART DATA PARSER ##
 * Author: Abhishek Jakhotiya
 * Email: Jakhotiyaabhishek@gmail.com
 *
 * In this file we will build multipart data parser. We will concatenate all chunks
 * to form one complete body and then parse all body at once. This is really a bad way
 * of parsing since we are all storing all file data as buffer and parsing a big body
 * puts a lot of processing load at once. But this way is easy to understand. We shall
 * parse data on go in out next post.
*/

//require modules
var fs = require('fs');
var http = require('http');
var path = require('path');
var querystring = require('querystring');
var url=require('url');

var myServer = http.createServer(function(req, res) {
  var route = url.parse(req.url).pathname;
  var $get=url.parse(req.url,true).query;
  if (req.method === 'POST') {
//excute this code only if data if it's a post request
    var data = [];
    req.on('data', function(chunk) {
      data.push(chunk);
    });
    req.on('end', function() {

      var boundary = Buffer('--' + querystring.parse(req.headers['content-type'], '; ').boundary);
      var endboundary = Buffer('--' + querystring.parse(req.headers['content-type'], '; ').boundary + '--');
      var boundaryLength = boundary.length + Buffer('\r\n').length;
      var incompleteBody = false;
      var parsedHeader='';
      var $post={};
      var $file=[];
      var isFile=false;
      var body=Buffer.concat(data);

      while (body.indexOf(boundary) !== -1) {
        if (incompleteBody) {
          var DATA=body.slice(0,body.indexOf(boundary));
          if(isFile){
            var filepath=path.join(__dirname,parsedHeader.filename);
            fs.writeFile(filepath,DATA,function(err){
              if(err) return console.log(err);
              console.log(parsedHeader.filename+' uploaded to '+ __dirname);
            });
          }else{
            $post[parsedHeader]=DATA.toString();
          }
          incompleteBody=false;
        }

        if (body.indexOf(endboundary) !== -1) {
          body = body.slice(0, body.indexOf(endboundary));
        } else {
          body = body.slice(body.indexOf(boundary) + boundaryLength);
          var header = body.slice(0, body.indexOf(Buffer('\r\n\r\n')));
          parsedHeader=parseHeader(header.toString());

          if(typeof parsedHeader ==='object'){
            isFile=true;
            $file.push(parsedHeader);//parse headers
          }else{
            isFile=false;
          }
          body = body.slice(body.indexOf(header) + header.length+4);//+4 to strip of \r\n\r\n
          incompleteBody = true;
        }
      }
      if(isFile){
        var filepath=path.join(__dirname,parsedHeader.filename);
        fs.writeFile(filepath,body,function(err){
          if(err) return console.log(err);
          console.log(parsedHeader.filename+' uploaded to '+ __dirname);
        });
      }else{
        $post[parsedHeader]=body.toString();
      }
    });

  }
    sendFile(route, res);

});
myServer.listen(8080);
console.log('listening on port 8080');

//utility function to parse headers
function parseHeader(header) {
  var name, filename, mime;
  header = header.replace('Content-Disposition: form-data;', '');
  var h_arr = header.split('\r\n');
  eval(h_arr[0]);//eval code to convert name="fieldname" portion of headers into javascript assignment
  if (filename) {
    mime = h_arr[1].replace('Content-Type: ', '');
    return {
      name: name,
      filename: filename,
      mime: mime
    };
  }
  return name;
}

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
