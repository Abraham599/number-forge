import assert from "node:assert/strict";
import { currentWeekMarks, localDateKey, localDateKeyFromIso, streakCount } from "./dates.ts";

const friday = new Date(2026, 8, 4, 13, 20, 0);
assert.equal(localDateKey(friday), "2026-09-04");
assert.equal(localDateKeyFromIso("2026-09-03T22:30:00.000Z"), localDateKey(new Date("2026-09-03T22:30:00.000Z")));
assert.equal(localDateKeyFromIso("2026-09-04"), "2026-09-04");

const week = currentWeekMarks(["2026-09-04"], friday);
assert.deepEqual(week, [false, false, false, false, true, false, false]);

assert.equal(streakCount(["2026-09-04"], friday), 1);
assert.equal(streakCount(["2026-09-03", "2026-09-04"], friday), 2);
assert.equal(streakCount(["2026-09-02"], friday), 0);

console.log("dates ok");
