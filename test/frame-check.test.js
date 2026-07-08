const test = require("node:test");
const assert = require("node:assert/strict");
const { checkFrameAvailability, inspectFrameHeaders } = require("../frame-check");

test("marks x-frame-options deny as blocked", () => {
  assert.deepEqual(
    inspectFrameHeaders({ "x-frame-options": "DENY" }),
    {
      ok: true,
      checked: true,
      frameAllowed: false,
      reason: "이 사이트는 iframe 표시를 막고 있어 새 창으로 열어야 합니다."
    }
  );
});

test("keeps frame available when no blocking headers are present", () => {
  assert.deepEqual(
    inspectFrameHeaders({}),
    { ok: true, checked: true, frameAllowed: true, reason: "" }
  );
});

test("does not mark frame as blocked when the precheck cannot reach the url", async () => {
  const result = await checkFrameAvailability("https://example.com", {
    fetchImpl: async () => {
      throw new Error("network unavailable");
    },
    timeoutMs: 1
  });

  assert.deepEqual(result, {
    ok: true,
    checked: false,
    frameAllowed: true,
    reason: "iframe 가능 여부를 확인하지 못해 기존 목업 보기로 표시합니다."
  });
});
