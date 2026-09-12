import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
import type { SmithPartId } from "@/smith/parts";
import { colors, hit, spacing, type } from "@/theme/tokens";

type Props = {
  progress: number;
  prompt: string;
  onQuit: () => void;
  partName?: string;
  bait?: string;
  unlocked?: SmithPartId[];
  tempered?: boolean;
};

export function LessonChrome({
  progress,
  prompt,
  onQuit,
  partName,
  bait,
  unlocked = [],
  tempered = false,
}: Props) {
  return (
    <View>
      <View style={styles.top}>
        <Pressable
          onPress={onQuit}
          accessibilityRole="button"
          accessibilityLabel="Close lesson"
          style={styles.close}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </View>
      <View style={styles.promptRow}>
        <DigitSmith size={56} compact unlocked={unlocked} tempered={tempered} />
        <View style={styles.promptCopy}>
          <Text style={styles.prompt} numberOfLines={2}>
            {prompt}
          </Text>
          {bait || partName ? (
            <Text style={styles.bait} numberOfLines={1}>
              {bait ?? `Earn 3 stars to forge the ${partName}`}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  close: {
    width: hit.kid - 8,
    height: hit.kid - 8,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    ...type.subtitle,
    color: colors.inkSoft,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.paperDeep,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.teal,
    borderRadius: 99,
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  promptCopy: {
    flex: 1,
    minWidth: 0,
  },
  prompt: {
    ...type.headline,
    color: colors.ink,
  },
  bait: {
    ...type.footnote,
    color: colors.teal,
    marginTop: 2,
  },
});
