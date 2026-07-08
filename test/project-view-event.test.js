const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProjectViewEventInput } = require("../project-view-event");
const { mapProjectRows } = require("../db");

test("accepts detail, mockup, and external view events", () => {
  for (const eventType of ["detail_view", "mockup_view", "external_open"]) {
    assert.deepEqual(validateProjectViewEventInput({ eventType }), {
      ok: true,
      event: { eventType }
    });
  }
});

test("rejects unknown view events", () => {
  assert.deepEqual(validateProjectViewEventInput({ eventType: "main_impression" }), {
    ok: false,
    error: "알 수 없는 조회 이벤트입니다."
  });
});

test("maps project view count for kiosk cards", () => {
  assert.equal(
    mapProjectRows([{ id: 7, student_id: "kopo07", project_name: "Demo", view_count: 12 }])[0].viewCount,
    12
  );
});
