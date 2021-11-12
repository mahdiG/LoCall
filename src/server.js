const WebSocket = require("ws");
const WebSocketServer = require("ws").Server;

const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
  // res.redirect("http://localhost:8000");
});

// const wss = new WebSocketServer({ server: app, path: "/ws" });

// wss.on("connection", function connection(ws) {
//   ws.on("message", function message(data) {
//     console.log("received: %s", data);
//   });

//   ws.send("something");
// });

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log("ip:", ip);

  ws.on("message", (data, isBinary) => {
    console.log("received: %s", data);

    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });

    // ws.send(`echoing: ${data}`);
    // ws.send(data);
  });

  ws.send("something");
});

function getIP() {}

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });
