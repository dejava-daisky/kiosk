function pad(value) {
  return String(value).padStart(2, "0");
}

function formatMinute(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("-") + " " + [
    pad(date.getHours()),
    pad(date.getMinutes())
  ].join(":");
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function buildMockActivities(student, now = new Date()) {
  const studentId = String(student.id ?? "").toUpperCase();
  const progress = String(student.progress ?? "기획");
  const comment = String(student.comment ?? "").trim();

  const activities = [
    {
      time: formatMinute(addMinutes(now, -6)),
      studentId,
      title: "GitLab 최근 활동 확인",
      detail: "저장된 Git 주소 기준 목업 활동입니다."
    },
    {
      time: formatMinute(now),
      studentId,
      title: "진행단계",
      detail: `기획 → ${progress}`
    }
  ];

  if (comment) {
    activities.push({
      time: formatMinute(now),
      studentId,
      title: "피드백",
      detail: comment
    });
  }

  return activities;
}

module.exports = { buildMockActivities };
