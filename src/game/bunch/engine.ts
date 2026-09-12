import type { CoachTip } from "@/game/forge/coach";

export function bunchTotal(groups: number, size: number): number {
  return groups * size;
}

export function checkBunch(stamped: number, need: number): boolean {
  return stamped === need;
}

export function bunchFormula(stamped: number, size: number): string {
  if (stamped <= 0) return `0 bunches of ${size}`;
  const parts = Array.from({ length: stamped }, () => String(size));
  return `${parts.join(" + ")} = ${stamped * size}`;
}

export function bunchCoach(stamped: number, need: number): CoachTip {
  if (stamped === need) {
    return { kind: "check", kicker: "Ready", text: "Tap Check." };
  }
  if (stamped > need) {
    return { kind: "too-much", kicker: "Tip", text: "Too many bunches. Tap one to take it away." };
  }
  return { kind: "compose-ones", kicker: "Next", text: "Tap + bunch." };
}

export function checkShare(counts: number[], total: number): boolean {
  if (counts.length === 0) return false;
  const sum = counts.reduce((left, right) => left + right, 0);
  if (sum !== total) return false;
  const each = counts[0];
  if (each == null) return false;
  return counts.every((count) => count === each);
}

export function shareLeft(counts: number[], total: number): number {
  return Math.max(0, total - counts.reduce((sum, count) => sum + count, 0));
}

export function shareEach(total: number, bowls: number): number {
  return bowls <= 0 ? 0 : total / bowls;
}

export function shareCoach(counts: number[], total: number): CoachTip {
  const left = shareLeft(counts, total);
  if (left > 0) {
    return { kind: "compose-ones", kicker: "Next", text: "Tap a bowl to share one." };
  }
  if (!checkShare(counts, total)) {
    return { kind: "too-much", kicker: "Tip", text: "Bowls should match. Tap a cube to move it." };
  }
  return { kind: "check", kicker: "Ready", text: "Tap Check." };
}

export function shareHitCopy(total: number, bowls: number): string {
  const each = shareEach(total, bowls);
  return `${total} shared into ${bowls} bowls is ${each} each.`;
}
