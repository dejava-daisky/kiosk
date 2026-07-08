const RECOMMENDED_PHASES = [
  "기획",
  "프로토타입",
  "실제 제작 시작",
  "최종 테스트",
  "최종 정리"
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("-");
}

function parseLocalDate(dateText) {
  const match = String(dateText ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null;
  }

  return date;
}

function buildRecommendedSchedule(now, deadlineText) {
  const deadline = parseLocalDate(deadlineText);
  if (!deadline) return [];

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const remainingDays = Math.max(0, Math.ceil((end - today) / 86400000));

  if (remainingDays === 0) {
    return RECOMMENDED_PHASES.map((phase) => ({ phase, dueDate: formatDate(end) }));
  }

  return RECOMMENDED_PHASES.map((phase, index) => {
    const offset = Math.ceil(((index + 1) * remainingDays) / RECOMMENDED_PHASES.length);
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + offset);

    if (dueDate > end) {
      return { phase, dueDate: formatDate(end) };
    }

    return { phase, dueDate: formatDate(dueDate) };
  });
}

function validateDeadlineInput(input) {
  const deadline = String(input.deadline ?? "").trim();

  if (!parseLocalDate(deadline)) {
    return { ok: false, error: "최종 마감일을 선택하세요." };
  }

  return { ok: true, deadline };
}

module.exports = {
  RECOMMENDED_PHASES,
  buildRecommendedSchedule,
  formatDate,
  parseLocalDate,
  validateDeadlineInput
};
