import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { KidButton } from "@/components/KidButton";
import { PaperScreen } from "@/components/PaperScreen";
import { Surface } from "@/components/Surface";
import { SKILL_LABELS } from "@/curriculum/tens-town";
import type { SkillId, SkillStatus } from "@/curriculum/types";
import { openForgeLesson, openWorldNode } from "@/navigation/open-node";
import { isSmithTempered, listSkills, masteredLessonIds, repairCount, type SkillRow } from "@/progress/db";
import { isNodeLocked, playIdForNode } from "@/progress/path-progress";
import { useAppState } from "@/progress/store";
import { nodeForSkill, partForSkill, smithSnapshot } from "@/smith/parts";
import { colors, radius, spacing, squircle, type } from "@/theme/tokens";

const ORDER: SkillId[] = [
  "compose-to-100",
  "add-no-regroup",
  "add-with-regroup",
  "weave-fluency",
  "compose-ones",
  "compose-tens",
  "make-ten",
  "subtract-no-regroup",
  "subtract-with-regroup",
  "compose-hundreds",
  "add-tens",
  "compare-heaps",
  "groups-of",
  "share-out",
  "unit-parts",
];

export default function GardenScreen() {
  const router = useRouter();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const [tick, setTick] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setTick((value) => value + 1);
    }, []),
  );
  const rows = useMemo(() => listSkills(), [tick]);
  const byId = useMemo(() => new Map(rows.map((row) => [row.skill_id, row])), [rows]);
  const snap = useMemo(
    () => smithSnapshot(gradeBand, new Set(masteredLessonIds()), { tempered: isSmithTempered() }),
    [gradeBand, tick],
  );
  const misses = useMemo(() => repairCount(), [tick]);

  return (
    <PaperScreen style={styles.wrap}>
      <Text style={styles.title}>Your stars</Text>
      <Text style={styles.sub}>3 stars forge that part on Smith.</Text>
      {misses > 0 ? (
        <View style={styles.repair}>
          <Text style={styles.repairKicker}>Repair pile</Text>
          <Text style={styles.repairTitle}>
            {misses === 1 ? "1 miss to repair" : `${misses} misses to repair`}
          </Text>
          <KidButton label={`Repair ${misses} ${misses === 1 ? "miss" : "misses"}`} onPress={() => openForgeLesson(router, "forge-repair")} />
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {ORDER.filter((skillId) => nodeForSkill(snap.nodes, skillId)).map((skillId) => {
          const node = nodeForSkill(snap.nodes, skillId);
          const current = snap.current && node ? playIdForNode(node) === playIdForNode(snap.current) : false;
          const index = node ? snap.nodes.findIndex((item) => item.id === node.id) : -1;
          const locked = index >= 0 && snap.current ? isNodeLocked(index, snap.nodes.indexOf(snap.current)) : true;
          return (
            <SkillCard
              key={skillId}
              skillId={skillId}
              row={byId.get(skillId)}
              locked={locked}
              current={current}
              onPress={() => {
                if (!node || locked) return;
                openWorldNode(router, node);
              }}
            />
          );
        })}
      </ScrollView>
    </PaperScreen>
  );
}

function SkillCard({
  skillId,
  row,
  locked,
  current,
  onPress,
}: {
  skillId: SkillId;
  row?: SkillRow;
  locked: boolean;
  current: boolean;
  onPress: () => void;
}) {
  const status: SkillStatus = row?.stars && row.stars >= 3 ? "mastered" : row?.status ?? "not_studied";
  const part = partForSkill(skillId);
  const forged = (row?.stars ?? 0) >= 3;
  return (
    <Pressable onPress={onPress} disabled={locked} accessibilityRole="button">
      <Surface contentStyle={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.skill}>{SKILL_LABELS[skillId]}</Text>
          <Text style={styles.stars}>{"★".repeat(row?.stars ?? 0) || "☆"}</Text>
        </View>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${barWidth(status)}%`, backgroundColor: tone(status) }]} />
        </View>
        <Text style={[styles.status, { color: tone(status) }]}>
          {locked
            ? `Locked · 3 stars first${part ? ` · ${part.name}` : ""}`
            : current
              ? part
                ? `Play now · earn 3 stars for the ${part.name}`
                : "Play now"
              : forged && part
                ? `Smith has the ${part.name}!`
                : part
                  ? `Keep going · ${part.name}`
                  : "Keep going"}
        </Text>
      </Surface>
    </Pressable>
  );
}

function tone(status: SkillStatus): string {
  switch (status) {
    case "not_studied":
      return colors.lock;
    case "still_learning":
      return colors.amber;
    case "mastered":
      return colors.teal;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function barWidth(status: SkillStatus): number {
  switch (status) {
    case "not_studied":
      return 8;
    case "still_learning":
      return 55;
    case "mastered":
      return 100;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.lg,
  },
  title: {
    ...type.title,
    color: colors.ink,
  },
  sub: {
    ...type.body,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  repair: {
    marginTop: spacing.lg,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...squircle,
  },
  repairKicker: {
    ...type.footnote,
    color: colors.inkSoft,
  },
  repairTitle: {
    ...type.headline,
    color: colors.ink,
  },
  list: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.huge,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skill: {
    ...type.headline,
    color: colors.ink,
  },
  stars: {
    ...type.callout,
    color: colors.amber,
  },
  bar: {
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.paperDeep,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
  },
  status: {
    ...type.footnote,
  },
});
