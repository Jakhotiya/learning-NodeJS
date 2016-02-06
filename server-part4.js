/* # PARSING MULTIPART DATA ON THE GO #
  Author: Abhishek Jakhotiya
  Email: Jakhotiyaabhishek@gmail.com

  Logic behind parsing data chunk by chunk is to visualize multiple forms
  of chunk.
  There may be only one chunk if file is small.
  Data of large file will be devided in many chunks. For example, large image
  might be divided in more than 3 chunks. When those chunks arrive they should
  go in same file.
  In last parser we were extracting data and writing it all once.
  This times data is comming in chunks we need to use appenedFile rather
  than writeFile. Parsing logic is almost same.

  We are moving most of our logic in to request.on('data',callback) block. Previously
  it was in request.end block
*/

var fs = require('fs');
var http = require('http');
var path = require('path');
var querystring = require('querystring');
var url = require('url');

//create server and listen on 8080 port for connections
var myServer = http.createServer(function(req, res) {
  var route = url.parse(req.url).pathname;
  if (req.method === 'POST') {
    var boundary = Buffer('--' + querystring.parse(req.headers['content-type'], '; ').boundary);
    var endboundary = Buffer('--' + querystring.parse(req.headers['content-type'], '; ').boundary + '--');
    var boundaryLength = boundary.length + Buffer('\r\n').length;
    var incompleteBody = false;
    var parsedHeader = '';
    var body = new Buffer(0);
    var $post = {};
    var $file = [];
    var isFile = false;
    req.on('data', function(chunk) {
      while (chunk.indexOf(boundary) !== -1) {
        if (incompleteBody) {
          body = Buffer.concat([body, chunk.slice(0, chunk.indexOf(boundary))]);
          body = body.slice(0, body.length - 2);
          if (isFile) {
            saveToTempDir(parsedHeader.filename, body)
          } else {
            $post[parsedHeader] = body.toString();
          }
          body = new Buffer(0);
          incompleteBody = false;
        }

        if (chunk.indexOf(endboundary) !== -1) {
          chunk = chunk.slice(0, chunk.indexOf(endboundary));
        } else {
          chunk = chunk.slice(chunk.indexOf(boundary) + boundaryLength);
          var header = chunk.slice(0, chunk.indexOf(Buffer('\r\n\r\n')));
          parsedHeader = parseHeader(header.toString());

          if (typeof parsedHeader === 'object') {
            isFile = true;
            $file.push(parsedHeader);
          } else {
            isFile = false;
          }
          //remove the headers+ \r\n\r\n sequence
          chunk = chunk.slice(chunk.indexOf(header) + header.length + 4);
          incompleteBody = true;
        }
      }
      body = Buffer.concat([body, chunk]);
      if (isFile) {
        saveToTempDir(parsedHeader.filename, body)
      } else {
        $post[parsedHeader] = body.toString();
      }
      body = new Buffer(0);
    });

    req.on('end', function() {
      console.log($file, $post);
    });
  }
  sendFile(route, res);
});
myServer.listen(8080);
console.log('listening on port 8080');

function parseHeader(header) {
  var name, filename, mime;
  header = header.replace('Content-Disposition: form-data;', '');
  var h_arr = header.split('\r\n');
  eval(h_arr[0]);
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

//@ToDo if filename is not passed then it should throw error
function saveToTempDir(filename, buffer) {
  var tmpDir = require('os').tmpdir();
  var filepath = path.join(tmpDir, filename);
  fs.appendFile(filepath, buffer, function(err) {
    if (err) return console.log(err);
  });

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
