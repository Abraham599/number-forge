import type {
  BunchLesson,
  ForgeLesson,
  GradeBand,
  HeapLesson,
  LessonMode,
  ShareLesson,
  SkillId,
  SliceLesson,
  TownLesson,
  WeavePuzzle,
  WorldNode,
} from "@/curriculum/types";

export const SKILL_LABELS: Record<SkillId, string> = {
  "compose-ones": "Make ones",
  "compose-tens": "Make a teen",
  "compose-to-100": "Build a number",
  "compose-hundreds": "Hundreds",
  "make-ten": "Make 10",
  "add-no-regroup": "Add",
  "add-with-regroup": "Trade 10 ones",
  "add-tens": "Add tens",
  "subtract-no-regroup": "Take away",
  "subtract-with-regroup": "Break a ten",
  "compare-heaps": "Which pile",
  "groups-of": "Bunches",
  "share-out": "Share",
  "unit-parts": "Parts",
  "weave-fluency": "Number Weave",
  "rewind-mix": "Rewind",
  "repair-mix": "Repair",
  "daily-mix": "Keep sharp",
};

export const GRADE_BANDS: {
  id: GradeBand;
  title: string;
  ages: string;
  blurb: string;
}[] = [
  { id: "k1", title: "K–1", ages: "Ones and teens", blurb: "Start with small numbers. Which pile is more?" },
  { id: "g23", title: "2–3", ages: "Tens Town", blurb: "Build to 100. Trade. Then bunches and share." },
  { id: "g45", title: "4–5", ages: "Hundreds and parts", blurb: "Hundreds, bunches, share, and color parts." },
];

const ALL_BANDS: GradeBand[] = ["k1", "g23", "g45"];
const UPPER: GradeBand[] = ["g23", "g45"];

/** Lesson IDs stay fixed for progress. Play screens generate a fresh target each entry. */
export const FORGE_LESSONS: ForgeLesson[] = [
  {
    id: "forge-make-7",
    title: "Ones",
    skillId: "compose-ones",
    world: "tens-town",
    gradeBands: ALL_BANDS,
    beats: [{ kind: "compose", target: 7, prompt: "Make 7.", allowed: [1] }],
  },
  {
    id: "forge-make-10",
    title: "Make 10",
    skillId: "make-ten",
    world: "tens-town",
    gradeBands: ALL_BANDS,
    beats: [{ kind: "compose", target: 10, prompt: "4 and how many more make 10?", allowed: [1], prefill: 4 }],
  },
  {
    id: "forge-make-14",
    title: "Teens",
    skillId: "compose-tens",
    world: "tens-town",
    gradeBands: ALL_BANDS,
    beats: [{ kind: "compose", target: 14, prompt: "Make 14.", allowed: [1, 10] }],
  },
  {
    id: "forge-make-20",
    title: "Tens",
    skillId: "compose-tens",
    world: "tens-town",
    gradeBands: ["k1"],
    beats: [{ kind: "compose", target: 20, prompt: "Make 20.", allowed: [1, 10] }],
  },
  {
    id: "forge-make-47",
    title: "Build",
    skillId: "compose-to-100",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [{ kind: "compose", target: 47, prompt: "Make 47.", allowed: [1, 10] }],
  },
  {
    id: "forge-add-no-regroup",
    title: "Add",
    skillId: "add-no-regroup",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [
      { kind: "compose", target: 32, prompt: "First, make 32.", allowed: [1, 10] },
      { kind: "operate", start: 32, delta: 5, op: "add", prompt: "Now add 5 ones.", allowed: [1, 10] },
    ],
  },
  {
    id: "forge-47-plus-8",
    title: "Trade 10",
    skillId: "add-with-regroup",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [
      { kind: "compose", target: 47, prompt: "First, make 47.", allowed: [1, 10] },
      {
        kind: "operate",
        start: 47,
        delta: 8,
        op: "add",
        prompt: "Add 8 ones.",
        allowed: [1, 10],
      },
    ],
  },
  {
    id: "forge-hundreds",
    title: "Hundreds",
    skillId: "compose-hundreds",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [{ kind: "compose", target: 247, prompt: "Make 247.", allowed: [1, 10, 100] }],
  },
  {
    id: "forge-add-tens",
    title: "Add tens",
    skillId: "add-tens",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [
      { kind: "compose", target: 32, prompt: "First, make 32.", allowed: [1, 10] },
      { kind: "operate", start: 32, delta: 20, op: "add", prompt: "Add 2 tens.", allowed: [1, 10] },
    ],
  },
  {
    id: "forge-sub-no-regroup",
    title: "Take away",
    skillId: "subtract-no-regroup",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [
      { kind: "compose", target: 38, prompt: "Make 38.", allowed: [1, 10] },
      { kind: "operate", start: 38, delta: 6, op: "sub", prompt: "Take away 6.", allowed: [1, 10] },
    ],
  },
  {
    id: "forge-30-minus-6",
    title: "Break ten",
    skillId: "subtract-with-regroup",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [
      { kind: "compose", target: 30, prompt: "Make 30.", allowed: [1, 10] },
      {
        kind: "operate",
        start: 30,
        delta: 6,
        op: "sub",
        prompt: "Take away 6.",
        allowed: [1, 10],
      },
    ],
  },
  {
    id: "forge-rewind",
    title: "Rewind",
    skillId: "rewind-mix",
    world: "tens-town",
    gradeBands: ALL_BANDS,
    beats: [],
  },
  {
    id: "forge-repair",
    title: "Repair",
    skillId: "repair-mix",
    world: "tens-town",
    gradeBands: ALL_BANDS,
    beats: [],
  },
  {
    id: "forge-daily",
    title: "Keep sharp",
    skillId: "daily-mix",
    world: "tens-town",
    gradeBands: ALL_BANDS,
    beats: [],
  },
];

export const HEAP_LESSONS: HeapLesson[] = [
  {
    id: "heap-compare",
    title: "Heaps",
    skillId: "compare-heaps",
    world: "tens-town",
    gradeBands: ALL_BANDS,
    beats: [
      { left: 8, right: 3, prompt: "Which pile is more?" },
      { left: 2, right: 7, prompt: "Which pile is more?" },
      { left: 5, right: 5, prompt: "Are the piles the same?" },
    ],
  },
];

export const BUNCH_LESSONS: BunchLesson[] = [
  {
    id: "bunch-groups",
    title: "Bunches",
    skillId: "groups-of",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [{ groups: 4, size: 3, prompt: "Make 12 with bunches of 3." }],
  },
];

export const SHARE_LESSONS: ShareLesson[] = [
  {
    id: "share-out",
    title: "Share",
    skillId: "share-out",
    world: "tens-town",
    gradeBands: UPPER,
    beats: [{ total: 12, bowls: 3, prompt: "Share 12 into 3 bowls." }],
  },
];

export const SLICE_LESSONS: SliceLesson[] = [
  {
    id: "slice-parts",
    title: "Parts",
    skillId: "unit-parts",
    world: "tens-town",
    gradeBands: ["g45"],
    beats: [{ num: 1, den: 2, prompt: "Color half." }],
  },
];

export const WEAVE_PUZZLES: WeavePuzzle[] = [
  {
    id: "weave-12",
    skillId: "weave-fluency",
    target: 12,
    seconds: 45,
    grid: [3, 8, 1, 4, 5, 2, 7, 6, 4, 1, 9, 3, 2, 6, 5, 8],
  },
  {
    id: "weave-15",
    skillId: "weave-fluency",
    target: 15,
    seconds: 45,
    grid: [9, 2, 4, 1, 6, 5, 3, 8, 7, 1, 4, 2, 5, 3, 6, 9],
  },
];

const PATH_LESSONS: Record<GradeBand, string[]> = {
  k1: ["forge-make-7", "forge-make-10", "forge-make-14", "forge-make-20", "heap-compare"],
  g23: [
    "forge-make-47",
    "forge-add-no-regroup",
    "forge-47-plus-8",
    "forge-make-7",
    "forge-make-14",
    "forge-make-10",
    "forge-sub-no-regroup",
    "forge-30-minus-6",
    "forge-hundreds",
    "forge-add-tens",
    "heap-compare",
    "bunch-groups",
    "share-out",
  ],
  g45: [
    "forge-make-47",
    "forge-add-no-regroup",
    "forge-47-plus-8",
    "forge-hundreds",
    "forge-add-tens",
    "heap-compare",
    "bunch-groups",
    "share-out",
    "slice-parts",
    "forge-sub-no-regroup",
    "forge-30-minus-6",
  ],
};

/** Weave sits after the first operate-add on 2–5, after teens on K–1. */
const WEAVE_AFTER: Record<GradeBand, number> = {
  k1: 3,
  g23: 3,
  g45: 3,
};

export function playForSkill(skillId: SkillId): LessonMode {
  switch (skillId) {
    case "compare-heaps":
      return "heap";
    case "groups-of":
      return "bunch";
    case "share-out":
      return "share";
    case "unit-parts":
      return "slice";
    case "weave-fluency":
      return "weave";
    case "compose-ones":
    case "compose-tens":
    case "compose-to-100":
    case "compose-hundreds":
    case "make-ten":
    case "add-no-regroup":
    case "add-with-regroup":
    case "add-tens":
    case "subtract-no-regroup":
    case "subtract-with-regroup":
    case "rewind-mix":
    case "repair-mix":
    case "daily-mix":
      return "forge";
    default: {
      const _exhaustive: never = skillId;
      return _exhaustive;
    }
  }
}

export function townLessonById(id: string): TownLesson | undefined {
  return (
    FORGE_LESSONS.find((lesson) => lesson.id === id) ??
    HEAP_LESSONS.find((lesson) => lesson.id === id) ??
    BUNCH_LESSONS.find((lesson) => lesson.id === id) ??
    SHARE_LESSONS.find((lesson) => lesson.id === id) ??
    SLICE_LESSONS.find((lesson) => lesson.id === id)
  );
}

export function lessonsForBand(band: GradeBand): TownLesson[] {
  return PATH_LESSONS[band]
    .map((id) => townLessonById(id))
    .filter((lesson): lesson is TownLesson => Boolean(lesson));
}

export function worldPath(band: GradeBand): WorldNode[] {
  const lessons = lessonsForBand(band);
  const puzzleId = band === "g45" ? "weave-15" : "weave-12";
  const weaveAfter = WEAVE_AFTER[band];
  const nodes: WorldNode[] = [];
  lessons.forEach((lesson, index) => {
    if (index === weaveAfter) {
      nodes.push({ id: "node-weave-daily", kind: "weave", puzzleId, label: "Weave" });
    }
    nodes.push({
      id: `node-${lesson.id}`,
      kind: "forge",
      lessonId: lesson.id,
      label: lesson.title,
    });
  });
  if (lessons.length === weaveAfter) {
    nodes.push({ id: "node-weave-daily", kind: "weave", puzzleId, label: "Weave" });
  }
  nodes.push({ id: "node-rewind", kind: "forge", lessonId: "forge-rewind", label: "Rewind" });
  nodes.push({ id: "node-chest", kind: "chest", label: "Chest" });
  return nodes;
}

export function lessonById(id: string): ForgeLesson | undefined {
  return FORGE_LESSONS.find((lesson) => lesson.id === id);
}

export function heapLessonById(id: string): HeapLesson | undefined {
  return HEAP_LESSONS.find((lesson) => lesson.id === id);
}

export function bunchLessonById(id: string): BunchLesson | undefined {
  return BUNCH_LESSONS.find((lesson) => lesson.id === id);
}

export function shareLessonById(id: string): ShareLesson | undefined {
  return SHARE_LESSONS.find((lesson) => lesson.id === id);
}

export function sliceLessonById(id: string): SliceLesson | undefined {
  return SLICE_LESSONS.find((lesson) => lesson.id === id);
}

export function puzzleById(id: string): WeavePuzzle | undefined {
  return WEAVE_PUZZLES.find((puzzle) => puzzle.id === id);
}

export function isMixLesson(id: string): boolean {
  return id === "forge-rewind" || id === "forge-repair" || id === "forge-daily";
}

export function targetForBeat(beat: ForgeLesson["beats"][number]): number {
  switch (beat.kind) {
    case "compose":
      return beat.target;
    case "operate":
      return beat.op === "add" ? beat.start + beat.delta : beat.start - beat.delta;
    default: {
      const _exhaustive: never = beat;
      return _exhaustive;
    }
  }
}
