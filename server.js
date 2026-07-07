const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { fetchStudents, saveStudentProgress } = require("./db");
const { validateStudentInput } = require("./student-input");

const port = Number(process.env.PORT || 3000);

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(body, null, 2));
}

async function sendHtml(res) {
  const html = await fs.readFile(path.join(__dirname, "kiosk.html"), "utf8");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

async function sendFile(res, fileName) {
  const html = await fs.readFile(path.join(__dirname, fileName), "utf8");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

async function sendCss(res, fileName) {
  const css = await fs.readFile(path.join(__dirname, fileName), "utf8");
  res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
  res.end(css);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/" || url.pathname === "/kiosk") {
      await sendHtml(res);
      return;
    }

    if (url.pathname === "/insert") {
      await sendFile(res, "insert.html");
      return;
    }

    if (url.pathname === "/kiosk.css") {
      await sendCss(res, "kiosk.css");
      return;
    }

    if (url.pathname === "/kiosk-print.css") {
      await sendCss(res, "kiosk-print.css");
      return;
    }

    if (url.pathname === "/api/students" && req.method === "GET") {
      const students = await fetchStudents();
      sendJson(res, 200, { source: "database", students });
      return;
    }

    if (url.pathname === "/api/students" && req.method === "POST") {
      const validation = validateStudentInput(await readJson(req));
      if (!validation.ok) {
        sendJson(res, 400, { error: "bad_request", message: validation.error });
        return;
      }

      const student = await saveStudentProgress(validation.student);
      sendJson(res, 200, { ok: true, student });
      return;
    }

    sendJson(res, 404, { error: "not_found" });
  } catch (error) {
    sendJson(res, 500, {
      error: "server_error",
      message: error.message
    });
  }
});

server.listen(port, () => {
  console.log(`kiosk server: http://localhost:${port}`);
});
