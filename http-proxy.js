const https = require("https");
const http = require("http");
const fs = require("fs");
const url = require("url");
const httpProxy = require("http-proxy");

const createServer = (protocol, target, options) => {
  let proxy = httpProxy.createProxyServer({});
  const privateKey = fs.readFileSync("./certificate/key.pem");
  const certificate = fs.readFileSync("./certificate/pem.pem");
  const cre = { key: privateKey, cert: certificate };
  const credentials = {
    http: {},
    https: cre,
  };
  const protocolMap = {
    http,
    https,
  };
  let server = protocolMap[protocol].createServer(
    credentials[protocol],
    (req, res) => {
      let pathName = url.parse(req.url).pathname;
      if (/^\/api/.test(pathName)) {
        proxy.web(req, res, {
          target,
          changeOrigin: true,
          ignorePath: true,
          ...options,
        });
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      fs.readFile("index.html", (err, data) => {
        if (err) {
          console.error(
            "an error occurred while reading the html file content: ",
            err
          );
          throw err;
        }
        res.write(data);
        res.end();
      });
    }
  );
  server.listen(9000);
  console.log("listening on port 9000");
};
const options = {
  secure: false,
  agent: new https.Agent({
    ca: [fs.readFileSync("./certificate/localhost.crt")],
  }),
};
// http to http
// createServer("http", "http://localhost:3000", {});

// http to https
// createServer("http", "https://localhost:3006", options);

// https to http
// createServer("https", "http://localhost:3000", {});

// https to https
createServer("https", "https://localhost:3006", options);
