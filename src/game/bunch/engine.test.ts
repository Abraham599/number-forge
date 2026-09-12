import assert from "node:assert/strict";
import {
  bunchCoach,
  bunchFormula,
  bunchTotal,
  checkBunch,
  checkShare,
  shareCoach,
  shareEach,
  shareLeft,
} from "./engine.ts";

assert.equal(bunchTotal(4, 3), 12);
assert.equal(checkBunch(4, 4), true);
assert.equal(checkBunch(3, 4), false);
assert.equal(bunchFormula(3, 4), "4 + 4 + 4 = 12");
assert.equal(bunchCoach(4, 4).kind, "check");
assert.equal(bunchCoach(5, 4).kind, "too-much");
assert.equal(bunchCoach(2, 4).text, "Tap + bunch.");

assert.equal(shareEach(12, 3), 4);
assert.equal(checkShare([4, 4, 4], 12), true);
assert.equal(checkShare([5, 4, 3], 12), false);
assert.equal(checkShare([4, 4], 12), false);
assert.equal(shareLeft([2, 1, 0], 12), 9);
assert.equal(shareCoach([0, 0, 0], 12).text, "Tap a bowl to share one.");
assert.equal(shareCoach([4, 4, 4], 12).kind, "check");

console.log("bunch engine ok");
