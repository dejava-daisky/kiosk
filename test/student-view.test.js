const test = require("node:test");
const assert = require("node:assert/strict");
const { mapStudentRows } = require("../student-view");

test("maps simple student rows into kiosk display rows", () => {
  const rows = [
    {
      id: "kopo01",
      progress: "80%"
    },
    {
      id: "kopo02",
      progress: "기획서 작성 중"
    }
  ];

  assert.deepEqual(mapStudentRows(rows), [
    {
      id: "kopo01",
      progress: "80%"
    },
    {
      id: "kopo02",
      progress: "기획서 작성 중"
    }
  ]);
});

test("keeps progress as display text because database column is varchar", () => {
  const rows = [{ id: "kopo03", progress: "핵심 기능 구현 60%" }];

  assert.deepEqual(mapStudentRows(rows), [
    {
      id: "kopo03",
      progress: "핵심 기능 구현 60%"
    }
  ]);
});

test("maps optional admin comment for kiosk feedback display", () => {
  const rows = [{ id: "kopo04", progress: "기획", comment: "README 보강하시오" }];

  assert.deepEqual(mapStudentRows(rows), [
    {
      id: "kopo04",
      progress: "기획",
      comment: "README 보강하시오"
    }
  ]);
});
