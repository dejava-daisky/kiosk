const test = require("node:test");
const assert = require("node:assert/strict");
const { formatCurrentTime, formatDeadlineCountdown } = require("../deadline-time");

test("formats current time for dashboard display", () => {
  assert.equal(
    formatCurrentTime(new Date(2026, 6, 15, 8, 7, 9)),
    "2026-07-15 08:07"
  );
});

test("formats remaining deadline as D-day hour minute countdown", () => {
  assert.equal(
    formatDeadlineCountdown(
      new Date(2026, 6, 15, 8, 47, 0),
      new Date(2026, 6, 31, 23, 59, 59)
    ),
    "D-16 15h 12m"
  );
});
