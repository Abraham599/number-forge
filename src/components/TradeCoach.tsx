import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import type { CoachTip } from "@/game/forge/coach";
import { colors, radius, spacing, squircle, type } from "@/theme/tokens";

type Props = {
  tip: CoachTip;
  onAskHint?: () => void;
};

export function TradeCoach({ tip, onAskHint }: Props) {
  const reduced = useReducedMotion();
  if (tip.kind === "idle") {
    if (!onAskHint) return null;
    return (
      <View style={styles.lane}>
        <Pressable
          onPress={onAskHint}
          style={styles.hint}
          accessibilityRole="button"
          accessibilityLabel="Hint"
        >
          <Text style={styles.hintText}>Hint</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.View
      key={tip.kind}
      entering={reduced ? undefined : FadeIn.duration(180)}
      style={styles.bar}
    >
      <View style={styles.copy}>
        <Text style={styles.kicker}>{tip.kicker}</Text>
        <Text style={styles.text} numberOfLines={2}>
          {tip.text}
        </Text>
      </View>
      {tip.formula ? (
        <View style={styles.formula}>
          <Text style={styles.formulaText}>{tip.formula}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  lane: {
    minHeight: 36,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  hint: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    ...squircle,
  },
  hintText: {
    ...type.footnote,
    color: colors.tealDeep,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.tealSoft,
    ...squircle,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  kicker: {
    ...type.micro,
    color: colors.tealDeep,
    textTransform: "uppercase",
  },
  text: {
    ...type.footnote,
    color: colors.ink,
  },
  formula: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
  },
  formulaText: {
    ...type.caption,
    color: colors.tealDeep,
  },
});
