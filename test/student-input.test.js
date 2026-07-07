const test = require("node:test");
const assert = require("node:assert/strict");
const { validateStudentInput } = require("../student-input");

test("accepts id and one of the five progress options", () => {
  assert.deepEqual(validateStudentInput({ id: " kopo01 ", progress: "프로토타입" }), {
    ok: true,
    student: {
      id: "kopo01",
      progress: "프로토타입"
    }
  });
});

test("rejects blank id", () => {
  assert.deepEqual(validateStudentInput({ id: "", progress: "프로토타입" }), {
    ok: false,
    error: "id를 입력하세요."
  });
});

test("rejects progress outside the five options", () => {
  assert.deepEqual(validateStudentInput({ id: "kopo01", progress: "아무거나" }), {
    ok: false,
    error: "진행상황을 선택하세요."
  });
});
