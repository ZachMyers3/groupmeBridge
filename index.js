var http        = require("http");
var requestLib  = require("request");
var bridge;

const PORT = 8585;

http.createServer(function (request, response) {
  console.log(request.method + " " + request.url);
  
  var body = "";
  request.on("data", function(chunk) {
    body += chunk
  });

  request.on("end", function() {
    console.log(body);
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify({}));
    response.end();  
  });

}).listen(PORT);

function ping() {
  this.res.writeHead(200);
  this.res.end("GroupMe <--> Matrix");
}
