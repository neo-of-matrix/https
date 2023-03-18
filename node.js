const http = require("http");
const https = require("https");
const fs = require("fs");

const request = (protocol, target, options) => {
  const server = {
    https,
    http,
  };
  server[protocol]
    .get(target, { ...options }, function (res) {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log(JSON.parse(data));
      });
    })
    .on("error", function (err) {
      console.error(err);
    });
};
const options = {
  rejectUnauthorized: false,
  agent: new https.Agent({
    ca: [fs.readFileSync("./certificate/localhost.crt")],
  }),
};
request("http", "http://localhost:3000", {});
request("https", "https://localhost:3006", options);
