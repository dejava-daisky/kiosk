const test = require("node:test");
const assert = require("node:assert/strict");
const { buildRecommendedSchedule, validateDeadlineInput } = require("../schedule");

test("builds recommended schedule inside remaining period", () => {
  assert.deepEqual(
    buildRecommendedSchedule(new Date(2026, 6, 8, 9, 0, 0), "2026-07-31"),
    [
      { phase: "기획", dueDate: "2026-07-13" },
      { phase: "프로토타입", dueDate: "2026-07-18" },
      { phase: "실제 제작 시작", dueDate: "2026-07-22" },
      { phase: "최종 테스트", dueDate: "2026-07-27" },
      { phase: "최종 정리", dueDate: "2026-07-31" }
    ]
  );
});

test("accepts valid deadline input", () => {
  assert.deepEqual(validateDeadlineInput({ deadline: "2026-07-31" }), {
    ok: true,
    deadline: "2026-07-31"
  });
});

test("rejects invalid deadline input", () => {
  assert.deepEqual(validateDeadlineInput({ deadline: "2026-99-99" }), {
    ok: false,
    error: "최종 마감일을 선택하세요."
  });
});
