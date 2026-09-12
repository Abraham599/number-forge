import React from "react";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { playSfx } from "@/lib/sound";
import { colors, hit, radius, shadow, spacing, squircle, type } from "@/theme/tokens";

type Tone = "primary" | "ghost" | "danger" | "disabled";

type Props = {
  label: string;
  onPress: () => void;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function KidButton({
  label,
  onPress,
  tone = "primary",
  style,
  accessibilityHint,
}: Props) {
  const palette = toneStyles(tone);
  const lifted = tone === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={tone === "disabled"}
      onPressIn={() => {
        if (tone !== "disabled") playSfx("click");
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        squircle,
        lifted ? shadow.rest : null,
        {
          backgroundColor: palette.bg,
          transform: [{ scale: pressed ? 0.97 : 1 }, { translateY: pressed && lifted ? 1 : 0 }],
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

function toneStyles(tone: Tone): { bg: string; fg: string } {
  switch (tone) {
    case "primary":
      return { bg: colors.teal, fg: colors.white };
    case "ghost":
      return { bg: "transparent", fg: colors.inkSoft };
    case "danger":
      return { bg: "transparent", fg: colors.rose };
    case "disabled":
      return { bg: colors.paperDeep, fg: colors.lock };
    default: {
      const _exhaustive: never = tone;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: hit.kid,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    width: "100%",
  },
  label: {
    ...type.headline,
  },
});
