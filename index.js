var Cli         = require("matrix-appservice-bridge").Cli;
var Bridge      = require("matrix-appservice-bridge").Bridge;
var AppServiceRegistration 
                = require("matrix-appservice-bridge").AppServiceRegistration;
var http        = require("http");
var requestLib  = require("request");

const PORT = 9889;

console.log("Starting groupme <-> matrix bridge...");

/*
new Cli({
  registrationPath: "groupme-registration.yaml",
  generateRegistration: function(reg, callback) {
    reg.setId(AppServiceRegistration.generateToken());
    reg.setHomeserverToken(AppServiceRegistration.generateToken());
    reg.setAppServiceToken(AppServiceRegistration.generateToken());
    reg.setSenderLocalpart("groupmebot");
    reg.addRegexPattern("users", "@groupme_.*", true);
    callback(reg);
  },
  run: function(port, config) {
    // TODO
  }
}).run();
*/
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
