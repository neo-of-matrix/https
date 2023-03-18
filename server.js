const http = require("http");
const https = require("https");
const fs = require("fs");

const createServer = (protocol, port) => {
  const server = {
    https,
    http,
  };
  const privateKey = fs.readFileSync("./certificate/key.pem");
  const certificate = fs.readFileSync("./certificate/pem.pem");
  const cre = { key: privateKey, cert: certificate };
  const credentials = {
    http: {},
    https: cre,
  };
  let httpServer = server[protocol].createServer(
    credentials[protocol],
    (req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json;charset=UTF-8");
      res.end(JSON.stringify({ a: 1 }));
    }
  );
  httpServer.listen(port);
  console.log(`listening on port ${port}`);
};

createServer("http", 3000);
createServer("https", 3006);