const VIEW_EVENT_TYPES = new Set(["detail_view", "mockup_view", "external_open"]);

function validateProjectViewEventInput(input) {
  const eventType = String(input?.eventType || "").trim();

  if (!VIEW_EVENT_TYPES.has(eventType)) {
    return {
      ok: false,
      error: "알 수 없는 조회 이벤트입니다."
    };
  }

  return {
    ok: true,
    event: { eventType }
  };
}

module.exports = {
  VIEW_EVENT_TYPES,
  validateProjectViewEventInput
};
