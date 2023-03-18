const path = require("path");
const fs = require("fs");
const https = require("https");
const Koa = require("koa");
const koaProxy = require("koa-proxies");
const views = require("koa-views");
const createServer = (protocol, target, options) => {
  const koa = new Koa();
  const privateKey = fs.readFileSync("./certificate/key.pem");
  const certificate = fs.readFileSync("./certificate/pem.pem");
  const credentials = { key: privateKey, cert: certificate };
  const server = {
    http: koa,
    https: https.createServer(credentials, koa.callback()),
  };
  koa.use(
    views(path.join(__dirname), {
      extension: "html",
    })
  );
  koa.use(
    koaProxy("/api", {
      target,
      changeOrigin: true,
      rewrite: (path) => {
        return path.replace(/^\/api/, "/");
      },
      ...options,
    })
  );
  koa.use(async function (ctx) {
    await ctx.render("index");
  });
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
