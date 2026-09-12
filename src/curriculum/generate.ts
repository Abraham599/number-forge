import { lessonById } from "@/curriculum/tens-town";
import { heapPrompt } from "@/game/heap/engine";
import { slicePrompt } from "@/game/slice/engine";
import type {
  BunchBeat,
  BunchLesson,
  ForgeBeat,
  ForgeLesson,
  GradeBand,
  HeapBeat,
  HeapLesson,
  ShareBeat,
  ShareLesson,
  SkillHint,
  SkillId,
  SliceBeat,
  SliceLesson,
  WeavePuzzle,
} from "@/curriculum/types";
import { neighbors, WEAVE_SIZE } from "@/game/weave/engine";

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

const SKILL_LESSON: Partial<Record<SkillId, string>> = {
  "compose-ones": "forge-make-7",
  "compose-tens": "forge-make-14",
  "compose-to-100": "forge-make-47",
  "compose-hundreds": "forge-hundreds",
  "make-ten": "forge-make-10",
  "add-no-regroup": "forge-add-no-regroup",
  "add-with-regroup": "forge-47-plus-8",
  "add-tens": "forge-add-tens",
  "subtract-no-regroup": "forge-sub-no-regroup",
  "subtract-with-regroup": "forge-30-minus-6",
};

const MIX_POOL: SkillId[] = [
  "compose-ones",
  "compose-tens",
  "compose-to-100",
  "compose-hundreds",
  "make-ten",
  "add-no-regroup",
  "add-with-regroup",
  "add-tens",
  "subtract-no-regroup",
  "subtract-with-regroup",
];

export function generateForgeLesson(
  lesson: ForgeLesson,
  band: GradeBand,
  seed: number,
  hints: SkillHint[] = [],
): ForgeLesson {
  const rng = mulberry32(seed);
  switch (lesson.skillId) {
    case "compose-ones": {
      const target = pickInt(rng, 4, 9);
      return {
        ...lesson,
        beats: [{ kind: "compose", target, prompt: `Make ${target}.`, allowed: [1] }],
      };
    }
    case "compose-tens": {
      const target = lesson.id === "forge-make-20" ? pickInt(rng, 16, 20) : pickInt(rng, 11, 19);
      return {
        ...lesson,
        beats: [
          {
            kind: "compose",
            target,
            prompt: `Make ${target}.`,
            allowed: [1, 10],
          },
        ],
      };
    }
    case "compose-to-100": {
      const tens = band === "g45" ? pickInt(rng, 3, 8) : pickInt(rng, 2, 7);
      const ones = pickInt(rng, 1, 9);
      const target = tens * 10 + ones;
      return {
        ...lesson,
        beats: [{ kind: "compose", target, prompt: `Make ${target}.`, allowed: [1, 10] }],
      };
    }
    case "compose-hundreds": {
      const hundreds = band === "g45" ? pickInt(rng, 2, 8) : pickInt(rng, 1, 4);
      const tens = pickInt(rng, 1, 8);
      const ones = pickInt(rng, 1, 9);
      const target = hundreds * 100 + tens * 10 + ones;
      return {
        ...lesson,
        beats: [{ kind: "compose", target, prompt: `Make ${target}.`, allowed: [1, 10, 100] }],
      };
    }
    case "add-tens": {
      const ones = pickInt(rng, 1, 9);
      const tens = band === "g45" ? pickInt(rng, 2, 5) : pickInt(rng, 1, 5);
      const hundreds = band === "g45" && rng() > 0.45 ? pickInt(rng, 1, 6) : 0;
      const start = hundreds * 100 + tens * 10 + ones;
      const deltaTens = band === "g45" ? pickInt(rng, 2, 5) : pickInt(rng, 1, 3);
      const delta = deltaTens * 10;
      const canSub = start - delta >= (hundreds > 0 ? 100 : 10);
      const op = canSub && rng() > 0.45 ? "sub" : "add";
      const allowed = hundreds > 0 ? ([1, 10, 100] as const) : ([1, 10] as const);
      const prompt = op === "add" ? `Add ${deltaTens} tens.` : `Take away ${deltaTens} tens.`;
      return {
        ...lesson,
        beats: [
          { kind: "compose", target: start, prompt: `First, make ${start}.`, allowed: [...allowed] },
          {
            kind: "operate",
            start,
            delta,
            op,
            prompt,
            allowed: [...allowed],
          },
        ],
      };
    }
    case "make-ten": {
      const given = pickInt(rng, 1, 9);
      return {
        ...lesson,
        beats: [
          {
            kind: "compose",
            target: 10,
            prompt: `${given} and how many more make 10?`,
            allowed: [1],
            prefill: given,
          },
        ],
      };
    }
    case "add-no-regroup": {
      const ones = pickInt(rng, 1, 7);
      const tens = band === "g45" ? pickInt(rng, 3, 7) : pickInt(rng, 1, 5);
      const start = tens * 10 + ones;
      const delta = pickInt(rng, 1, 9 - ones);
      return {
        ...lesson,
        beats: [
          { kind: "compose", target: start, prompt: `First, make ${start}.`, allowed: [1, 10] },
          {
            kind: "operate",
            start,
            delta,
            op: "add",
            prompt: `Now add ${delta} ones.`,
            allowed: [1, 10],
          },
        ],
      };
    }
    case "add-with-regroup": {
      const ones = pickInt(rng, 3, 8);
      const tens = band === "g45" ? pickInt(rng, 3, 7) : pickInt(rng, 2, 6);
      const start = tens * 10 + ones;
      const need = 10 - ones;
      const delta = pickInt(rng, need, Math.min(9, need + 4));
      return {
        ...lesson,
        beats: [
          { kind: "compose", target: start, prompt: `First, make ${start}.`, allowed: [1, 10] },
          {
            kind: "operate",
            start,
            delta,
            op: "add",
            prompt: `Add ${delta} ones.`,
            allowed: [1, 10],
          },
        ],
      };
    }
    case "subtract-no-regroup": {
      const ones = pickInt(rng, 2, 9);
      const tens = band === "g45" ? pickInt(rng, 3, 7) : pickInt(rng, 1, 5);
      const start = tens * 10 + ones;
      const delta = pickInt(rng, 1, ones);
      return {
        ...lesson,
        beats: [
          { kind: "compose", target: start, prompt: `Make ${start}.`, allowed: [1, 10] },
          {
            kind: "operate",
            start,
            delta,
            op: "sub",
            prompt: `Take away ${delta}.`,
            allowed: [1, 10],
          },
        ],
      };
    }
    case "subtract-with-regroup": {
      const tens = band === "g45" ? pickInt(rng, 3, 7) : pickInt(rng, 2, 5);
      const ones = pickInt(rng, 0, 5);
      const start = tens * 10 + ones;
      const delta = pickInt(rng, ones + 1, Math.min(9, ones + 6));
      return {
        ...lesson,
        beats: [
          { kind: "compose", target: start, prompt: `Make ${start}.`, allowed: [1, 10] },
          {
            kind: "operate",
            start,
            delta,
            op: "sub",
            prompt: `Take away ${delta}.`,
            allowed: [1, 10],
          },
        ],
      };
    }
    case "rewind-mix":
    case "repair-mix":
    case "daily-mix":
      return generateMix(lesson, band, seed, hints);
    case "weave-fluency":
    case "compare-heaps":
    case "groups-of":
    case "share-out":
    case "unit-parts":
      return lesson;
    default: {
      const _exhaustive: never = lesson.skillId;
      return _exhaustive;
    }
  }
}

function generateMix(
  lesson: ForgeLesson,
  band: GradeBand,
  seed: number,
  hints: SkillHint[],
): ForgeLesson {
  const rng = mulberry32(seed);
  const bandSkills = MIX_POOL.filter((skillId) => {
    const templateId = SKILL_LESSON[skillId];
    const template = templateId ? lessonById(templateId) : undefined;
    return Boolean(template?.gradeBands.includes(band));
  });
  const learning = hints
    .filter((row) => bandSkills.includes(row.skill_id) && (row.status === "still_learning" || row.stars < 3))
    .map((row) => row.skill_id);
  const prefer = lesson.skillId === "daily-mix" ? bandSkills : learning.length > 0 ? learning : bandSkills;
  const picked: SkillId[] = [];
  const leftover = [...prefer];
  while (picked.length < 4 && leftover.length > 0) {
    const index = Math.floor(rng() * leftover.length);
    picked.push(leftover.splice(index, 1)[0]!);
  }
  while (picked.length < 4 && bandSkills.length > 0) {
    picked.push(bandSkills[picked.length % bandSkills.length]!);
  }
  const beats: ForgeBeat[] = [];
  picked.forEach((skillId, index) => {
    const templateId = SKILL_LESSON[skillId];
    const template = templateId ? lessonById(templateId) : undefined;
    if (!template) return;
    const generated = generateForgeLesson(template, band, seed + (index + 1) * 97);
    const beat = generated.beats[generated.beats.length - 1];
    if (beat) beats.push(beat);
  });
  return { ...lesson, beats: beats.slice(0, 4) };
}

export function generateHeapLesson(lesson: HeapLesson, band: GradeBand, seed: number): HeapLesson {
  const rng = mulberry32(seed);
  const beats: HeapBeat[] = [];
  const used = new Set<string>();
  let attempts = 0;
  while (beats.length < 3 && attempts < 40) {
    attempts += 1;
    const equal = beats.length === 2 || (beats.length < 2 && rng() < 0.2);
    const { left, right } = heapPair(rng, band, equal);
    const key = `${left}-${right}`;
    if (used.has(key)) continue;
    used.add(key);
    beats.push({ left, right, prompt: heapPrompt(left, right) });
  }
  return { ...lesson, beats };
}

function heapPair(rng: () => number, band: GradeBand, equal: boolean): { left: number; right: number } {
  const left = heapNumber(rng, band);
  if (equal) return { left, right: left };
  let right = heapNumber(rng, band);
  let guard = 0;
  while (right === left && guard < 8) {
    right = heapNumber(rng, band);
    guard += 1;
  }
  if (right === left) {
    right = band === "k1" ? Math.max(1, left - 1) : left + (band === "g45" ? 20 : 7);
  }
  return { left, right };
}

function heapNumber(rng: () => number, band: GradeBand): number {
  switch (band) {
    case "k1":
      return pickInt(rng, 1, 9);
    case "g23":
      return pickInt(rng, 12, 89);
    case "g45":
      return pickInt(rng, 1, 8) * 100 + pickInt(rng, 0, 9) * 10 + pickInt(rng, 0, 9);
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}

export function generateBunchLesson(lesson: BunchLesson, band: GradeBand, seed: number): BunchLesson {
  const rng = mulberry32(seed);
  const beats: BunchBeat[] = [];
  const used = new Set<string>();
  let attempts = 0;
  while (beats.length < 3 && attempts < 40) {
    attempts += 1;
    const size = band === "g45" ? pickInt(rng, 3, 8) : pickInt(rng, 2, 5);
    const groups = band === "g45" ? pickInt(rng, 3, 6) : pickInt(rng, 2, 4);
    const key = `${groups}x${size}`;
    if (used.has(key)) continue;
    used.add(key);
    const total = groups * size;
    beats.push({ groups, size, prompt: `Make ${total} with bunches of ${size}.` });
  }
  return { ...lesson, beats };
}

export function generateShareLesson(lesson: ShareLesson, band: GradeBand, seed: number): ShareLesson {
  const rng = mulberry32(seed);
  const beats: ShareBeat[] = [];
  const used = new Set<string>();
  let attempts = 0;
  while (beats.length < 3 && attempts < 40) {
    attempts += 1;
    const bowls = band === "g45" ? pickInt(rng, 3, 6) : pickInt(rng, 2, 4);
    const each = band === "g45" ? pickInt(rng, 3, 6) : pickInt(rng, 2, 5);
    const key = `${bowls}-${each}`;
    if (used.has(key)) continue;
    used.add(key);
    const total = bowls * each;
    beats.push({ total, bowls, prompt: `Share ${total} into ${bowls} bowls.` });
  }
  return { ...lesson, beats };
}

const SLICE_PARTS: [number, number][] = [
  [1, 2],
  [1, 4],
  [3, 4],
  [1, 3],
  [2, 3],
  [2, 4],
];

export function generateSliceLesson(lesson: SliceLesson, band: GradeBand, seed: number): SliceLesson {
  void band;
  const rng = mulberry32(seed);
  const pool = [...SLICE_PARTS];
  const beats: SliceBeat[] = [];
  while (beats.length < 3 && pool.length > 0) {
    const index = Math.floor(rng() * pool.length);
    const pair = pool.splice(index, 1)[0];
    if (!pair) continue;
    const [num, den] = pair;
    beats.push({ num, den, prompt: slicePrompt(num, den) });
  }
  return { ...lesson, beats };
}

export function generateWeavePuzzle(template: WeavePuzzle, band: GradeBand, seed: number): WeavePuzzle {
  const rng = mulberry32(seed);
  const cells = WEAVE_SIZE * WEAVE_SIZE;
  const length = pickInt(rng, 3, 4);
  const target = band === "g45" ? pickInt(rng, 12, 22) : pickInt(rng, 8, 16);
  const parts = splitTarget(target, length, rng);
  const grid = Array.from({ length: cells }, () => 0);
  let index = pickInt(rng, 0, cells - 1);
  const path = [index];
  grid[index] = parts[0] ?? 1;
  for (let step = 1; step < length; step += 1) {
    const opts = neighbors(index).filter((next) => !path.includes(next));
    if (opts.length === 0) break;
    index = opts[pickInt(rng, 0, opts.length - 1)] ?? index;
    path.push(index);
    grid[index] = parts[step] ?? pickInt(rng, 1, 9);
  }
  for (let i = 0; i < cells; i += 1) {
    if (grid[i] === 0) grid[i] = pickInt(rng, 1, 9);
  }
  const planted = path.reduce((sum, cell) => sum + (grid[cell] ?? 0), 0);
  const seconds = band === "k1" ? 60 : template.seconds;
  return { ...template, grid, target: planted, seconds };
}

function splitTarget(target: number, length: number, rng: () => number): number[] {
  const parts = Array.from({ length }, () => 1);
  let left = target - length;
  while (left > 0) {
    let moved = false;
    for (let i = 0; i < length && left > 0; i += 1) {
      const room = 9 - (parts[i] ?? 1);
      if (room <= 0) continue;
      const add = Math.min(room, left, pickInt(rng, 1, room));
      parts[i] = (parts[i] ?? 1) + add;
      left -= add;
      moved = true;
    }
    if (!moved) break;
  }
  return parts;
}
