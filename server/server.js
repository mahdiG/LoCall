const WebSocket = require("ws");
const WebSocketServer = require("ws").Server;

const express = require("express");
// const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { createCert } = require("./mkcert.js");
const { getLocalIP } = require("./getIP.js");

const localIP = getLocalIP();
console.log("localIP: ", localIP);

async function createHttpsServer() {
  const cert = await createCert();

  return new Promise(resolve => {
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
      resolve(httpsServer);
    });

    // createWS(httpsServer);
  });
}

async function createWS() {
  console.log("createws");
  const httpsServer = await createHttpsServer();
  return new Promise(resolve => {
    console.log("nodeenv: ", process.env.NODE_ENV);

    const isDev = process.env.NODE_ENV === "dev";

    console.log("isDev: ", isDev);

    let wss = new WebSocketServer({ port: 8080 });
    if (!isDev) {
      wss = new WebSocketServer({ server: httpsServer });
    }
    resolve();

    // eslint-disable-next-line no-unused-vars
    wss.on("connection", (ws, req) => {
      // const ip = req.socket.remoteAddress;
      // console.log("ip:", ip);

      console.log("someone connected?", wss.clients.size);

      ws.send(JSON.stringify({ ip: localIP }));

      // if (wss.clients.size === 2) {
      //   ws.send(JSON.stringify({ msg: "MAKE_CALL" }));
      // }

      ws.on("message", (data, isBinary) => {
        console.log("received: %s", data);

        // send server ip to client

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
  });
}

function createHttpServer() {
  console.log("createhttp");
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      console.log("req: ", req);
      console.log("res: ", res);
      res.writeHead(302, { Location: `https://${localIP}:3000` });
      res.end(
        JSON.stringify({
          data: "Hello World!",
        })
      );
    });

    server.listen(3333, () => resolve("hello"));
  });
}

module.exports = {
  async startServers() {
    console.log("START");
    // const tp = await createHttpServer();
    // await createHttpServer();
    // await createWS();
    return Promise.all([createHttpServer(), createWS()]);
  },
};
