import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
import { KidButton } from "@/components/KidButton";
import { PaperScreen } from "@/components/PaperScreen";
import { StreakBar } from "@/components/StreakBar";
import { isMixLesson, SKILL_LABELS, townLessonById } from "@/curriculum/tens-town";
import type { WorldNode } from "@/curriculum/types";
import { openForgeLesson, openWorldNode } from "@/navigation/open-node";
import { bestStarsByLesson, isSmithTempered, masteredLessonIds, weekPlayDates } from "@/progress/db";
import { isNodeLocked, playIdForNode } from "@/progress/path-progress";
import { useAppState } from "@/progress/store";
import { partForNode, smithSnapshot } from "@/smith/parts";
import { colors, radius, spacing, squircle, type } from "@/theme/tokens";

export default function PathScreen() {
  const router = useRouter();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const [tick, setTick] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setTick((value) => value + 1);
    }, []),
  );
  const mastered = useMemo(() => new Set(masteredLessonIds()), [tick]);
  const snap = useMemo(
    () => smithSnapshot(gradeBand, mastered, { tempered: isSmithTempered() }),
    [gradeBand, mastered],
  );
  const dates = useMemo(() => weekPlayDates(), [tick]);
  const starsByLesson = useMemo(() => {
    void tick;
    return bestStarsByLesson();
  }, [tick]);
  const next = snap.current;
  const pathDone = next?.kind === "chest";
  const nextPart = next ? partForNode(next) : undefined;

  return (
    <PaperScreen style={styles.wrap}>
      <View style={styles.banner}>
        <Text style={styles.kicker}>Tens Town</Text>
        <Text style={styles.title}>{bannerTitle(next, nextPart, pathDone)}</Text>
        <Text style={styles.sub}>{bannerSub(next, nextPart, pathDone)}</Text>
      </View>
      <StreakBar dateKeys={dates} />
      {pathDone ? (
        <KidButton label="Keep Smith sharp" onPress={() => openForgeLesson(router, "forge-daily")} />
      ) : next ? (
        <KidButton label={`Play ${playCopy(next)}`} onPress={() => openWorldNode(router, next)} />
      ) : null}
      <ScrollView contentContainerStyle={styles.path} showsVerticalScrollIndicator={false}>
        {snap.nodes.map((node, index) => {
          const locked = isNodeLocked(index, snap.nodes.indexOf(next ?? snap.nodes[0]!));
          const here = next ? playIdForNode(node) === playIdForNode(next) : false;
          const done = mastered.has(playIdForNode(node)) || (node.kind === "chest" && snap.unlocked.includes("cape"));
          const part = partForNode(node);
          return (
            <View key={node.id} style={styles.step}>
              {index > 0 ? <View style={[styles.rail, done || here ? styles.railOn : null]} /> : null}
              <View style={[styles.row, index % 2 === 0 ? styles.left : styles.right]}>
                {here ? (
                  <DigitSmith
                    size={92}
                    lively={false}
                    unlocked={snap.unlocked}
                    highlight={part?.id}
                    tempered={snap.tempered}
                  />
                ) : (
                  <View style={styles.spacer} />
                )}
                <PathNode
                  node={node}
                  locked={locked}
                  current={here}
                  done={done}
                  stars={starsByLesson.get(playIdForNode(node)) ?? 0}
                  onPress={() => openWorldNode(router, node)}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </PaperScreen>
  );
}

function bannerTitle(
  next: WorldNode | undefined,
  nextPart: ReturnType<typeof partForNode>,
  pathDone: boolean,
): string {
  if (pathDone || !next) return "Smith is ready!";
  if (nextPart) return `Earn 3 stars to forge the ${nextPart.name}`;
  if (next.kind === "forge" && next.lessonId === "forge-rewind") return "Rewind · temper Smith";
  return next.label;
}

function bannerSub(
  next: WorldNode | undefined,
  nextPart: ReturnType<typeof partForNode>,
  pathDone: boolean,
): string {
  if (pathDone || !next) return "Keep Smith sharp with a daily mix.";
  if (nextPart) return `Play ${playCopy(next)}. 3 stars forges the ${nextPart.name}.`;
  return `Play ${playCopy(next)}.`;
}

function playCopy(node: WorldNode): string {
  switch (node.kind) {
    case "forge": {
      const skill = townLessonById(node.lessonId)?.skillId;
      return skill ? SKILL_LABELS[skill] : node.label;
    }
    case "weave":
      return SKILL_LABELS["weave-fluency"];
    case "chest":
      return node.label;
    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function PathNode({
  node,
  locked,
  current,
  done,
  stars,
  onPress,
}: {
  node: WorldNode;
  locked: boolean;
  current: boolean;
  done: boolean;
  stars: number;
  onPress: () => void;
}) {
  const part = partForNode(node);
  const extra =
    node.kind === "forge" && isMixLesson(node.lessonId)
      ? "Temper"
      : part?.name ?? "";
  return (
    <Pressable
      disabled={locked}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={`${node.label}${part ? `, forges the ${part.name}` : ""}${locked ? ", locked" : current ? ", play this next" : ""}`}
    >
      <View style={[styles.lip, done ? styles.lipDone : current ? styles.lipNow : styles.lipIdle]}>
        <View
          style={[
            styles.node,
            done ? styles.nodeDone : null,
            current ? styles.nodeCurrent : null,
            locked ? styles.nodeLocked : null,
          ]}
        >
          <Text style={[styles.nodeGlyph, done ? styles.onDone : null]}>
            {locked ? "🔒" : glyph(node)}
          </Text>
          <Text style={[styles.nodeLabel, done ? styles.onDone : null]}>{node.label}</Text>
          {locked || extra ? (
            <Text style={[styles.partLabel, done ? styles.onDone : null]}>
              {locked ? "3 stars first" : extra}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.stars}>{stars > 0 ? "★".repeat(stars) : "☆☆☆"}</Text>
    </Pressable>
  );
}

function forgeGlyph(lessonId: string): string {
  switch (lessonId) {
    case "forge-rewind":
      return "↺";
    case "heap-compare":
      return "≷";
    case "bunch-groups":
      return "∷";
    case "share-out":
      return "◎";
    case "slice-parts":
      return "◑";
    case "forge-hundreds":
      return "▣";
    default:
      return "＋";
  }
}

function glyph(node: WorldNode): string {
  switch (node.kind) {
    case "weave":
      return "〰️";
    case "chest":
      return "✦";
    case "forge":
      return forgeGlyph(node.lessonId);
    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  banner: {
    backgroundColor: colors.teal,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...squircle,
  },
  kicker: {
    ...type.footnote,
    color: colors.tealSoft,
  },
  title: {
    ...type.subtitle,
    color: colors.white,
    marginTop: spacing.xs,
  },
  sub: {
    ...type.footnote,
    color: colors.tealSoft,
    marginTop: spacing.xs,
  },
  path: {
    paddingBottom: spacing.huge,
    paddingTop: spacing.sm,
  },
  step: {
    alignItems: "center",
  },
  rail: {
    width: 8,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.paperDeep,
  },
  railOn: {
    backgroundColor: colors.teal,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
  },
  left: {
    justifyContent: "flex-start",
    paddingLeft: spacing.md,
  },
  right: {
    justifyContent: "flex-end",
    paddingRight: spacing.md,
  },
  spacer: {
    width: 100,
  },
  lip: {
    borderRadius: 56,
    paddingBottom: 6,
  },
  lipDone: {
    backgroundColor: colors.tealDeep,
  },
  lipNow: {
    backgroundColor: "#C4842E",
  },
  lipIdle: {
    backgroundColor: colors.paperDeep,
  },
  node: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  nodeDone: {
    backgroundColor: colors.teal,
  },
  nodeCurrent: {
    borderWidth: 3,
    borderColor: colors.amber,
  },
  nodeLocked: {
    backgroundColor: colors.paperDeep,
  },
  nodeGlyph: {
    fontSize: 20,
  },
  nodeLabel: {
    ...type.footnote,
    color: colors.ink,
    marginTop: 2,
    textAlign: "center",
  },
  partLabel: {
    ...type.micro,
    color: colors.inkSoft,
  },
  onDone: {
    color: colors.white,
  },
  stars: {
    ...type.caption,
    color: colors.amber,
    textAlign: "center",
    marginTop: 4,
  },
});
