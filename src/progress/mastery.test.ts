import assert from "node:assert/strict";
import { nextSkillStatus, starsFromLesson } from "./mastery.ts";

assert.equal(nextSkillStatus({ plays: 1, accuracy: 1, bestStars: 3 }), "mastered");
assert.equal(nextSkillStatus({ plays: 1, accuracy: 1, bestStars: 2 }), "still_learning");

assert.equal(
  starsFromLesson({ correctBeats: 1, totalBeats: 1, durationMs: 200_000 }),
  3,
);
assert.equal(
  starsFromLesson({ correctBeats: 1, totalBeats: 1, durationMs: 20_000 }),
  3,
);
assert.equal(
  starsFromLesson({ correctBeats: 2, totalBeats: 3, durationMs: 10_000 }),
  2,
);
assert.equal(
  starsFromLesson({ correctBeats: 1, totalBeats: 4, durationMs: 10_000 }),
  1,
);

console.log("mastery ok");
