import type { CoachTip } from "@/game/forge/coach";

export function checkSlice(filled: number, num: number): boolean {
  return filled === num;
}

export function slicePrompt(num: number, den: number): string {
  if (num === 1 && den === 2) return "Color half.";
  if (num === 1 && den === 4) return "Color 1 of 4.";
  return `Color ${num} of ${den}.`;
}

export function sliceWords(num: number, den: number): string {
  if (num === 1 && den === 2) return "Half is 1 of 2 parts.";
  return `${num} of ${den} parts.`;
}

export function sliceCoach(filled: number, num: number): CoachTip {
  if (filled === num) {
    return { kind: "check", kicker: "Ready", text: "Tap Check." };
  }
  if (filled > num) {
    return { kind: "too-much", kicker: "Tip", text: "Too many parts. Tap one to take the color off." };
  }
  return { kind: "compose-ones", kicker: "Next", text: "Tap a part to color it." };
}

export function nextFilled(current: number, index: number): number {
  if (index + 1 === current) return current - 1;
  return index + 1;
}
