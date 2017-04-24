var HTTPS       = require('https');
var Cli         = require("matrix-appservice-bridge").Cli;
var Bridge      = require("matrix-appservice-bridge").Bridge;
var AppServiceRegistration 
                = require("matrix-appservice-bridge").AppServiceRegistration;
var http        = require("http");
var requestLib  = require("request");
var qs 		= require("querystring");

const PORT = 9889;
const ROOM_ID = "!zeGfOsnOVRaFQzfljM:gmbridge.ddns.net";
const GROUPME_WEBHOOK_URL = "https://api.groupme.com/v3/bots/"
const GROUPME_BOT_ID = "d321872b4b13d29e9cedaa1da7"

http.createServer(function (request, response) {
  console.log(request.method + " " + request.url);
  
  var body = "";
  request.on("data", function(chunk) {
    body += chunk
  });

  request.on("end", function() {
    // TODO: Make sure this is working properly
    var params = JSON.parse(body);
    console.log(params)
    if (params.sender_type === "user") {
      var message = replaceEmoji(params);
      var intent = bridge.getIntent("@gm_" + params.name + ":gmbridge.ddns.net");
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
                    if (event.type !== "m.room.message" || !event.content || event.room_id !== ROOM_ID) {
                        return;
                    }
                    console.log("*************************")
                    console.log(event)
                    postMessage(event.content.body, event.user_id);
                    

                    /*
                    requestLib({
                        method: "POST",
                        json: true,
                        uri: GROUPME_WEBHOOK_URL,
                        body: {
                            bot_id: event.user_id,
                            text: event.content.body
                        }
                    }, function(err, res) {
                        console.log(err);
                        if (err) {
                            console.log("HTTP Error: %s", err);
                        }
                        else {
                            console.log("HTTP %s", res.statusCode);
                        }
                    });
                    */
                }
            }
        });
        console.log("Matrix-side listening on port %s", port);
        bridge.run(port, config);
    }
}).run();

function postMessage(messageText, userName) {
  var botResponse, options, body, botReq;

  botResponse = userName + ":\n" + messageText;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : GROUPME_BOT_ID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + GROUPME_BOT_ID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

// Subject is message JSON from GroupMe
function replaceEmoji(subject) {
  // Read the text of the message
  var text = subject['text'];
  // If there are no attachments, then there' are no emojis's no need to run the rest.
  if (subject['attachments'] != null) {
    // For each attachment...
    for(i=0; i<subject['attachments'].length; ++i) {
      var attachment = subject['attachments'][i];
      // We're only dealing with emoji attachments here.
      if (attachment['type'] == 'emoji') {
        // The first part of the charmap for emoji attachments is the pack ID, the 
        // second is the powerup ID.
        var pack_id = attachment['charmap'][0][0];
        var powerup_id = attachment['charmap'][0][1];
        var image = null;
        // Looking at the powerups from the function at the top, cycling through them.
        // i is the index and v is the value. There is probably a much cleaner way to
        // do this, but it had to be quick at the time and it works.
        $.each(powerups, function(i, v) {
          // If the pack ID matches the attachment's...
          if (v['meta']['pack_id'] == pack_id) {
            // We're going to cycle through the powerups in the pack. Again, there's
            // probably a much cleaner way to do this.
            $.each(v['meta']['inline'], function(j, u) {
              // I am getting the same sized emojis all the time, but there are other
              // options. Just take a look at the powerups JSON for more options.
              if (u['x'] == 20) {
                // Finally, the URL for the image, which contains a bunch of emojis
                // in one.
                image = u['image_url'];
              }
            });
          }
        });
        if (image == null) {
          continue;
        }
        // The pixel height multiplied by the powerup ID (negated) will give you the 
        // proper background-position vertical placement value.
        var pixel_down = 20 * powerup_id * -1;
        var image_html = '<span style="';
        image_html += "background: url(";
        image_html += image;
        image_html += ") no-repeat left top;";
        image_html += "background-size: 20px auto !important;";
        image_html += "background-position: 0 ";
        image_html += pixel_down;
        image_html += "px;";
        image_html += '" class="emoji"></span>';
        // Replace the placeholder character with the HTML for the image.
        text = text.replace(attachment['placeholder'], image_html);
      }
    }
  }
  // Return the final text with placeholder characters replaced with HTML.
  return text;
}
