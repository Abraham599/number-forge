import assert from "node:assert/strict";
import { checkSlice, nextFilled, sliceCoach, slicePrompt } from "./engine.ts";

assert.equal(checkSlice(1, 1), true);
assert.equal(checkSlice(2, 1), false);
assert.equal(slicePrompt(1, 2), "Color half.");
assert.equal(slicePrompt(3, 4), "Color 3 of 4.");
assert.equal(sliceCoach(2, 2).kind, "check");
assert.equal(sliceCoach(3, 2).kind, "too-much");
assert.equal(nextFilled(0, 0), 1);
assert.equal(nextFilled(2, 1), 1);
assert.equal(nextFilled(1, 2), 3);

console.log("slice engine ok");
