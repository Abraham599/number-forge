import type { CoachTip } from "@/game/forge/coach";

export type HeapPick = "left" | "right" | "same";

export function heapAnswer(left: number, right: number): HeapPick {
  if (left === right) return "same";
  return left > right ? "left" : "right";
}

export function checkHeap(left: number, right: number, pick: HeapPick | null): boolean {
  if (pick == null) return false;
  return pick === heapAnswer(left, right);
}

export function heapPrompt(left: number, right: number): string {
  return left === right ? "Are the piles the same?" : "Which pile is more?";
}

export function heapHitCopy(left: number, right: number): string {
  const answer = heapAnswer(left, right);
  switch (answer) {
    case "same":
      return `${left} and ${left} are the same.`;
    case "left":
      return `${left} is more than ${right}.`;
    case "right":
      return `${right} is more than ${left}.`;
    default: {
      const _exhaustive: never = answer;
      return _exhaustive;
    }
  }
}

export function heapCoach(left: number, right: number, pick: HeapPick | null): CoachTip {
  if (left === right && pick !== "same") {
    return { kind: "check", kicker: "Tip", text: "Tap Same." };
  }
  if (pick == null) {
    return { kind: "compose-ones", kicker: "Next", text: "Tap the bigger pile." };
  }
  return { kind: "check", kicker: "Ready", text: "Tap Check." };
}

export function showsHeapDots(left: number, right: number): boolean {
  return left <= 12 && right <= 12;
}
