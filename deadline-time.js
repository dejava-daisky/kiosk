function pad(value) {
  return String(value).padStart(2, "0");
}

function formatCurrentTime(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("-") + " " + [
    pad(date.getHours()),
    pad(date.getMinutes())
  ].join(":");
}

function formatDeadlineCountdown(now, deadline) {
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "D-day";
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return `D-${days} ${hours}h ${minutes}m`;
}

module.exports = { formatCurrentTime, formatDeadlineCountdown };
