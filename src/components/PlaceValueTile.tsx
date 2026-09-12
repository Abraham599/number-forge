import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PlaceValue } from "@/curriculum/types";
import { playSfx } from "@/lib/sound";
import { colors, hit, radius, shadow, spacing, squircle, type } from "@/theme/tokens";

type Props = {
  value: PlaceValue;
  onPress?: () => void;
  compact?: boolean;
  label?: string;
};

export function PlaceValueTile({ value, onPress, compact, label }: Props) {
  const body = (
    <View
      style={[
        styles.tile,
        shadow.tile,
        squircle,
        compact ? styles.compact : null,
        { backgroundColor: fillFor(value), minWidth: value === 100 ? 80 : value === 10 ? 72 : 48 },
      ]}
    >
      {value === 1 ? <View style={styles.cube} /> : value === 100 ? <View style={styles.flat} /> : <View style={styles.rod} />}
      <Text style={styles.value}>{label ?? String(value)}</Text>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPressIn={() => playSfx("tile")}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${tileName(value)}, worth ${value}`}
    >
      {body}
    </Pressable>
  );
}

function tileName(value: PlaceValue): string {
  switch (value) {
    case 1:
      return "Ones cube";
    case 10:
      return "Tens rod";
    case 100:
      return "Hundreds flat";
    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}

function fillFor(value: PlaceValue): string {
  switch (value) {
    case 1:
      return colors.tealSoft;
    case 10:
      return colors.amberSoft;
    case 100:
      return colors.roseSoft;
    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.tile,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: hit.kid,
  },
  compact: {
    minHeight: 44,
    padding: 6,
  },
  cube: {
    width: 16,
    height: 16,
    backgroundColor: colors.teal,
    borderRadius: 4,
  },
  rod: {
    width: 36,
    height: 10,
    backgroundColor: colors.amber,
    borderRadius: 4,
  },
  flat: {
    width: 28,
    height: 18,
    backgroundColor: colors.rose,
    borderRadius: 4,
  },
  value: {
    ...type.footnote,
    color: colors.ink,
  },
});
