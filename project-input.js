const PROGRESS_OPTIONS = [
  "기획",
  "프로토타입",
  "실제 제작 시작",
  "최종 테스트",
  "완료"
];

function validateProjectInput(input) {
  const studentId = String(input.studentId ?? "").trim();
  const projectName = String(input.projectName ?? "").trim();
  const progress = String(input.progress ?? "").trim();
  const professorFeedback = String(input.professorFeedback ?? "").trim();

  if (!studentId) {
    return { ok: false, error: "학생 ID를 입력하세요." };
  }

  if (!projectName) {
    return { ok: false, error: "프로젝트 이름을 입력하세요." };
  }

  if (!PROGRESS_OPTIONS.includes(progress)) {
    return { ok: false, error: "진행상황을 선택하세요." };
  }

  return {
    ok: true,
    project: {
      studentId,
      projectName,
      progress,
      professorFeedback
    }
  };
}

function validateProjectCommentInput(input) {
  const comment = String(input.comment ?? "").trim();

  if (!comment) {
    return { ok: false, error: "코멘트를 입력하세요." };
  }

  return { ok: true, comment };
}

module.exports = {
  PROGRESS_OPTIONS,
  validateProjectInput,
  validateProjectCommentInput
};
