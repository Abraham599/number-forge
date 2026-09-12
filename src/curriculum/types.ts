export type GradeBand = "k1" | "g23" | "g45";

export type SkillId =
  | "compose-ones"
  | "compose-tens"
  | "compose-to-100"
  | "compose-hundreds"
  | "make-ten"
  | "add-no-regroup"
  | "add-with-regroup"
  | "add-tens"
  | "subtract-no-regroup"
  | "subtract-with-regroup"
  | "compare-heaps"
  | "groups-of"
  | "share-out"
  | "unit-parts"
  | "weave-fluency"
  | "rewind-mix"
  | "repair-mix"
  | "daily-mix";

export type SkillStatus = "not_studied" | "still_learning" | "mastered";

export type LessonMode = "forge" | "weave" | "heap" | "bunch" | "share" | "slice";

export type PlaceValue = 1 | 10 | 100;

export type ForgeBeat =
  | {
      kind: "compose";
      target: number;
      prompt: string;
      allowed: PlaceValue[];
      prefill?: number;
    }
  | {
      kind: "operate";
      start: number;
      delta: number;
      op: "add" | "sub";
      prompt: string;
      allowed: PlaceValue[];
    };

export type ForgeLesson = {
  id: string;
  title: string;
  skillId: SkillId;
  world: "tens-town";
  gradeBands: GradeBand[];
  beats: ForgeBeat[];
};

export type HeapBeat = {
  left: number;
  right: number;
  prompt: string;
};

export type HeapLesson = {
  id: string;
  title: string;
  skillId: SkillId;
  world: "tens-town";
  gradeBands: GradeBand[];
  beats: HeapBeat[];
};

export type BunchBeat = {
  groups: number;
  size: number;
  prompt: string;
};

export type BunchLesson = {
  id: string;
  title: string;
  skillId: SkillId;
  world: "tens-town";
  gradeBands: GradeBand[];
  beats: BunchBeat[];
};

export type ShareBeat = {
  total: number;
  bowls: number;
  prompt: string;
};

export type ShareLesson = {
  id: string;
  title: string;
  skillId: SkillId;
  world: "tens-town";
  gradeBands: GradeBand[];
  beats: ShareBeat[];
};

export type SliceBeat = {
  num: number;
  den: number;
  prompt: string;
};

export type SliceLesson = {
  id: string;
  title: string;
  skillId: SkillId;
  world: "tens-town";
  gradeBands: GradeBand[];
  beats: SliceBeat[];
};

export type TownLesson = ForgeLesson | HeapLesson | BunchLesson | ShareLesson | SliceLesson;

export type WeavePuzzle = {
  id: string;
  skillId: SkillId;
  target: number;
  grid: number[];
  seconds: number;
};

export type WorldNode =
  | {
      id: string;
      kind: "forge";
      lessonId: string;
      label: string;
    }
  | {
      id: string;
      kind: "weave";
      puzzleId: string;
      label: string;
    }
  | {
      id: string;
      kind: "chest";
      label: string;
    };

export type SkillHint = {
  skill_id: SkillId;
  status: SkillStatus;
  stars: number;
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${String(value)}`);
}
