import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, relative, extname } from "node:path";

const root = resolve("out");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".ico": "image/x-icon" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    let file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (relative(root, file).startsWith("..")) { response.writeHead(403).end(); return; }
    if (!extname(file)) file += ".html";
    const data = await readFile(file);
    response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" }).end("Halaman tidak ditemukan.");
  }
});
server.listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
