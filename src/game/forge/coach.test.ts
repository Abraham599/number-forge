import assert from "node:assert/strict";
import {
  canShowMakeTen,
  forgeCoach,
  hitCopy,
  missCoach,
  needsAddTrade,
  needsBreakTen,
  showsOnesTenFrame,
  visibleCoach,
  weaveCoach,
} from "./coach.ts";
import type { ForgeBeat } from "../../curriculum/types.ts";

const addTrade: ForgeBeat = {
  kind: "operate",
  start: 34,
  delta: 9,
  op: "add",
  prompt: "add",
  allowed: [1, 10],
};

const addEasy: ForgeBeat = {
  kind: "operate",
  start: 32,
  delta: 5,
  op: "add",
  prompt: "add",
  allowed: [1, 10],
};

const takeAway: ForgeBeat = {
  kind: "operate",
  start: 30,
  delta: 6,
  op: "sub",
  prompt: "sub",
  allowed: [1, 10],
};

const composeOnes: ForgeBeat = {
  kind: "compose",
  target: 7,
  prompt: "make",
  allowed: [1],
};

const composeBuild: ForgeBeat = {
  kind: "compose",
  target: 54,
  prompt: "make",
  allowed: [1, 10],
};

assert.equal(needsAddTrade(addTrade), true);
assert.equal(needsAddTrade(composeOnes), false);
assert.equal(needsBreakTen(takeAway), true);
assert.equal(needsBreakTen(addTrade), false);

assert.equal(canShowMakeTen(addTrade, 4), true);
assert.equal(canShowMakeTen(takeAway, 12), false);
assert.equal(canShowMakeTen(composeOnes, 10), true);
assert.equal(showsOnesTenFrame(composeBuild, 5), false);
assert.equal(showsOnesTenFrame(composeOnes, 4), false);
assert.equal(showsOnesTenFrame(addEasy, 2), false);
assert.equal(showsOnesTenFrame(addTrade, 4), true);
assert.equal(showsOnesTenFrame(composeBuild, 10), true);

assert.equal(forgeCoach({ beat: addTrade, ones: 4, tens: 3, total: 34, target: 43 }).kind, "fill-ones");
assert.equal(forgeCoach({ beat: addTrade, ones: 13, tens: 3, total: 43, target: 43 }).kind, "make-ten");
assert.equal(forgeCoach({ beat: addTrade, ones: 3, tens: 4, total: 43, target: 43 }).kind, "check");
assert.equal(forgeCoach({ beat: takeAway, ones: 0, tens: 3, total: 30, target: 24 }).kind, "break-ten");
assert.equal(forgeCoach({ beat: takeAway, ones: 10, tens: 2, total: 30, target: 24 }).kind, "take-ones");
assert.equal(forgeCoach({ beat: composeOnes, ones: 4, tens: 0, total: 4, target: 7 }).kind, "compose-ones");
assert.equal(forgeCoach({ beat: composeOnes, ones: 4, tens: 0, total: 4, target: 7 }).text.includes("more"), false);
assert.equal(forgeCoach({ beat: composeBuild, ones: 0, tens: 0, total: 0, target: 54 }).formula, undefined);
assert.equal(forgeCoach({ beat: composeBuild, ones: 0, tens: 0, total: 0, target: 54 }).kind, "compose-tens");
assert.equal(forgeCoach({ beat: composeBuild, ones: 0, tens: 5, total: 50, target: 54 }).kind, "compose-ones");
assert.equal(forgeCoach({ beat: composeBuild, ones: 8, tens: 5, total: 58, target: 54 }).kind, "too-much");
assert.equal(forgeCoach({ beat: addEasy, ones: 2, tens: 3, total: 32, target: 37 }).kind, "compose-ones");
assert.match(
  forgeCoach({ beat: addTrade, ones: 0, tens: 4, total: 40, target: 43 }).text,
  /Tap \+1/,
);

assert.match(missCoach({ beat: addTrade, ones: 4, tens: 3, total: 34, target: 43 }), /ones box/);
assert.match(missCoach({ beat: takeAway, ones: 0, tens: 3, total: 30, target: 24 }), /Break a ten/);
assert.match(missCoach({ beat: composeBuild, ones: 4, tens: 6, total: 64, target: 54 }), /Too many/);

assert.equal(weaveCoach({ sum: 0, target: 12, pathLength: 0 }).text.includes("neighbor"), true);
assert.equal(weaveCoach({ sum: 15, target: 12, pathLength: 3 }).kind, "too-much");
assert.equal(weaveCoach({ sum: 8, target: 12, pathLength: 2 }).kind, "fill-ones");
assert.equal(hitCopy(5, 4, 54), "5 tens and 4 ones make 54.");
assert.equal(hitCopy(4, 7, 247, 2), "2 hundreds, 4 tens and 7 ones make 247.");

const addTens: ForgeBeat = {
  kind: "operate",
  start: 32,
  delta: 20,
  op: "add",
  prompt: "Add 2 tens.",
  allowed: [1, 10],
};
assert.equal(needsAddTrade(addTens), false);
assert.equal(forgeCoach({ beat: addTens, ones: 2, tens: 3, total: 32, target: 52 }).kind, "compose-tens");

const composeHundreds: ForgeBeat = {
  kind: "compose",
  target: 247,
  prompt: "Make 247.",
  allowed: [1, 10, 100],
};
assert.equal(
  forgeCoach({ beat: composeHundreds, ones: 0, tens: 0, hundreds: 0, total: 0, target: 247 }).kind,
  "compose-hundreds",
);
assert.equal(
  forgeCoach({ beat: composeHundreds, ones: 0, tens: 0, hundreds: 2, total: 200, target: 247 }).kind,
  "compose-tens",
);

const startTens = forgeCoach({ beat: composeBuild, ones: 0, tens: 0, total: 0, target: 63 });
const midOnes = forgeCoach({ beat: composeBuild, ones: 5, tens: 0, total: 5, target: 63 });
assert.equal(startTens.kind, "compose-tens");
assert.equal(midOnes.kind, "compose-tens");
assert.equal(
  visibleCoach(startTens, { introduce: true, moved: false, missed: false, idle: false, asked: false }).kind,
  "compose-tens",
);
assert.equal(
  visibleCoach(midOnes, { introduce: true, moved: true, missed: false, idle: false, asked: false }).kind,
  "idle",
);
assert.equal(
  visibleCoach(midOnes, { introduce: false, moved: false, missed: false, idle: false, asked: false }).kind,
  "idle",
);
assert.equal(
  visibleCoach(midOnes, { introduce: false, moved: true, missed: true, idle: false, asked: false }).kind,
  "compose-tens",
);
assert.equal(
  visibleCoach(midOnes, { introduce: false, moved: true, missed: false, idle: false, asked: true }).kind,
  "compose-tens",
);
assert.equal(
  visibleCoach(
    forgeCoach({ beat: addTrade, ones: 13, tens: 3, total: 43, target: 43 }),
    { introduce: false, moved: true, missed: false, idle: false, asked: false },
  ).kind,
  "make-ten",
);
assert.equal(
  visibleCoach(weaveCoach({ sum: 8, target: 12, pathLength: 2 }), {
    introduce: false,
    moved: true,
    missed: false,
    idle: false,
    asked: false,
  }).kind,
  "idle",
);

console.log("forge coach ok");
