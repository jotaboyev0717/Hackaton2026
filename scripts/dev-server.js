import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "./dotenv-lite.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

dotenv(path.join(ROOT, ".env.local"));
dotenv(path.join(ROOT, ".env"));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (obj) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(obj));
  };

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    const modName = url.pathname.replace("/api/", "");
    const modPath = path.join(ROOT, "api", `${modName}.js`);
    if (!fs.existsSync(modPath)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const raw = await readBody(req);
      req.body = raw ? JSON.parse(raw) : {};
      const mod = await import(`file://${modPath}?t=${Date.now()}`);
      await mod.default(req, res);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
  filePath = path.join(ROOT, filePath);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath)) {
    res.status(404).end("Not found");
    return;
  }
  const ext = path.extname(filePath);
  res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Dev server: http://localhost:${PORT}`);
});
