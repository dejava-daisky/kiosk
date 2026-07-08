const test = require("node:test");
const assert = require("node:assert/strict");
const { buildRecommendedSchedule, getRemainingPhases, validateDeadlineInput } = require("../schedule");

test("builds recommended schedule inside remaining period", () => {
  assert.deepEqual(
    buildRecommendedSchedule(new Date(2026, 6, 8, 9, 0, 0), "2026-07-31"),
    [
      { phase: "기획", dueDate: "2026-07-13" },
      { phase: "프로토타입", dueDate: "2026-07-18" },
      { phase: "실제 제작 시작", dueDate: "2026-07-22" },
      { phase: "최종 테스트", dueDate: "2026-07-27" },
      { phase: "완료", dueDate: "2026-07-31" }
    ]
  );
});

test("builds schedule only for remaining phases after current progress", () => {
  assert.deepEqual(
    buildRecommendedSchedule(new Date(2026, 6, 8, 9, 0, 0), "2026-07-31", "프로토타입"),
    [
      { phase: "프로토타입", dueDate: "2026-07-14" },
      { phase: "실제 제작 시작", dueDate: "2026-07-20" },
      { phase: "최종 테스트", dueDate: "2026-07-26" },
      { phase: "완료", dueDate: "2026-07-31" }
    ]
  );
});

test("returns remaining phase list from current progress", () => {
  assert.deepEqual(getRemainingPhases("실제 제작 시작"), [
    "실제 제작 시작",
    "최종 테스트",
    "완료"
  ]);
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
