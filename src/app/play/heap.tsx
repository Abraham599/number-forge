import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
import { FeedbackSheet } from "@/components/FeedbackSheet";
import { KidButton } from "@/components/KidButton";
import { LessonChrome } from "@/components/LessonChrome";
import { PaperScreen } from "@/components/PaperScreen";
import { TradeCoach } from "@/components/TradeCoach";
import { generateHeapLesson } from "@/curriculum/generate";
import { heapLessonById } from "@/curriculum/tens-town";
import { leavePlay } from "@/navigation/open-node";
import { COACH_IDLE_MS, visibleCoach } from "@/game/forge/coach";
import { checkHeap, heapCoach, heapHitCopy, showsHeapDots, type HeapPick } from "@/game/heap/engine";
import { kidHaptic } from "@/lib/haptics";
import { usePlayMusic } from "@/lib/use-play-music";
import { isSmithTempered, listSkills, masteredLessonIds } from "@/progress/db";
import { useAppState } from "@/progress/store";
import { partForPlayId, smithSnapshot } from "@/smith/parts";
import { colors, radius, shadow, spacing, squircle, type } from "@/theme/tokens";

type Sheet = "correct" | "incorrect" | "quit" | null;

export default function HeapScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const template = heapLessonById(lessonId ?? "");
  const seed = useRef(Date.now()).current;
  const lesson = useMemo(
    () => (template ? generateHeapLesson(template, gradeBand, seed) : undefined),
    [template, gradeBand, seed],
  );
  const part = partForPlayId(lessonId ?? "");
  const smith = smithSnapshot(gradeBand, new Set(masteredLessonIds()), { tempered: isSmithTempered() });
  usePlayMusic();
  const startedAt = useRef(Date.now());
  const attempts = useRef(0);
  const correct = useRef(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [pick, setPick] = useState<HeapPick | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [moved, setMoved] = useState(false);
  const [missed, setMissed] = useState(false);
  const [asked, setAsked] = useState(false);
  const [idle, setIdle] = useState(false);
  const [activityTick, setActivityTick] = useState(0);
  const skillMastered = useMemo(() => {
    const row = listSkills().find((skill) => skill.skill_id === lesson?.skillId);
    return row?.status === "mastered" || (row?.stars ?? 0) >= 3;
  }, [lesson?.skillId]);

  const beat = lesson?.beats[beatIndex];
  const rawCoach = beat ? heapCoach(beat.left, beat.right, pick) : { kind: "idle" as const, kicker: "", text: "" };
  const coach = visibleCoach(rawCoach, {
    introduce: !skillMastered,
    moved,
    missed,
    idle,
    asked,
  });

  useEffect(() => {
    setPick(null);
    setMoved(false);
    setMissed(false);
    setAsked(false);
  }, [beatIndex]);

  useEffect(() => {
    if (sheet !== null) return;
    setIdle(false);
    const timer = setTimeout(() => setIdle(true), COACH_IDLE_MS);
    return () => clearTimeout(timer);
  }, [activityTick, sheet, beatIndex]);

  const notePick = (next: HeapPick) => {
    setPick(next);
    setMoved(true);
    setMissed(false);
    setAsked(false);
    setActivityTick((tick) => tick + 1);
    void kidHaptic("light");
  };

  const onCheck = () => {
    if (!lesson || !beat) return;
    attempts.current += 1;
    if (checkHeap(beat.left, beat.right, pick)) {
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
      router.replace({
        pathname: "/play/complete",
        params: {
          lessonId: lesson.id,
          skillId: lesson.skillId,
          mode: "heap",
          correct: String(correct.current),
          attempts: String(attempts.current),
          durationMs: String(Date.now() - startedAt.current),
          accuracy: String(correct.current / Math.max(attempts.current, 1)),
        },
      });
      return;
    }
    setBeatIndex((index) => index + 1);
    setSheet(null);
  };

  if (!lesson || !beat) {
    return (
      <PaperScreen>
        <Text style={styles.missing}>That lesson is not in Tens Town yet.</Text>
      </PaperScreen>
    );
  }

  const dots = showsHeapDots(beat.left, beat.right);
  const max = Math.max(beat.left, beat.right, 1);

  return (
    <PaperScreen style={styles.wrap}>
      <LessonChrome
        progress={(beatIndex + 0.15) / lesson.beats.length}
        prompt={beat.prompt}
        onQuit={() => setSheet("quit")}
        partName={part?.name}
        unlocked={smith.unlocked}
        tempered={smith.tempered}
      />
      <View style={styles.mat}>
        <View style={styles.piles}>
          <HeapPile
            label="This pile"
            value={beat.left}
            max={max}
            dots={dots}
            selected={pick === "left"}
            onPress={() => notePick("left")}
          />
          <HeapPile
            label="This pile"
            value={beat.right}
            max={max}
            dots={dots}
            selected={pick === "right"}
            onPress={() => notePick("right")}
          />
        </View>
        <Pressable
          onPress={() => notePick("same")}
          style={[styles.same, pick === "same" ? styles.sameOn : null]}
          accessibilityRole="button"
          accessibilityState={{ selected: pick === "same" }}
          accessibilityLabel="Same"
        >
          <Text style={[styles.sameText, pick === "same" ? styles.sameTextOn : null]}>Same</Text>
        </Pressable>
      </View>
      <TradeCoach tip={coach} onAskHint={() => setAsked(true)} />
      <KidButton label="Check" tone={pick == null ? "disabled" : "primary"} onPress={onCheck} />
      {sheet === "correct" ? (
        <FeedbackSheet
          variant="correct"
          title="Yes!"
          detail={heapHitCopy(beat.left, beat.right)}
          action="Continue"
          onAction={onContinue}
        />
      ) : null}
      {sheet === "incorrect" ? (
        <FeedbackSheet
          variant="incorrect"
          title="Almost"
          detail={beat.left === beat.right ? "Those piles match. Tap Same." : "Tap the pile with more."}
          action="Got it"
          onAction={() => setSheet(null)}
        />
      ) : null}
      {sheet === "quit" ? (
        <View style={styles.quit}>
          <DigitSmith mood="sad" size={72} compact unlocked={smith.unlocked} tempered={smith.tempered} />
          <Text style={styles.quitTitle}>Keep playing?</Text>
          <KidButton label="Keep playing" onPress={() => setSheet(null)} />
          <KidButton label="Quit" tone="ghost" onPress={() => leavePlay(router)} />
        </View>
      ) : null}
    </PaperScreen>
  );
}

function HeapPile({
  label,
  value,
  max,
  dots,
  selected,
  onPress,
}: {
  label: string;
  value: number;
  max: number;
  dots: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pile, selected ? styles.pileOn : null]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}, ${value}`}
    >
      <Text style={styles.pileLabel}>{label}</Text>
      <Text style={[styles.pileValue, selected ? styles.pileValueOn : null]}>{value}</Text>
      {dots ? (
        <View style={styles.dots}>
          {Array.from({ length: value }, (_, index) => (
            <View key={index} style={styles.dot} />
          ))}
        </View>
      ) : (
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${Math.round((value / max) * 100)}%` }]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
    padding: spacing.md,
    backgroundColor: colors.white,
    gap: spacing.md,
    ...shadow.card,
    ...squircle,
  },
  piles: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  pile: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.paper,
    borderWidth: 3,
    borderColor: "transparent",
    ...squircle,
  },
  pileOn: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  pileLabel: {
    ...type.caption,
    color: colors.inkSoft,
    textTransform: "uppercase",
  },
  pileValue: {
    ...type.display,
    fontSize: 44,
    lineHeight: 50,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  pileValueOn: {
    color: colors.tealDeep,
  },
  dots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.teal,
  },
  bar: {
    height: 10,
    borderRadius: 99,
    backgroundColor: colors.paperDeep,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.teal,
    borderRadius: 99,
  },
  same: {
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderWidth: 3,
    borderColor: "transparent",
    ...squircle,
  },
  sameOn: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  sameText: {
    ...type.headline,
    color: colors.ink,
  },
  sameTextOn: {
    color: colors.tealDeep,
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
