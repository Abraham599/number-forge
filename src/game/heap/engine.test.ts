import assert from "node:assert/strict";
import { checkHeap, heapAnswer, heapCoach, heapPrompt, showsHeapDots } from "./engine.ts";

assert.equal(heapAnswer(8, 3), "left");
assert.equal(heapAnswer(2, 9), "right");
assert.equal(heapAnswer(5, 5), "same");
assert.equal(checkHeap(8, 3, "left"), true);
assert.equal(checkHeap(8, 3, "right"), false);
assert.equal(checkHeap(5, 5, "same"), true);
assert.equal(checkHeap(5, 5, null), false);
assert.equal(heapPrompt(5, 5), "Are the piles the same?");
assert.equal(heapPrompt(8, 3), "Which pile is more?");
assert.equal(heapCoach(5, 5, null).text, "Tap Same.");
assert.equal(heapCoach(8, 3, null).kind, "compose-ones");
assert.equal(heapCoach(8, 3, "left").kind, "check");
assert.equal(showsHeapDots(9, 4), true);
assert.equal(showsHeapDots(40, 12), false);

console.log("heap engine ok");
