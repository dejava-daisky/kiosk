const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const {
  fetchProjects,
  fetchProjectById,
  saveProject,
  updateProjectById,
  deleteProjectById,
  addProjectComment
} = require("./db");
const { validateProjectInput, validateProjectCommentInput } = require("./project-input");

const port = Number(process.env.PORT || 3000);

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(body, null, 2));
}

async function sendHtml(res, fileName) {
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
      await sendHtml(res, "kiosk.html");
      return;
    }

    if (url.pathname === "/insert") {
      await sendHtml(res, "insert.html");
      return;
    }

    if (url.pathname === "/admin" || url.pathname === "/admin.html") {
      await sendHtml(res, "admin.html");
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

    if (url.pathname === "/api/projects" && req.method === "GET") {
      const projects = await fetchProjects();
      sendJson(res, 200, { source: "database", projects });
      return;
    }

    if (url.pathname === "/api/projects" && req.method === "POST") {
      const validation = validateProjectInput(await readJson(req));

      if (!validation.ok) {
        sendJson(res, 400, { error: "bad_request", message: validation.error });
        return;
      }

      const project = await saveProject(validation.project);
      sendJson(res, 200, { ok: true, project });
      return;
    }

    const projectDetailMatch = url.pathname.match(/^\/api\/projects\/(\d+)$/);
    if (projectDetailMatch && req.method === "GET") {
      const project = await fetchProjectById(Number(projectDetailMatch[1]));

      if (!project) {
        sendJson(res, 404, { error: "not_found", message: "프로젝트를 찾지 못했습니다." });
        return;
      }

      sendJson(res, 200, { project });
      return;
    }

    if (projectDetailMatch && req.method === "PUT") {
      const validation = validateProjectInput(await readJson(req));

      if (!validation.ok) {
        sendJson(res, 400, { error: "bad_request", message: validation.error });
        return;
      }

      const project = await updateProjectById(Number(projectDetailMatch[1]), validation.project);

      if (!project) {
        sendJson(res, 404, { error: "not_found", message: "프로젝트를 찾지 못했습니다." });
        return;
      }

      sendJson(res, 200, { ok: true, project });
      return;
    }

    if (projectDetailMatch && req.method === "DELETE") {
      const result = await deleteProjectById(Number(projectDetailMatch[1]));
      sendJson(res, 200, { ok: true, ...result });
      return;
    }

    const projectCommentMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/comments$/);
    if (projectCommentMatch && req.method === "POST") {
      const validation = validateProjectCommentInput(await readJson(req));

      if (!validation.ok) {
        sendJson(res, 400, { error: "bad_request", message: validation.error });
        return;
      }

      const comment = await addProjectComment(Number(projectCommentMatch[1]), validation.comment);
      sendJson(res, 200, { ok: true, comment });
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
