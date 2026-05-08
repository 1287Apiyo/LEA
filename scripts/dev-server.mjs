import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const routes = new Set(["/", "/about", "/programs", "/projects", "/events", "/volunteer", "/donate", "/contact"]);

const shell = [
  "<!doctype html>",
  '<html lang="en">',
  "<head>",
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  "<title>LEA Organization</title>",
  '<link rel="icon" href="/images/lea-logo-transparent.png" type="image/png">',
  "</head>",
  "<body>",
  '<div id="app"></div>',
  '<script type="module" src="/dist/main.js"></script>',
  "</body>",
  "</html>",
  "",
].join("\n");

const contentTypes = new Map([
  [".js", "text/javascript; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".jfif", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".mp4", "video/mp4"],
]);

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const route = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  if (routes.has(route)) {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(shell);
    return;
  }

  const filePath = path.normalize(path.join(root, pathname));
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream",
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`LEA Organization site running at http://127.0.0.1:${port}`);
});
