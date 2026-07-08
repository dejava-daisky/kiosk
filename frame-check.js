function isHttpUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function getHeader(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) || "");
  return String(headers[name] || headers[name.toLowerCase()] || "");
}

function inspectFrameHeaders(headers) {
  const xFrameOptions = getHeader(headers, "x-frame-options").toLowerCase();
  const contentSecurityPolicy = getHeader(headers, "content-security-policy").toLowerCase();
  const frameAncestorsBlocked = contentSecurityPolicy.includes("frame-ancestors")
    && !contentSecurityPolicy.includes("frame-ancestors *");

  if (xFrameOptions.includes("deny") || xFrameOptions.includes("sameorigin") || frameAncestorsBlocked) {
    return {
      ok: true,
      checked: true,
      frameAllowed: false,
      reason: "이 사이트는 iframe 표시를 막고 있어 새 창으로 열어야 합니다."
    };
  }

  return { ok: true, checked: true, frameAllowed: true, reason: "" };
}

async function checkFrameAvailability(targetUrl, options = {}) {
  if (!isHttpUrl(targetUrl)) {
    return { ok: false, checked: true, frameAllowed: false, reason: "올바른 URL이 아닙니다." };
  }

  const fetchImpl = options.fetchImpl || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 5000);

  try {
    let response = await fetchImpl(targetUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal
    });

    if (!response.ok && response.status === 405) {
      response = await fetchImpl(targetUrl, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal
      });
    }

    return inspectFrameHeaders(response.headers);
  } catch (error) {
    return {
      ok: true,
      checked: false,
      frameAllowed: true,
      reason: "iframe 가능 여부를 확인하지 못해 기존 목업 보기로 표시합니다."
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  checkFrameAvailability,
  inspectFrameHeaders,
  isHttpUrl
};
