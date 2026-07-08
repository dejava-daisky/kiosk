const test = require("node:test");
const assert = require("node:assert/strict");
const { buildMockActivities } = require("../student-activity");

test("builds mock admin activities for one student", () => {
  const activities = buildMockActivities(
    { id: "kopo69", progress: "완료", comment: "README 보강하시오" },
    new Date(2026, 6, 8, 15, 17, 0)
  );

  assert.deepEqual(activities, [
    {
      time: "2026-07-08 15:11",
      studentId: "KOPO69",
      title: "GitLab 최근 활동 확인",
      detail: "저장된 Git 주소 기준 목업 활동입니다."
    },
    {
      time: "2026-07-08 15:17",
      studentId: "KOPO69",
      title: "진행단계",
      detail: "기획 → 완료"
    },
    {
      time: "2026-07-08 15:17",
      studentId: "KOPO69",
      title: "피드백",
      detail: "README 보강하시오"
    }
  ]);
});
