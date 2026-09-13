import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { KidButton } from "@/components/KidButton";
import { LessonChrome } from "@/components/LessonChrome";
import { PaperScreen } from "@/components/PaperScreen";
import { PlayStage } from "@/components/PlayStage";
import { TradeCoach } from "@/components/TradeCoach";
import { COACH_IDLE_MS, visibleCoach, weaveCoach } from "@/game/forge/coach";
import { generateWeavePuzzle } from "@/curriculum/generate";
import { puzzleById } from "@/curriculum/tens-town";
import {
  canExtend,
  formatPathEquation,
  isWinningPath,
  pathSum,
  starsForPaths,
  WEAVE_SIZE,
} from "@/game/weave/engine";
import { kidHaptic } from "@/lib/haptics";
import { playSfx } from "@/lib/sound";
import { usePlayMusic } from "@/lib/use-play-music";
import { isSmithTempered, listSkills, masteredLessonIds } from "@/progress/db";
import { useAppState } from "@/progress/store";
import { partForPlayId, smithSnapshot } from "@/smith/parts";
import { colors, shadow, spacing, type } from "@/theme/tokens";

export default function WeaveScreen() {
  const router = useRouter();
  const { puzzleId } = useLocalSearchParams<{ puzzleId: string }>();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const template = puzzleById(puzzleId ?? "weave-12");
  const seed = useRef(Date.now()).current;
  const puzzle = useMemo(
    () => (template ? generateWeavePuzzle(template, gradeBand, seed) : undefined),
    [template, gradeBand, seed],
  );
  const part = partForPlayId(puzzleId ?? puzzle?.id ?? "weave-12");
  const smith = smithSnapshot(gradeBand, new Set(masteredLessonIds()), { tempered: isSmithTempered() });
  usePlayMusic();
  const [path, setPath] = useState<number[]>([]);
  const [wins, setWins] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(puzzle?.seconds ?? 45);
  const [cellSize, setCellSize] = useState(72);
  const [moved, setMoved] = useState(false);
  const [asked, setAsked] = useState(false);
  const [idle, setIdle] = useState(false);
  const [activityTick, setActivityTick] = useState(0);
  const skillMastered = useMemo(() => {
    const row = listSkills().find((skill) => skill.skill_id === "weave-fluency");
    return row?.status === "mastered" || (row?.stars ?? 0) >= 3;
  }, []);
  const startedAt = useRef(Date.now());
  const winsRef = useRef(0);
  const finishedRef = useRef(false);

  const finish = (completed: number) => {
    if (!puzzle || finishedRef.current) return;
    finishedRef.current = true;
    const stars = completed === 0 ? 1 : starsForPaths(completed);
    router.replace({
      pathname: "/play/complete",
      params: {
        lessonId: puzzle.id,
        skillId: puzzle.skillId,
        mode: "weave",
        correct: String(completed),
        attempts: String(Math.max(completed, 1)),
        durationMs: String(Date.now() - startedAt.current),
        accuracy: String(completed === 0 ? 0.4 : 1),
        stars: String(stars),
      },
    });
  };

  useEffect(() => {
    winsRef.current = wins;
  }, [wins]);

  useEffect(() => {
    if (!puzzle) return;
    const timer = setInterval(() => {
      setSecondsLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [puzzle]);

  useEffect(() => {
    if (secondsLeft > 0) return;
    finish(winsRef.current);
  }, [secondsLeft]);

  useEffect(() => {
    if (wins < 1) return;
    const pause = setTimeout(() => finish(wins), 320);
    return () => clearTimeout(pause);
  }, [wins]);

  const grid = puzzle?.grid ?? [];
  const target = puzzle?.target ?? 12;
  const sum = pathSum(grid, path);
  const fill = target === 0 ? 0 : Math.min(1, sum / target);
  const hot = sum === target && path.length >= 2;
  const coach = visibleCoach(weaveCoach({ sum, target, pathLength: path.length }), {
    introduce: !skillMastered,
    moved,
    missed: false,
    idle,
    asked,
  });

  useEffect(() => {
    setIdle(false);
    const timer = setTimeout(() => setIdle(true), COACH_IDLE_MS);
    return () => clearTimeout(timer);
  }, [activityTick]);

  const addIndex = (index: number) => {
    if (finishedRef.current) return;
    setMoved(true);
    setAsked(false);
    setActivityTick((tick) => tick + 1);
    setPath((current) => {
      if (!canExtend(current, index)) return current;
      const next = [...current, index];
      if (isWinningPath(grid, next, target)) {
        void kidHaptic("success");
        playSfx("correct");
        setWins((count) => count + 1);
        return [];
      }
      void kidHaptic("light");
      playSfx("click");
      return next;
    });
  };

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((event) => {
          const index = hitIndex(event.x, event.y, cellSize);
          if (index !== null) addIndex(index);
        })
        .onUpdate((event) => {
          const index = hitIndex(event.x, event.y, cellSize);
          if (index !== null) addIndex(index);
        })
        .onEnd(() => {
          setPath((current) => {
            if (isWinningPath(grid, current, target)) return [];
            return [];
          });
        })
        .runOnJS(true),
    [cellSize, grid, target],
  );

  if (!puzzle) {
    return (
      <PaperScreen includeBottom>
        <Text style={styles.missing}>This weave is not ready yet.</Text>
      </PaperScreen>
    );
  }

  return (
    <PaperScreen style={styles.wrap} includeBottom>
      <LessonChrome
        progress={1 - secondsLeft / puzzle.seconds}
        prompt={`Draw a path to ${target}.`}
        onQuit={() => finish(wins)}
        partName={part?.name}
        unlocked={smith.unlocked}
        tempered={smith.tempered}
      />
      <PlayStage
        stage={
          <View style={styles.stage}>
            <View style={styles.meta}>
              <Text style={styles.pill}>{secondsLeft}s</Text>
              <Text style={styles.pill}>{wins > 0 ? `In a row · ${wins}` : "Draw a path"}</Text>
            </View>
            <Text style={[styles.live, hot ? styles.liveHot : null]}>{sum}</Text>
            <View style={styles.meter}>
              <View style={[styles.meterFill, { width: `${Math.round(fill * 100)}%` }]} />
            </View>
            <Text style={styles.eq}>{formatPathEquation(grid, path)}</Text>
            <GestureDetector gesture={gesture}>
              <View
                style={styles.grid}
                onLayout={(event) => {
                  const next = Math.floor((event.nativeEvent.layout.width - 24) / WEAVE_SIZE);
                  setCellSize(Math.max(56, next));
                }}
              >
                {grid.map((value, index) => {
                  const on = path.includes(index);
                  return (
                    <Pressable
                      key={index}
                      onPress={() => addIndex(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`${value}${on ? ", on path" : ""}`}
                      style={[
                        styles.cell,
                        { width: cellSize - 8, height: cellSize - 8 },
                        on ? styles.cellOn : null,
                      ]}
                    >
                      <Text style={[styles.cellText, on ? styles.cellTextOn : null]}>{value}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </GestureDetector>
          </View>
        }
        dock={
          <>
            <TradeCoach tip={coach} onAskHint={() => setAsked(true)} />
            <KidButton
              label="Start over"
              tone="ghost"
              onPress={() => {
                setPath([]);
                setActivityTick((tick) => tick + 1);
              }}
            />
          </>
        }
      />
    </PaperScreen>
  );
}

function hitIndex(x: number, y: number, cellSize: number): number | null {
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  if (col < 0 || col >= WEAVE_SIZE || row < 0 || row >= WEAVE_SIZE) return null;
  return row * WEAVE_SIZE + col;
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  stage: {
    flex: 1,
    minHeight: 0,
    gap: spacing.sm,
  },
  missing: {
    marginTop: 40,
    ...type.headline,
    color: colors.ink,
  },
  meta: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.amberSoft,
    color: colors.ink,
    ...type.footnote,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 99,
    overflow: "hidden",
  },
  live: {
    ...type.display,
    fontSize: 56,
    lineHeight: 62,
    color: colors.ink,
    textAlign: "center",
  },
  liveHot: {
    color: colors.teal,
  },
  meter: {
    height: 12,
    borderRadius: 99,
    backgroundColor: colors.paperDeep,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    backgroundColor: colors.teal,
    borderRadius: 99,
  },
  eq: {
    ...type.headline,
    color: colors.inkSoft,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  cell: {
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.tile,
  },
  cellOn: {
    backgroundColor: colors.tealSoft,
  },
  cellText: {
    ...type.subtitle,
    color: colors.ink,
  },
  cellTextOn: {
    color: colors.tealDeep,
  },
});
