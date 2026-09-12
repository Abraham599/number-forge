import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { KidButton } from "@/components/KidButton";
import { playSfx } from "@/lib/sound";
import { colors, radius, shadow, spacing, squircle, type } from "@/theme/tokens";

type Variant = "correct" | "incorrect";

type Props = {
  variant: Variant;
  title: string;
  detail: string;
  action: string;
  onAction: () => void;
  formula?: string;
};

export function FeedbackSheet({ variant, title, detail, action, onAction, formula }: Props) {
  const bg = variant === "correct" ? colors.tealSoft : colors.roseSoft;
  const fg = variant === "correct" ? colors.tealDeep : colors.rose;
  useEffect(() => {
    playSfx(variant === "correct" ? "correct" : "almost");
  }, [variant]);
  return (
    <View style={[styles.sheet, shadow.float, squircle, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: fg }]}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
      {formula ? (
        <View style={styles.formula}>
          <Text style={[styles.formulaText, { color: fg }]}>{formula}</Text>
        </View>
      ) : null}
      <KidButton label={action} onPress={onAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl,
    paddingBottom: spacing.huge,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.sm,
  },
  title: {
    ...type.title,
  },
  detail: {
    ...type.body,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  formula: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  formulaText: {
    ...type.headline,
  },
});
