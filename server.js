const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((request, response) => {
      const parsedUrl = parse(request.url, true);
      handle(request, response, parsedUrl);
    }).listen(port, hostname, () => {
      console.log(`InventSmith listening on ${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("InventSmith failed to start", error);
    process.exit(1);
  });
