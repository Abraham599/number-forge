import type { SkillStatus } from "@/curriculum/types";

export function nextSkillStatus(input: {
  plays: number;
  accuracy: number;
  bestStars: number;
}): SkillStatus {
  if (input.plays === 0) return "not_studied";
  if (input.bestStars >= 3) return "mastered";
  if (input.plays >= 2 && input.accuracy >= 0.8 && input.bestStars >= 2) {
    return "mastered";
  }
  return "still_learning";
}

export function starsFromLesson(input: {
  correctBeats: number;
  totalBeats: number;
  durationMs: number;
}): 1 | 2 | 3 {
  void input.durationMs;
  const accuracy = input.totalBeats === 0 ? 0 : input.correctBeats / input.totalBeats;
  if (accuracy === 1) return 3;
  if (accuracy >= 2 / 3) return 2;
  return 1;
}
