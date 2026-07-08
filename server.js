const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const {
  fetchSettings,
  saveDeadline,
  fetchProjects,
  fetchProjectById,
  saveProject,
  updateProjectById,
  deleteProjectById,
  updateProjectScreenshotPath,
  addProjectComment
} = require("./db");
const { validateProjectInput, validateProjectCommentInput } = require("./project-input");
const { validateDeadlineInput } = require("./schedule");
const { checkFrameAvailability } = require("./frame-check");
const { DEFAULT_OUTPUT_DIR, captureScreenshotsFromDatabase } = require("./screenshot-capture");

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

function sendPng(res, image) {
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=300"
  });
  res.end(image);
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

    if (url.pathname === "/edit") {
      await sendHtml(res, "edit.html");
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

    if (url.pathname.startsWith("/screenshots/") && req.method === "GET") {
      const requestedFile = path.basename(url.pathname);
      const screenshotPath = path.join(DEFAULT_OUTPUT_DIR, requestedFile);
      const resolvedPath = path.resolve(screenshotPath);
      const resolvedOutputDir = path.resolve(DEFAULT_OUTPUT_DIR);

      if (!resolvedPath.startsWith(resolvedOutputDir + path.sep)) {
        sendJson(res, 400, { error: "bad_request" });
        return;
      }

      try {
        const image = await fs.readFile(resolvedPath);
        sendPng(res, image);
      } catch (error) {
        sendJson(res, 404, { error: "not_found" });
      }
      return;
    }

    if (url.pathname === "/api/settings" && req.method === "GET") {
      const settings = await fetchSettings();
      sendJson(res, 200, { source: "database", settings });
      return;
    }

    if (url.pathname === "/api/settings/deadline" && req.method === "PUT") {
      const validation = validateDeadlineInput(await readJson(req));

      if (!validation.ok) {
        sendJson(res, 400, { error: "bad_request", message: validation.error });
        return;
      }

      const settings = await saveDeadline(validation.deadline);
      sendJson(res, 200, { ok: true, settings });
      return;
    }

    if (url.pathname === "/api/frame-check" && req.method === "GET") {
      const result = await checkFrameAvailability(url.searchParams.get("url") || "");
      sendJson(res, result.ok ? 200 : 400, result);
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
  startScreenshotCaptureSchedule();
});

let screenshotCaptureRunning = false;

async function runScreenshotCapture(reason) {
  if (screenshotCaptureRunning) {
    console.log(`[screenshots] skipped ${reason}: already running`);
    return;
  }

  screenshotCaptureRunning = true;
  try {
    console.log(`[screenshots] capture started: ${reason}`);
    const result = await captureScreenshotsFromDatabase({
      fetchProjects,
      updateProjectScreenshotPath
    });
    console.log(`[screenshots] capture finished: captured=${result.captured}, skipped=${result.skipped}, failed=${result.failed}`);
    result.logs
      .filter((log) => log.status === "failed")
      .forEach((log) => console.log(`[screenshots] failed project=${log.projectId}: ${log.reason}`));
  } catch (error) {
    console.log(`[screenshots] job failed: ${error.message}`);
  } finally {
    screenshotCaptureRunning = false;
  }
}

function startScreenshotCaptureSchedule() {
  setTimeout(() => runScreenshotCapture("server-start"), 1000);
  setInterval(() => runScreenshotCapture("daily"), 24 * 60 * 60 * 1000);
}
