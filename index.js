var Cli         = require("matrix-appservice-bridge").Cli;
var Bridge      = require("matrix-appservice-bridge").Bridge;
var AppServiceRegistration 
                = require("matrix-appservice-bridge").AppServiceRegistration;
var http        = require("http");
var requestLib  = require("request");

const PORT = 9889;

console.log("Starting groupme <-> matrix bridge...");

http.createServer(function (request, response) {
  console.log(request.method + " " + request.url);
  
  var body = "";
  request.on("data", function(chunk) {
    body += chunk
  });

  request.on("end", function() {
    // TODO: Make sure this is working properly
    var params = qs.parse(body);
    if (params.user_id !== "UGMBOT") {
      var intent = bridge.getIntent("@gm_" + params.user_name + ":localhost");
      intent.sendText(ROOM_ID, params.text);
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify({}));
    response.end();
  });

}).listen(PORT);

function ping() {
  this.res.writeHead(200);
  this.res.end("GroupMe <--> Matrix");
}

var Cli = require("matrix-appservice-bridge").Cli;
var Bridge = require("matrix-appservice-bridge").Bridge;
var AppServiceRegistration = require("matrix-appservice-bridge").AppServiceRegistration;

new Cli({
  registrationPath: "groupme-registration.yaml",
  generateRegistration: function(reg, callback) {
    reg.setId(AppServiceRegistration.generateToken());
    reg.setHomeserverToken(AppServiceRegistration.generateToken());
    reg.setAppServiceToken(AppServiceRegistration.generateToken());
    reg.setSenderLocalpart("gmbot");
    reg.addRegexPattern("users", "@gm_.*", true);
    callback(reg);
  },
  run: function(port, config) {
    bridge = new Bridge({
    homeserverUrl: "http://localhost:8008",
    domain: "localhost",
    registration: "groupme-registration.yaml",
    controller: {
      onUserQuery: function(queriedUser) {
        return {}; // auto-provision users with no additonal data
      },    
      onEvent: function(request, context) {
        var event = request.getData();
        // replace with your room ID
        if (event.type !== "m.room.message" || !event.content || event.room_id !== $ROOM_ID) {
          return;
        }
        requestLib({
          method: "POST",
          json: true,
          uri: $WEBHOOK_URL, // replace with your url!
          body: {
            username: event.user_id,
            text: event.content.body
          }
        }, function(err, res) {
          if (err) {
            console.log("HTTP Error: %s", err);
          }
          else {
            console.log("HTTP %s", res.statusCode);
          }
        });
      } 
    }
  });
  console.log("Matrix-side listening on port %s", port);
  bridge.run(port, config);
}).run();


