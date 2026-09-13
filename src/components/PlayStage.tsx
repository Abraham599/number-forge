import React, { type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAppLayout } from "@/theme/layout";
import { spacing } from "@/theme/tokens";

type Props = {
  stage: ReactNode;
  dock: ReactNode;
};

/** Split arrangement: mat + actions stack when tall, sit beside each other when wide. */
export function PlayStage({ stage, dock }: Props) {
  const { split, foldGutter } = useAppLayout();
  return (
    <View style={[styles.wrap, split ? styles.row : null, split ? { gap: foldGutter } : null]}>
      <View style={styles.stage}>{stage}</View>
      {split ? (
        <ScrollView
          style={styles.dockSplit}
          contentContainerStyle={styles.dockInnerSplit}
          showsVerticalScrollIndicator={false}
        >
          {dock}
        </ScrollView>
      ) : (
        <View style={styles.dockStack}>{dock}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  stage: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  dockStack: {
    flexGrow: 0,
    flexShrink: 0,
    gap: spacing.sm,
  },
  dockSplit: {
    width: 280,
    maxWidth: "42%",
    flexGrow: 0,
    flexShrink: 0,
  },
  dockInnerSplit: {
    flexGrow: 1,
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});
