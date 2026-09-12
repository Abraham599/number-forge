import assert from "node:assert/strict";
import {
  generateBunchLesson,
  generateForgeLesson,
  generateHeapLesson,
  generateShareLesson,
  generateSliceLesson,
  generateWeavePuzzle,
} from "./generate.ts";
import {
  bunchLessonById,
  heapLessonById,
  lessonById,
  puzzleById,
  shareLessonById,
  sliceLessonById,
  worldPath,
} from "./tens-town.ts";
import { isWinningPath, neighbors } from "../game/weave/engine.ts";

function ones(n: number): number {
  return n % 10;
}

for (let seed = 1; seed <= 40; seed += 1) {
  const onesLesson = generateForgeLesson(lessonById("forge-make-7")!, "g23", seed);
  const onesTarget = onesLesson.beats[0];
  assert.equal(onesTarget?.kind, "compose");
  if (onesTarget?.kind === "compose") {
    assert.ok(onesTarget.target >= 4 && onesTarget.target <= 9);
    assert.deepEqual(onesTarget.allowed, [1]);
  }

  const teen = generateForgeLesson(lessonById("forge-make-14")!, "g23", seed);
  const teenBeat = teen.beats[0];
  assert.equal(teenBeat?.kind, "compose");
  if (teenBeat?.kind === "compose") {
    assert.ok(teenBeat.target >= 11 && teenBeat.target <= 19);
  }

  const twenty = generateForgeLesson(lessonById("forge-make-20")!, "k1", seed);
  const twentyBeat = twenty.beats[0];
  assert.equal(twentyBeat?.kind, "compose");
  if (twentyBeat?.kind === "compose") {
    assert.ok(twentyBeat.target >= 16 && twentyBeat.target <= 20);
  }

  const build = generateForgeLesson(lessonById("forge-make-47")!, "g23", seed);
  const buildBeat = build.beats[0];
  assert.equal(buildBeat?.kind, "compose");
  if (buildBeat?.kind === "compose") {
    assert.ok(buildBeat.target >= 21 && buildBeat.target <= 79);
    assert.notEqual(buildBeat.target % 10, 0);
  }

  const add = generateForgeLesson(lessonById("forge-47-plus-8")!, "g23", seed);
  const addOp = add.beats[1];
  assert.equal(addOp?.kind, "operate");
  if (addOp?.kind === "operate") {
    assert.equal(addOp.op, "add");
    assert.ok(ones(addOp.start) + addOp.delta >= 10, `add must trade ones: ${addOp.start}+${addOp.delta}`);
    assert.match(addOp.prompt, /ones/);
    assert.doesNotMatch(addOp.prompt, /[Rr]egroup/);
  }

  const makeTen = generateForgeLesson(lessonById("forge-make-10")!, "g23", seed);
  const tenBeat = makeTen.beats[0];
  assert.equal(tenBeat?.kind, "compose");
  if (tenBeat?.kind === "compose") {
    assert.equal(tenBeat.target, 10);
    assert.ok((tenBeat.prefill ?? 0) >= 1 && (tenBeat.prefill ?? 0) <= 9);
    assert.deepEqual(tenBeat.allowed, [1]);
  }

  const addEasy = generateForgeLesson(lessonById("forge-add-no-regroup")!, "g23", seed);
  const addEasyOp = addEasy.beats[1];
  assert.equal(addEasyOp?.kind, "operate");
  if (addEasyOp?.kind === "operate") {
    assert.equal(addEasyOp.op, "add");
    assert.ok(ones(addEasyOp.start) + addEasyOp.delta < 10, `add must stay in ones: ${addEasyOp.start}+${addEasyOp.delta}`);
  }

  const sub = generateForgeLesson(lessonById("forge-30-minus-6")!, "g23", seed);
  const subOp = sub.beats[1];
  assert.equal(subOp?.kind, "operate");
  if (subOp?.kind === "operate") {
    assert.equal(subOp.op, "sub");
    assert.ok(ones(subOp.start) < subOp.delta, `sub must break a ten: ${subOp.start}-${subOp.delta}`);
  }

  const subEasy = generateForgeLesson(lessonById("forge-sub-no-regroup")!, "g23", seed);
  const subEasyOp = subEasy.beats[1];
  assert.equal(subEasyOp?.kind, "operate");
  if (subEasyOp?.kind === "operate") {
    assert.equal(subEasyOp.op, "sub");
    assert.ok(ones(subEasyOp.start) >= subEasyOp.delta, `sub must not break a ten: ${subEasyOp.start}-${subEasyOp.delta}`);
  }

  const rewind = generateForgeLesson(lessonById("forge-rewind")!, "g23", seed, []);
  assert.equal(rewind.beats.length, 4);

  const hundreds = generateForgeLesson(lessonById("forge-hundreds")!, "g23", seed);
  const hundredsBeat = hundreds.beats[0];
  assert.equal(hundredsBeat?.kind, "compose");
  if (hundredsBeat?.kind === "compose") {
    assert.ok(hundredsBeat.target >= 111 && hundredsBeat.target <= 489);
    assert.deepEqual(hundredsBeat.allowed, [1, 10, 100]);
  }

  const addTens = generateForgeLesson(lessonById("forge-add-tens")!, "g23", seed);
  const addTensOp = addTens.beats[1];
  assert.equal(addTensOp?.kind, "operate");
  if (addTensOp?.kind === "operate") {
    assert.equal(addTensOp.delta % 10, 0);
    assert.ok(addTensOp.delta >= 10 && addTensOp.delta <= 30);
    assert.match(addTensOp.prompt, /tens/);
  }

  const heap = generateHeapLesson(heapLessonById("heap-compare")!, "k1", seed);
  assert.equal(heap.beats.length, 3);
  assert.ok(heap.beats.some((beat) => beat.left === beat.right));
  assert.ok(heap.beats.every((beat) => beat.left >= 1 && beat.left <= 9));

  const bunch = generateBunchLesson(bunchLessonById("bunch-groups")!, "g23", seed);
  assert.equal(bunch.beats.length, 3);
  assert.ok(bunch.beats.every((beat) => beat.groups * beat.size >= 4));

  const share = generateShareLesson(shareLessonById("share-out")!, "g23", seed);
  assert.equal(share.beats.length, 3);
  assert.ok(share.beats.every((beat) => beat.total % beat.bowls === 0));

  const slice = generateSliceLesson(sliceLessonById("slice-parts")!, "g45", seed);
  assert.equal(slice.beats.length, 3);
  assert.ok(slice.beats.every((beat) => beat.num > 0 && beat.num <= beat.den));

  const weave = generateWeavePuzzle(puzzleById("weave-12")!, "g23", seed);
  assert.equal(weave.grid.length, 16);
  assert.ok(weave.grid.every((cell) => cell >= 1 && cell <= 9));
  const hasWin = weave.grid.some((_, start) => walkWins(weave.grid, start, weave.target));
  assert.ok(hasWin, `weave seed ${seed} has no winning path to ${weave.target}`);
}

const a = generateForgeLesson(lessonById("forge-make-47")!, "g23", 99);
const b = generateForgeLesson(lessonById("forge-make-47")!, "g23", 99);
assert.deepEqual(a.beats, b.beats);

const g23 = worldPath("g23");
assert.equal(g23[0] && g23[0].kind === "forge" ? g23[0].lessonId : "", "forge-make-47");
assert.ok(g23.some((node) => node.kind === "forge" && node.lessonId === "heap-compare"));
assert.ok(g23.some((node) => node.kind === "forge" && node.lessonId === "bunch-groups"));
assert.ok(worldPath("g45").some((node) => node.kind === "forge" && node.lessonId === "slice-parts"));
assert.ok(worldPath("k1").some((node) => node.kind === "forge" && node.lessonId === "heap-compare"));

console.log("generate ok");

function walkWins(grid: number[], start: number, target: number): boolean {
  const stack: number[][] = [[start]];
  while (stack.length) {
    const path = stack.pop()!;
    if (isWinningPath(grid, path, target)) return true;
    if (path.length >= 4) continue;
    const last = path[path.length - 1]!;
    for (const next of neighbors(last)) {
      if (path.includes(next)) continue;
      stack.push([...path, next]);
    }
  }
  return false;
}
