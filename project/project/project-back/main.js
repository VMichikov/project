var fs = require("fs");
var https = require("https");
let path = require("path");
const express = require("express");
const app = express();
const authRoute = require("./routes/auth");
const uploadRoute = require("./routes/upload");
const onRequest = require("./wsRoutes/onRequest");
const onNotification = require("./wsRoutes/onNotification");
const onMessage = require("./wsRoutes/onMessage");
const onClose = require("./wsRoutes/onClose");
//const test = require("./utils/test");

//   test.test(); test file для добавления пользователей и связей между ними в бд
app.use(express.json());
app.use(express.static("utils"));

// Public Self-Signed Certificates for HTTPS connection
var privateKey = fs.readFileSync(path.resolve(__dirname, "certificates/key.pem"), "utf8");
var certificate = fs.readFileSync(path.resolve(__dirname, "certificates/cert.pem"), "utf8");
var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(httpsServer, {
  debug: true,
});
let peerConnections = [];
peerServer.on("connection", (client) => {
  //client.userId = ;
  console.log("1");
});
peerServer.on("disconnect", (client) => {
  if (peerConnections.length > 0) {
    let lostConnection = peerConnections.find((x) => x.user1Peer == client.id || x.user2Peer == client.id);
    if (lostConnection.user1Peer === client.id) {
      let dstConnection = wsServer.connections.find((x) => x.userId == lostConnection.user2);
      dstConnection.sendUTF(JSON.stringify({ event: "lostConnection" }));
    } else {
      let dstConnection = wsServer.connections.find((x) => x.userId == lostConnection.user1);
      dstConnection.sendUTF(JSON.stringify({ event: "lostConnection" }));
    }
    peerConnections.splice(peerConnections.indexOf(lostConnection), 1);
  }
});
app.use("/peerjs", peerServer);

// peerServer.on("connection", (client) => {
//     console.log(client);
// });
// peerServer.on("disconnect", (client) => {
//     console.log(client);
// });

app.use("/api/auth", authRoute);
app.use("/api/upload", uploadRoute);
//const port = process.env.PORT || 3000;
const port = 4000;

httpsServer.listen(port, () => console.log(`Listening https on port 4000`));

var WebSocketServer = require("websocket").server;
var https = require("https");
var server = https.createServer(credentials, function (request, response) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8080, function () {
  console.log(new Date() + " Server is listening on port 8080");
});
wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false,
});
//Код для клиента, чтобы потыкать подключение к сокетам
//var websocket = new WebSocket("ws://localhost:8080/hello/sdsd/?token=123gt","echo-protocol");
//websocket.onmessage = (event) => {
//  console.log(event.data), var
//}

wsServer.on("request", async function (request) {
  let [connection, isAuthorized] = await onRequest.onRequest(request);
  if (isAuthorized) {
    onNotification.onNotification(connection);
    onMessage.onMessage(connection, peerConnections);
    onClose.onClose(connection);
  }
});
