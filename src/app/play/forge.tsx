import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { FeedbackSheet } from "@/components/FeedbackSheet";
import { KidButton } from "@/components/KidButton";
import { LessonChrome } from "@/components/LessonChrome";
import { PlayStage } from "@/components/PlayStage";
import { OnesTenFrame } from "@/components/OnesTenFrame";
import { PaperScreen } from "@/components/PaperScreen";
import { DigitSmith } from "@/components/DigitSmith";
import { PlaceValueTile } from "@/components/PlaceValueTile";
import { TradeCoach } from "@/components/TradeCoach";
import { generateForgeLesson } from "@/curriculum/generate";
import { isMixLesson, lessonById, targetForBeat } from "@/curriculum/tens-town";
import { leavePlay } from "@/navigation/open-node";
import type { ForgeBeat, PlaceValue } from "@/curriculum/types";
import { isSmithTempered, listSkills, masteredLessonIds } from "@/progress/db";
import { useAppState } from "@/progress/store";
import { partForPlayId, smithSnapshot } from "@/smith/parts";
import { playSfx } from "@/lib/sound";
import { usePlayMusic } from "@/lib/use-play-music";
import {
  COACH_IDLE_MS,
  canShowMakeTen,
  forgeCoach,
  showsOnesTenFrame,
  hitCopy,
  isSubtractBeat,
  missCoach,
  tradeDetail,
  visibleCoach,
  type CoachKind,
} from "@/game/forge/coach";
import {
  addTile,
  boardTotal,
  breakTen,
  checkTarget,
  emptyBoard,
  makeOneTen,
  regroupOnes,
  removeTile,
  seedBoardFromTotal,
  type ForgeBoard,
} from "@/game/forge/engine";
import { kidHaptic } from "@/lib/haptics";
import { useAppLayout } from "@/theme/layout";
import { colors, hit, radius, shadow, spacing, squircle, type } from "@/theme/tokens";

type Sheet = "correct" | "incorrect" | "quit" | null;
type Trade = "make" | "break" | "auto" | null;

const pulse = {
  "0%": { transform: [{ scale: 1 }] },
  "50%": { transform: [{ scale: 1.04 }] },
  "100%": { transform: [{ scale: 1 }] },
};

export default function ForgeScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const template = lessonById(lessonId ?? "");
  const seed = useRef(Date.now()).current;
  const lesson = useMemo(
    () => (template ? generateForgeLesson(template, gradeBand, seed, listSkills()) : undefined),
    [template, gradeBand, seed],
  );
  const part = partForPlayId(lessonId ?? "");
  const smith = smithSnapshot(gradeBand, new Set(masteredLessonIds()), { tempered: isSmithTempered() });
  const reduced = useReducedMotion();
  usePlayMusic();
  const startedAt = useRef(Date.now());
  const attempts = useRef(0);
  const correct = useRef(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [board, setBoard] = useState<ForgeBoard>(emptyBoard());
  const [sheet, setSheet] = useState<Sheet>(null);
  const [idTick, setIdTick] = useState(0);
  const [lastTrade, setLastTrade] = useState<Trade>(null);
  const [moved, setMoved] = useState(false);
  const [missed, setMissed] = useState(false);
  const [asked, setAsked] = useState(false);
  const [idle, setIdle] = useState(false);
  const [activityTick, setActivityTick] = useState(0);
  const introduced = useRef(new Set<CoachKind>());
  const rawKindRef = useRef<CoachKind>("idle");

  const beat = lesson?.beats[beatIndex];
  const skillMastered = useMemo(() => {
    const row = listSkills().find((skill) => skill.skill_id === lesson?.skillId);
    return row?.status === "mastered" || (row?.stars ?? 0) >= 3;
  }, [lesson?.skillId]);

  useEffect(() => {
    setBoard(boardForBeat(lesson?.beats[beatIndex]));
    setLastTrade(null);
    setMoved(false);
    setMissed(false);
    setAsked(false);
    return () => {
      if (rawKindRef.current !== "idle") introduced.current.add(rawKindRef.current);
    };
  }, [lesson, beatIndex]);
  const target = beat ? targetForBeat(beat) : 0;
  const total = boardTotal(board);
  const hundredsTiles = board.tiles.filter((tile) => tile.value === 100);
  const tensTiles = board.tiles.filter((tile) => tile.value === 10);
  const onesTiles = board.tiles.filter((tile) => tile.value === 1);
  const hundreds = hundredsTiles.length;
  const tens = tensTiles.length;
  const ones = onesTiles.length;
  const fill = target === 0 ? 0 : Math.min(1, total / target);
  const hitTarget = total === target && total > 0;
  const progress = lesson ? (beatIndex + 0.15) / lesson.beats.length : 0;
  const rawCoach = beat
    ? forgeCoach({ beat, ones, tens, hundreds, total, target })
    : { kind: "idle" as const, kicker: "", text: "" };
  rawKindRef.current = rawCoach.kind;
  const coach = visibleCoach(rawCoach, {
    introduce: !skillMastered && !introduced.current.has(rawCoach.kind),
    moved,
    missed,
    idle,
    asked,
  });
  const showMake = beat ? canShowMakeTen(beat, ones) : false;
  const canMake = ones >= 10 && showMake;
  const allowed = beat?.allowed ?? [1, 10];

  useEffect(() => {
    if (sheet !== null) return;
    setIdle(false);
    const timer = setTimeout(() => setIdle(true), COACH_IDLE_MS);
    return () => clearTimeout(timer);
  }, [activityTick, sheet, beatIndex]);

  const notePlay = () => {
    if (rawCoach.kind !== "idle") introduced.current.add(rawCoach.kind);
    setMoved(true);
    setMissed(false);
    setAsked(false);
    setActivityTick((tick) => tick + 1);
  };

  const onAdd = (value: PlaceValue) => {
    setIdTick((tick) => tick + 1);
    setBoard((current) => addTile(current, value, `t-${idTick}-${value}`));
    notePlay();
    void kidHaptic("light");
  };

  const onRemoveOne = () => {
    const last = [...onesTiles].at(-1);
    if (!last) return;
    playSfx("tile");
    setBoard((current) => removeTile(current, last.id));
    notePlay();
  };

  const onMakeTen = () => {
    const next = makeOneTen(board);
    if (!next.didMake) return;
    playSfx("tile");
    setBoard(next.board);
    setLastTrade("make");
    notePlay();
    void kidHaptic("success");
  };

  const onBreakTen = () => {
    const next = breakTen(board);
    if (!next.didBreak) return;
    playSfx("tile");
    setBoard(next.board);
    setLastTrade("break");
    notePlay();
    void kidHaptic("success");
  };

  const onCheck = () => {
    if (!lesson || !beat) return;
    attempts.current += 1;
    const { board: grouped, didRegroup } = regroupOnes(board);
    if (didRegroup) {
      setBoard(grouped);
      setLastTrade((current) => current ?? "auto");
      void kidHaptic("success");
    }
    if (checkTarget(grouped, target)) {
      correct.current += 1;
      setSheet("correct");
      void kidHaptic("success");
      return;
    }
    setMissed(true);
    setSheet("incorrect");
    void kidHaptic("error");
  };

  const onContinue = () => {
    if (!lesson) return;
    if (beatIndex + 1 >= lesson.beats.length) {
      const durationMs = Date.now() - startedAt.current;
      const accuracy = correct.current / Math.max(attempts.current, 1);
      router.replace({
        pathname: "/play/complete",
        params: {
          lessonId: lesson.id,
          skillId: lesson.skillId,
          mode: "forge",
          correct: String(correct.current),
          attempts: String(attempts.current),
          durationMs: String(durationMs),
          accuracy: String(accuracy),
        },
      });
      return;
    }
    setBeatIndex((index) => index + 1);
    setSheet(null);
  };

  const tray = useMemo(
    () =>
      allowed
        .filter((value) => value === 1 || value === 10 || value === 100)
        .sort((left, right) => right - left),
    [allowed],
  );

  if (!lesson || !beat) {
    return (
      <PaperScreen includeBottom>
        <Text style={styles.missing}>That lesson is not in Tens Town yet.</Text>
      </PaperScreen>
    );
  }

  const { split } = useAppLayout();
  const tradeCopy = tradeDetail(lastTrade);
  const formula =
    lastTrade === "break" ? "1 ten → 10 ones" : lastTrade === "make" || lastTrade === "auto" ? "10 ones → 1 ten" : undefined;

  return (
    <PaperScreen style={styles.wrap} includeBottom>
      <LessonChrome
        progress={progress}
        prompt={beat.prompt}
        onQuit={() => setSheet("quit")}
        partName={part?.name}
        bait={
          isMixLesson(lesson.id)
            ? lesson.skillId === "rewind-mix"
              ? "Earn 3 stars to temper Smith"
              : undefined
            : undefined
        }
        unlocked={smith.unlocked}
        tempered={smith.tempered}
      />
      <PlayStage
        stage={
      <View style={[styles.mat, split ? styles.matSplit : null]}>
        <View style={styles.meterBlock}>
          <View style={styles.meterHead}>
            <Text style={styles.matHint}>{hintForCoach(coach.kind)}</Text>
            <Text style={styles.place}>{placeLine(hundreds, tens, ones, allowed.includes(100))}</Text>
          </View>
          {split ? (
            <Text
              style={[styles.liveSplit, hitTarget ? styles.liveHot : null]}
              accessibilityLiveRegion="polite"
            >
              {total} of {target}
            </Text>
          ) : (
            <>
              <Text
                style={[styles.live, hitTarget ? styles.liveHot : null]}
                accessibilityLiveRegion="polite"
              >
                {total}
              </Text>
              <View style={styles.meter}>
                <View style={[styles.meterFill, { width: `${Math.round(fill * 100)}%` }]} />
              </View>
              <Text style={styles.goal}>{total} of {target}</Text>
            </>
          )}
        </View>
        <View style={styles.chart}>
          {allowed.includes(100) || hundreds > 0 ? (
            <Pressable
              onPress={() => {
                const last = [...hundredsTiles].at(-1);
                if (!last) return;
                playSfx("tile");
                setBoard((current) => removeTile(current, last.id));
                notePlay();
              }}
              disabled={hundreds === 0}
              style={[styles.tensCard, allowed.includes(100) ? styles.slimCard : null]}
              accessibilityRole="button"
              accessibilityLabel={`${hundreds} hundreds`}
              accessibilityHint="Tap to take away one hundred"
            >
              <View style={styles.tensHead}>
                <Text style={styles.colLabel}>100s</Text>
                <Text style={styles.hundredsCount}>{hundreds}</Text>
              </View>
              <View style={styles.rodPile}>
                {hundredsTiles.map((tile) => (
                  <View key={tile.id} style={styles.miniFlat} />
                ))}
              </View>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              const last = [...tensTiles].at(-1);
              if (!last) return;
              playSfx("tile");
              setBoard((current) => removeTile(current, last.id));
              notePlay();
            }}
            disabled={tens === 0}
            style={[styles.tensCard, allowed.includes(100) ? styles.slimCard : null]}
            accessibilityRole="button"
            accessibilityLabel={`${tens} tens`}
            accessibilityHint="Tap to take away one ten"
          >
            <View style={styles.tensHead}>
              <Text style={styles.colLabel}>Tens</Text>
              <Text style={styles.tensCount}>{tens}</Text>
            </View>
            <View style={styles.rodPile}>
              {tensTiles.map((tile) => (
                <View key={tile.id} style={styles.miniRod} />
              ))}
            </View>
          </Pressable>
          <OnesTenFrame
            ones={ones}
            frame={showsOnesTenFrame(beat, ones)}
            onRemoveOne={ones > 0 ? onRemoveOne : undefined}
          />
        </View>
      </View>
        }
        dock={
          <>
      <TradeCoach tip={coach} onAskHint={() => setAsked(true)} />
      <View style={styles.tray}>
        {tray.map((value) => (
          <Animated.View
            key={value}
            style={
              pulseTile(coach.kind, value) && !reduced
                ? { animationName: pulse, animationDuration: 1400, animationIterationCount: "infinite" }
                : undefined
            }
          >
            <PlaceValueTile
              value={value}
              label={value === 1 ? "+1" : value === 10 ? "+10" : "+100"}
              onPress={() => onAdd(value)}
            />
          </Animated.View>
        ))}
        {showMake ? (
          <TradeAction
            label="Make a ten"
            ready={canMake}
            accessibilityLabel="Trade 10 ones for 1 ten"
            onPress={onMakeTen}
          />
        ) : null}
        {isSubtractBeat(beat) ? (
          <TradeAction
            label="Break a ten"
            ready={tens > 0}
            accessibilityLabel="Break a ten into ten ones"
            onPress={onBreakTen}
          />
        ) : null}
      </View>
      <KidButton
        label="Check"
        tone={board.tiles.length === 0 ? "disabled" : "primary"}
        onPress={onCheck}
        style={styles.check}
      />
          </>
        }
      />

      {sheet === "correct" ? (
        <FeedbackSheet
          variant="correct"
          title={tradeCopy && (lastTrade === "make" || lastTrade === "auto") ? "You made a ten!" : hitTarget ? `${target}!` : "Nice"}
          detail={
            tradeCopy ??
            hitCopy(tens, ones, target, hundreds)
          }
          formula={formula}
          action="Continue"
          onAction={onContinue}
        />
      ) : null}
      {sheet === "incorrect" ? (
        <FeedbackSheet
          variant="incorrect"
          title="Almost"
          detail={missCoach({ beat, ones, tens, hundreds, total, target })}
          action="Got it"
          onAction={() => setSheet(null)}
        />
      ) : null}
      {sheet === "quit" ? (
        <View style={styles.quit}>
          <DigitSmith mood="sad" size={72} compact unlocked={smith.unlocked} tempered={smith.tempered} />
          <Text style={styles.quitTitle}>Keep forging?</Text>
          <KidButton label="Keep playing" onPress={() => setSheet(null)} />
          <KidButton label="Quit" tone="ghost" onPress={() => leavePlay(router)} />
        </View>
      ) : null}
    </PaperScreen>
  );
}

function TradeAction({
  label,
  ready,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  ready: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      style={[
        styles.tradeWrap,
        ready && !reduced
          ? { animationName: pulse, animationDuration: 1400, animationIterationCount: "infinite" }
          : undefined,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={!ready}
        style={[styles.trade, ready ? styles.tradeReady : styles.tradeWait]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !ready }}
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={[styles.tradeText, ready ? null : styles.tradeWaitText]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function pulseTile(kind: CoachKind, value: PlaceValue): boolean {
  switch (kind) {
    case "compose-hundreds":
      return value === 100;
    case "compose-tens":
      return value === 10;
    case "compose-ones":
    case "fill-ones":
      return value === 1;
    case "make-ten":
    case "break-ten":
    case "take-ones":
    case "too-much":
    case "check":
    case "idle":
      return false;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function hintForCoach(kind: CoachKind): string {
  switch (kind) {
    case "fill-ones":
    case "compose-ones":
      return "Add ones";
    case "compose-hundreds":
      return "Add hundreds";
    case "compose-tens":
      return "Add tens";
    case "make-ten":
      return "Trade for a ten";
    case "break-ten":
      return "Break a ten";
    case "take-ones":
      return "Take ones away";
    case "too-much":
      return "Too many";
    case "check":
      return "Looks right";
    case "idle":
      return "Build it up";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  missing: {
    marginTop: 40,
    ...type.headline,
    color: colors.ink,
  },
  mat: {
    flex: 1,
    minHeight: 0,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    justifyContent: "space-between",
    ...shadow.card,
    ...squircle,
  },
  meterBlock: {
    flexShrink: 1,
    minHeight: 0,
  },
  matSplit: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  liveSplit: {
    ...type.headline,
    color: colors.ink,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  meterHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matHint: {
    ...type.footnote,
    color: colors.lock,
  },
  place: {
    ...type.footnote,
    color: colors.teal,
  },
  live: {
    ...type.display,
    fontSize: 44,
    lineHeight: 50,
    color: colors.ink,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  liveHot: {
    color: colors.teal,
  },
  meter: {
    height: 12,
    borderRadius: 99,
    backgroundColor: colors.paperDeep,
    overflow: "hidden",
    marginTop: spacing.sm,
  },
  meterFill: {
    height: "100%",
    backgroundColor: colors.teal,
    borderRadius: 99,
  },
  goal: {
    ...type.footnote,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  chart: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 108,
  },
  tensCard: {
    width: 88,
    minHeight: 108,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.paper,
    ...squircle,
  },
  slimCard: {
    width: 72,
  },
  tensHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  colLabel: {
    ...type.caption,
    color: colors.inkSoft,
    textTransform: "uppercase",
  },
  tensCount: {
    ...type.caption,
    color: colors.amber,
  },
  hundredsCount: {
    ...type.caption,
    color: colors.rose,
  },
  rodPile: {
    gap: 3,
  },
  miniRod: {
    height: 8,
    borderRadius: 3,
    backgroundColor: colors.amber,
  },
  miniFlat: {
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.rose,
  },
  tray: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    flexShrink: 0,
  },
  tradeWrap: {
    flexShrink: 1,
  },
  trade: {
    minHeight: hit.kid,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    justifyContent: "center",
    ...squircle,
  },
  tradeReady: {
    backgroundColor: colors.amberSoft,
    ...shadow.rest,
  },
  tradeWait: {
    backgroundColor: colors.paperDeep,
  },
  tradeText: {
    ...type.headline,
    color: colors.ink,
  },
  tradeWaitText: {
    color: colors.lock,
  },
  check: {
    flexShrink: 0,
  },
  quit: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xxl,
  },
  quitTitle: {
    ...type.title,
    color: colors.ink,
  },
});

function placeLine(hundreds: number, tens: number, ones: number, showHundreds: boolean): string {
  const bits: string[] = [];
  if (showHundreds || hundreds > 0) {
    bits.push(hundreds === 1 ? "1 hundred" : `${hundreds} hundreds`);
  }
  bits.push(tens === 1 ? "1 ten" : `${tens} tens`);
  bits.push(ones === 1 ? "1 one" : `${ones} ones`);
  return bits.join(" · ");
}

function boardForBeat(beat: ForgeBeat | undefined): ForgeBoard {
  if (!beat) return emptyBoard();
  switch (beat.kind) {
    case "operate":
      return seedBoardFromTotal(beat.start, "op");
    case "compose":
      return beat.prefill ? seedBoardFromTotal(beat.prefill, "pre") : emptyBoard();
    default: {
      const _exhaustive: never = beat;
      return _exhaustive;
    }
  }
}
