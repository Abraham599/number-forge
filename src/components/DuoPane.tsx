import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useAppLayout } from "@/theme/layout";
import { spacing } from "@/theme/tokens";

type Props = {
  primary: ReactNode;
  secondary: ReactNode;
};

/** Extra hierarchy on regular width. Same content, two columns — no new verbs. */
export function DuoPane({ primary, secondary }: Props) {
  const { columns, foldGutter } = useAppLayout();
  return (
    <View
      style={[
        styles.wrap,
        columns ? styles.row : null,
        columns ? { gap: Math.max(foldGutter, spacing.lg) } : null,
      ]}
    >
      <View style={[styles.pane, columns ? styles.primary : styles.primaryStack]}>{primary}</View>
      <View style={[styles.pane, columns ? styles.secondary : styles.secondaryStack]}>{secondary}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  pane: {
    minWidth: 0,
    minHeight: 0,
  },
  primary: {
    flex: 2,
  },
  secondary: {
    flex: 3,
  },
  primaryStack: {
    flexGrow: 0,
  },
  secondaryStack: {
    flex: 1,
  },
});
