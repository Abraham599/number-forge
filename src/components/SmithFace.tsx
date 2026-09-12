import React from "react";
import { DigitSmith } from "@/components/DigitSmith";
import type { SmithPartId } from "@/smith/parts";

type Mood = "idle" | "glad" | "sad";

type Props = {
  mood?: Mood;
  size?: number;
  unlocked?: SmithPartId[];
};

export function SmithFace({ mood = "idle", size = 88, unlocked = [] }: Props) {
  return <DigitSmith mood={mood} size={size} unlocked={unlocked} compact />;
}
