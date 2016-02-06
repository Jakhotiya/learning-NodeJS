/* ## Building static file server##
 * Author: Abhishek Jakhotiya
 * Email : Jakhotiyaabhishek@gmail.com
*/

/* In this file we will be building our server. We will have to do following things.
* find out request url.
* map the request url to a file on our machine.
* read that resource and send it back to browser with appropriet headers.
*/

//require modules
var fs=require('fs');
var http=require('http');
var path=require('path');

//create server and listen on 8080 port for connections
var myServer=http.createServer(function(req,res){
  var url=req.url;
  sendFile(url,res);
});
myServer.listen(8080);
console.log('listening on port 8080');

//function to read a resource and send response;
function sendFile(filepath,res){
  filepath=path.join(__dirname,filepath);
  fs.open(filepath,'r',function(err,fd){
    if(err){
      console.log(err);
      send404(res);
    }
    else{
      fs.readFile(fd,function(err,data){
        if(err){
          console.log(err);
          send404(res);
        }
        else{
          res.writeHead(200,{'Content-type':mimeType(filepath)});
          res.write(data);
          res.end();
        }
      });
    }

  });

}

//send 404 resonse if file not found
function send404(res){
  res.writeHead(404,{'Content-type':'text/html'});
  res.end('<h1>404! Resource you are looking for not found </h1>');
  return false;
}

//detect mime-type
function mimeType(filepath){
  var ext=path.extname(filepath);
  ext=ext.toLowerCase();
  var mimetype='';
  if(ext==='.html') mimetype='text/html';
  else if(ext==='.css') mimetype='text/css';
  else if(ext==='.js') mimetype='text/javascript';
  else if(ext==='.png') mimetype='image/png';
  else if(ext==='.gif') mimetype='image/gif';
  else if(ext==='.jpg') mimetype='image/jpg';
  else if(ext==='.jpeg') mimetype='image/jpeg';
  else{
    mimetype='application/octet-stream';
  }
return mimetype;
}

/* __dirname is node variable containing directory of currently executing script.
* 'path' module provides path related functionality. Basically it handles all the
* string manipulation or transformation related to paths. Paths on linux
* and windows system are in different format. Thats why instead of manipuating path
* strings manually, prefer path module.

http.createServer(function(req,res){
  res.writeHead(200,{'Content-Type':'text/plain'});
  res.end('<h1>Hello world</h1>');
}).listen(8080);

  If you run this code you will see your browser displaying <h1>Hello world</h1>
  instead Hello world in heading format.That happes because your browser interprets
  it as plain text rather than html code. Because you told it that data sent is
  text/plain. Hence if we send css file we must send text/css as header.

  To detect resource type we have written mimeType function. This is not the most
  elegant way of detecting all mime types used on web and especially finding out
  mime from extension is not thing  but for demonstration purpose it does the job.

*/
