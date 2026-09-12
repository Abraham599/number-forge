import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { colors, radius, spacing, squircle, type } from "@/theme/tokens";

type Props = {
  ones: number;
  frame?: boolean;
  onRemoveOne?: () => void;
};

export function OnesTenFrame({ ones, frame = false, onRemoveOne }: Props) {
  const reduced = useReducedMotion();
  const filled = Math.min(10, ones);
  const extra = Math.max(0, ones - 10);
  const full = ones >= 10;
  const showFrame = frame || full;

  if (!showFrame) {
    return (
      <View
        style={styles.wrap}
        accessibilityRole="adjustable"
        accessibilityLabel={ones === 1 ? "1 one" : `${ones} ones`}
        accessibilityHint={onRemoveOne ? "Tap a cube to take one away" : undefined}
      >
        <View style={styles.head}>
          <Text style={styles.label}>Ones</Text>
          <Text style={styles.count}>{ones}</Text>
        </View>
        <View style={styles.pile}>
          {Array.from({ length: ones }, (_, index) => {
            const cube = <View style={styles.cube} />;
            if (!onRemoveOne) {
              return <View key={index}>{cube}</View>;
            }
            return (
              <Pressable
                key={index}
                onPress={onRemoveOne}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel="Take away one"
              >
                {cube}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.wrap, full ? styles.wrapFull : null]}
      accessibilityRole="adjustable"
      accessibilityLabel={`Ones box, ${ones} of 10`}
      accessibilityHint={onRemoveOne ? "Tap a cube to take one away" : undefined}
    >
      <View style={styles.head}>
        <Text style={styles.label}>Ones</Text>
        <Text style={[styles.count, full ? styles.countFull : null]}>
          {full ? "Full" : `${filled} of 10`}
        </Text>
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 10 }, (_, index) => {
          const on = index < filled;
          const cell = (
            <Animated.View
              style={[
                styles.cell,
                on ? styles.cellOn : styles.cellOff,
                {
                  transitionProperty: reduced ? "none" : "backgroundColor",
                  transitionDuration: 150,
                  transitionTimingFunction: "ease-out",
                },
              ]}
            >
              {on ? <View style={styles.cube} /> : null}
            </Animated.View>
          );
          if (!on || !onRemoveOne) {
            return <View key={index}>{cell}</View>;
          }
          return (
            <Pressable
              key={index}
              onPress={onRemoveOne}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel="Take away one"
            >
              {cell}
            </Pressable>
          );
        })}
      </View>
      {extra > 0 ? (
        <Text style={styles.extra}>+{extra} more ones</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 1,
    flexShrink: 0,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: "transparent",
    ...squircle,
  },
  wrapFull: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    ...type.caption,
    color: colors.inkSoft,
    textTransform: "uppercase",
  },
  count: {
    ...type.caption,
    color: colors.teal,
  },
  countFull: {
    color: colors.tealDeep,
  },
  pile: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    width: 5 * 26 + 4 * 6,
  },
  cell: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cellOn: {
    backgroundColor: colors.white,
  },
  cellOff: {
    backgroundColor: colors.paperDeep,
  },
  cube: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.teal,
  },
  extra: {
    ...type.caption,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
});
