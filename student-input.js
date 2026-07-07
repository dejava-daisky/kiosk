const PROGRESS_OPTIONS = [
  "기획",
  "프로토타입",
  "실제 제작 시작",
  "최종 테스트",
  "완료"
];

function validateStudentInput(input) {
  const id = String(input.id ?? "").trim();
  const progress = String(input.progress ?? "").trim();

  if (!id) {
    return { ok: false, error: "id를 입력하세요." };
  }

  if (!PROGRESS_OPTIONS.includes(progress)) {
    return { ok: false, error: "진행상황을 선택하세요." };
  }

  return { ok: true, student: { id, progress } };
}

module.exports = { PROGRESS_OPTIONS, validateStudentInput };
