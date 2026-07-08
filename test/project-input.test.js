const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProjectInput, validateProjectCommentInput } = require("../project-input");

test("accepts project input for one student project", () => {
  assert.deepEqual(
    validateProjectInput({
      studentId: " kopo01 ",
      projectName: " 프로젝트 A ",
      progress: "프로토타입",
      professorFeedback: "README 보강"
    }),
    {
      ok: true,
      project: {
        studentId: "kopo01",
        projectName: "프로젝트 A",
        progress: "프로토타입",
        professorFeedback: "README 보강"
      }
    }
  );
});

test("rejects blank project name", () => {
  assert.deepEqual(
    validateProjectInput({
      studentId: "kopo01",
      projectName: "",
      progress: "기획",
      professorFeedback: ""
    }),
    {
      ok: false,
      error: "프로젝트 이름을 입력하세요."
    }
  );
});

test("accepts public comment input", () => {
  assert.deepEqual(
    validateProjectCommentInput({ comment: "좋아요" }),
    {
      ok: true,
      comment: "좋아요"
    }
  );
});

test("rejects blank public comment input", () => {
  assert.deepEqual(
    validateProjectCommentInput({ comment: "   " }),
    {
      ok: false,
      error: "코멘트를 입력하세요."
    }
  );
});
