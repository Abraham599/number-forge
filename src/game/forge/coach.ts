import type { ForgeBeat } from "@/curriculum/types";

export type CoachKind =
  | "make-ten"
  | "break-ten"
  | "fill-ones"
  | "take-ones"
  | "compose-hundreds"
  | "compose-tens"
  | "compose-ones"
  | "too-much"
  | "check"
  | "idle";

export type CoachTip = {
  kind: CoachKind;
  kicker: string;
  text: string;
  formula?: string;
};

export type CoachUrgency = "must" | "scaffold";

export type CoachGate = {
  /** First time this verb appears in the lesson, and the skill is not mastered. */
  introduce: boolean;
  moved: boolean;
  missed: boolean;
  idle: boolean;
  asked: boolean;
};

export const IDLE_TIP: CoachTip = { kind: "idle", kicker: "", text: "" };

export const COACH_IDLE_MS = 7000;

export function coachUrgency(kind: CoachKind): CoachUrgency {
  switch (kind) {
    case "make-ten":
    case "break-ten":
    case "too-much":
    case "check":
      return "must";
    case "fill-ones":
    case "take-ones":
    case "compose-hundreds":
    case "compose-tens":
    case "compose-ones":
    case "idle":
      return "scaffold";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Khan / Duo: name the move once, then stay quiet unless they are stuck. */
export function visibleCoach(tip: CoachTip, gate: CoachGate): CoachTip {
  if (tip.kind === "idle") return IDLE_TIP;
  if (coachUrgency(tip.kind) === "must") return tip;
  if (gate.asked || gate.missed || gate.idle) return tip;
  if (!gate.moved && gate.introduce) return tip;
  return IDLE_TIP;
}

export function neededPlaces(target: number): { hundreds: number; tens: number; ones: number } {
  return {
    hundreds: Math.floor(target / 100),
    tens: Math.floor((target % 100) / 10),
    ones: target % 10,
  };
}

export function placeWords(tens: number, ones: number): string {
  const t = tens === 1 ? "1 ten" : `${tens} tens`;
  const o = ones === 1 ? "1 one" : `${ones} ones`;
  return `${t} and ${o}`;
}

export function hitCopy(tens: number, ones: number, target: number, hundreds = 0): string {
  if (hundreds > 0) {
    const h = hundreds === 1 ? "1 hundred" : `${hundreds} hundreds`;
    return `${h}, ${placeWords(tens, ones)} make ${target}.`;
  }
  return `${placeWords(tens, ones)} make ${target}.`;
}

export function needsAddTrade(beat: ForgeBeat): boolean {
  switch (beat.kind) {
    case "compose":
      return false;
    case "operate":
      return beat.op === "add" && beat.delta < 10 && beat.start % 10 + beat.delta >= 10;
    default: {
      const _exhaustive: never = beat;
      return _exhaustive;
    }
  }
}

export function needsBreakTen(beat: ForgeBeat): boolean {
  switch (beat.kind) {
    case "compose":
      return false;
    case "operate":
      return beat.op === "sub" && beat.delta < 10 && beat.start % 10 < beat.delta;
    default: {
      const _exhaustive: never = beat;
      return _exhaustive;
    }
  }
}

export function isSubtractBeat(beat: ForgeBeat): boolean {
  return beat.kind === "operate" && beat.op === "sub";
}

export function allowsTens(beat: ForgeBeat): boolean {
  return beat.allowed.includes(10);
}

export function allowsHundreds(beat: ForgeBeat): boolean {
  return beat.allowed.includes(100);
}

export function canShowMakeTen(beat: ForgeBeat, ones: number): boolean {
  if (isSubtractBeat(beat)) return false;
  return ones >= 10 || needsAddTrade(beat);
}

/** Empty 10-frame slots are a fill-the-box puzzle. Only show them when that is the move. */
export function showsOnesTenFrame(beat: ForgeBeat, ones: number): boolean {
  return ones >= 10 || needsAddTrade(beat);
}

export function forgeCoach(input: {
  beat: ForgeBeat;
  ones: number;
  tens: number;
  total: number;
  target: number;
  hundreds?: number;
}): CoachTip {
  const { beat, ones, tens, total, target, hundreds = 0 } = input;

  if (beat.kind === "operate" && beat.op === "sub") {
    if (ones < beat.delta && tens > 0) {
      return {
        kind: "break-ten",
        kicker: "Tip",
        text: "Tap Break a ten to get ones.",
        formula: "1 ten → 10 ones",
      };
    }
    if (ones >= beat.delta && total !== target) {
      return {
        kind: "take-ones",
        kicker: "Next",
        text: "Tap ones to take them away.",
      };
    }
  }

  if (!isSubtractBeat(beat) && ones >= 10) {
    return {
      kind: "make-ten",
      kicker: "Tip",
      text: "Tap Make a ten.",
      formula: "10 ones → 1 ten",
    };
  }

  if (total > target && total > 0) {
    return {
      kind: "too-much",
      kicker: "Tip",
      text: "Too many. Tap a ten or a one to take some away.",
      formula: `${total} / ${target}`,
    };
  }

  if (total === target && total > 0) {
    return {
      kind: "check",
      kicker: "Ready",
      text: "Tap Check.",
    };
  }

  if (needsAddTrade(beat) && ones < 10 && total < target) {
    const remain = target - total;
    if (ones + remain < 10) {
      return {
        kind: "fill-ones",
        kicker: "Next",
        text: "Tap +1 to add a one.",
        formula: `${total} / ${target}`,
      };
    }
    return {
      kind: "fill-ones",
      kicker: "Next",
      text: "Tap +1 to fill the ones box.",
      formula: `${ones} / 10`,
    };
  }

  if (shouldCoachBuild(beat) && total < target) {
    const need = neededPlaces(target);
    if (allowsHundreds(beat) && hundreds < need.hundreds) {
      return {
        kind: "compose-hundreds",
        kicker: "Next",
        text: "Tap +100 to add a hundred.",
      };
    }
    if (allowsTens(beat) && tens < need.tens) {
      return {
        kind: "compose-tens",
        kicker: "Next",
        text: "Tap +10 to add a ten.",
      };
    }
    return {
      kind: "compose-ones",
      kicker: "Next",
      text: "Tap +1 to add a one.",
    };
  }

  return { kind: "idle", kicker: "", text: "" };
}

function shouldCoachBuild(beat: ForgeBeat): boolean {
  switch (beat.kind) {
    case "compose":
      return true;
    case "operate":
      return beat.op === "add" && !needsAddTrade(beat);
    default: {
      const _exhaustive: never = beat;
      return _exhaustive;
    }
  }
}

export function missCoach(input: {
  beat: ForgeBeat;
  ones: number;
  tens: number;
  total: number;
  target: number;
  hundreds?: number;
}): string {
  const { beat, ones, tens, total, target, hundreds = 0 } = input;
  if (needsBreakTen(beat) && ones < (beat.kind === "operate" ? beat.delta : 0) && tens > 0) {
    return "Not enough ones yet. Tap Break a ten first.";
  }
  if (total > target) {
    return "Too many. Tap a ten or a one to take some away.";
  }
  if (needsAddTrade(beat) && ones < 10) {
    return `You have ${ones} ones. Keep tapping +1 until the ones box is full.`;
  }
  const need = neededPlaces(target);
  if (shouldCoachBuild(beat) && allowsHundreds(beat) && hundreds < need.hundreds) {
    return "Tap +100 to add hundreds first.";
  }
  if (shouldCoachBuild(beat) && allowsTens(beat) && tens < need.tens) {
    return "Tap +10 to add tens first. Then fill the ones.";
  }
  return `You built ${total}. The target is ${target}.`;
}

export function tradeDetail(trade: "make" | "break" | "auto" | null): string | undefined {
  switch (trade) {
    case "make":
      return "10 ones became 1 ten. Same number!";
    case "auto":
      return "10 ones became 1 ten. Same number — just tidier.";
    case "break":
      return "You broke a ten into 10 ones so you could take away.";
    case null:
      return undefined;
    default: {
      const _exhaustive: never = trade;
      return _exhaustive;
    }
  }
}

export function weaveCoach(input: { sum: number; target: number; pathLength: number }): CoachTip {
  const { sum, target, pathLength } = input;
  if (pathLength === 0) {
    return {
      kind: "compose-ones",
      kicker: "Next",
      text: "Drag neighbor numbers.",
      formula: `0 / ${target}`,
    };
  }
  if (sum > target) {
    return {
      kind: "too-much",
      kicker: "Tip",
      text: "Too much. Lift and start over.",
      formula: `${sum} / ${target}`,
    };
  }
  if (sum === target) {
    return {
      kind: "check",
      kicker: "Ready",
      text: "That makes the number!",
      formula: `${sum}`,
    };
  }
  return {
    kind: "fill-ones",
    kicker: "Next",
    text: "Keep dragging neighbors.",
    formula: `${sum} / ${target}`,
  };
}
