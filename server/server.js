const WebSocket = require("ws");
const WebSocketServer = require("ws").Server;

const express = require("express");
// const fs = require("fs");
const https = require("https");
const path = require("path");
const { createCert } = require("./mkcert.js");
const { getLocalIP } = require("./getIP.js");

console.log("localIP: ", getLocalIP());

function createWS(httpsServer) {
  console.log("nodeenv: ", process.env.NODE_ENV);

  const isDev = process.env.NODE_ENV === "dev";

  let wss = new WebSocketServer({ port: 8080 });
  if (!isDev) {
    wss = new WebSocketServer({ server: httpsServer });
  }
  // const wss = new WebSocket({ server: httpsServer });

  // eslint-disable-next-line no-unused-vars
  wss.on("connection", (ws, req) => {
    // const ip = req.socket.remoteAddress;
    // console.log("ip:", ip);

    ws.on("message", (data, isBinary) => {
      console.log("received: %s", data);

      // send server ip to client
      ws.send(JSON.stringify({ ip: getLocalIP() }));

      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data, { binary: isBinary });
        }
      });

      // ws.send(`echoing: ${data}`);
      // ws.send(data);
    });

    // ws.send("something");
  });
}

async function createServer() {
  const cert = await createCert();
  // console.log("credentials: ");

  // const options = {
  //   key: fs.readFileSync("../cert/localhost-key.pem"),
  //   cert: fs.readFileSync("../cert/localhost.pem"),
  // };

  const options = {
    ...cert,
  };

  const app = express();
  const port = 3000;

  // app.listen(port, () => {
  //   console.log(`Example app listening at http://localhost:${port}`);
  // });

  // app.enable("trust proxy");
  // app.use((req, res, next) => {
  //   console.log("req.secure: ", req.secure);
  //   req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
  // });

  // app.use(express.static(path.join(__dirname, "dist")));
  app.use("/", express.static(path.join(__dirname, "../dist")));
  console.log(path.join(__dirname, "../dist"));
  app.use("/", express.static("../dist"));

  // app.get("/", (req, res) => {
  //   res.send("Hello World!");
  // });

  const httpsServer = https.createServer(options, app);
  httpsServer.listen(port, () => {
    console.log(`Example app listening at https://localhost:${port}`);
  });

  createWS(httpsServer);
}

createServer();
