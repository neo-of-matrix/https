const https = require("https");
const fs = require("fs");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const createServer = (protocol, target, options) => {
  const app = express();
  app.use(express.static(__dirname, { index: "index.html" }));
  const privateKey = fs.readFileSync("./certificate/key.pem");
  const certificate = fs.readFileSync("./certificate/pem.pem");
  const credentials = { key: privateKey, cert: certificate };
  const server = {
    http: app,
    https: https.createServer(credentials, app),
  };
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { "^/api": "/" },
      ...options,
    })
  );
  server[protocol].listen(9000);
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
