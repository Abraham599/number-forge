import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
import { FeedbackSheet } from "@/components/FeedbackSheet";
import { KidButton } from "@/components/KidButton";
import { LessonChrome } from "@/components/LessonChrome";
import { PaperScreen } from "@/components/PaperScreen";
import { PlayStage } from "@/components/PlayStage";
import { TradeCoach } from "@/components/TradeCoach";
import { generateSliceLesson } from "@/curriculum/generate";
import { sliceLessonById } from "@/curriculum/tens-town";
import { leavePlay } from "@/navigation/open-node";
import { COACH_IDLE_MS, visibleCoach } from "@/game/forge/coach";
import { checkSlice, nextFilled, sliceCoach, sliceWords } from "@/game/slice/engine";
import { kidHaptic } from "@/lib/haptics";
import { playSfx } from "@/lib/sound";
import { usePlayMusic } from "@/lib/use-play-music";
import { isSmithTempered, listSkills, masteredLessonIds } from "@/progress/db";
import { useAppState } from "@/progress/store";
import { partForPlayId, smithSnapshot } from "@/smith/parts";
import { colors, radius, shadow, spacing, squircle, type } from "@/theme/tokens";

type Sheet = "correct" | "incorrect" | "quit" | null;

export default function SliceScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g45";
  const template = sliceLessonById(lessonId ?? "");
  const seed = useRef(Date.now()).current;
  const lesson = useMemo(
    () => (template ? generateSliceLesson(template, gradeBand, seed) : undefined),
    [template, gradeBand, seed],
  );
  const part = partForPlayId(lessonId ?? "");
  const smith = smithSnapshot(gradeBand, new Set(masteredLessonIds()), { tempered: isSmithTempered() });
  usePlayMusic();
  const startedAt = useRef(Date.now());
  const attempts = useRef(0);
  const correct = useRef(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [filled, setFilled] = useState(0);
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
  const rawCoach = beat ? sliceCoach(filled, beat.num) : { kind: "idle" as const, kicker: "", text: "" };
  const coach = visibleCoach(rawCoach, {
    introduce: !skillMastered,
    moved,
    missed,
    idle,
    asked,
  });

  useEffect(() => {
    setFilled(0);
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

  const onTap = (index: number) => {
    playSfx("tile");
    setFilled((current) => nextFilled(current, index));
    setMoved(true);
    setMissed(false);
    setAsked(false);
    setActivityTick((tick) => tick + 1);
    void kidHaptic("light");
  };

  const onCheck = () => {
    if (!lesson || !beat) return;
    attempts.current += 1;
    if (checkSlice(filled, beat.num)) {
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
          mode: "slice",
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
      <PaperScreen includeBottom>
        <Text style={styles.missing}>That lesson is not in Tens Town yet.</Text>
      </PaperScreen>
    );
  }

  return (
    <PaperScreen style={styles.wrap} includeBottom>
      <LessonChrome
        progress={(beatIndex + 0.15) / lesson.beats.length}
        prompt={beat.prompt}
        onQuit={() => setSheet("quit")}
        partName={part?.name}
        unlocked={smith.unlocked}
        tempered={smith.tempered}
      />
      <PlayStage
        stage={
      <View style={styles.mat}>
        <Text style={styles.live}>
          {filled} / {beat.den}
        </Text>
        <View style={styles.bar}>
          {Array.from({ length: beat.den }, (_, index) => {
            const on = index < filled;
            return (
              <Pressable
                key={index}
                onPress={() => onTap(index)}
                style={[styles.slice, on ? styles.sliceOn : styles.sliceOff, index === 0 ? styles.sliceFirst : null]}
                accessibilityRole="button"
                accessibilityLabel={`Part ${index + 1}${on ? ", colored" : ""}`}
              />
            );
          })}
        </View>
      </View>
        }
        dock={
          <>
      <TradeCoach tip={coach} onAskHint={() => setAsked(true)} />
      <KidButton label="Check" tone={filled === 0 ? "disabled" : "primary"} onPress={onCheck} />
          </>
        }
      />
      {sheet === "correct" ? (
        <FeedbackSheet
          variant="correct"
          title="Nice!"
          detail={sliceWords(beat.num, beat.den)}
          formula={`${beat.num} / ${beat.den}`}
          action="Continue"
          onAction={onContinue}
        />
      ) : null}
      {sheet === "incorrect" ? (
        <FeedbackSheet
          variant="incorrect"
          title="Almost"
          detail={`Color ${beat.num} of the ${beat.den} parts.`}
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
    padding: spacing.lg,
    backgroundColor: colors.white,
    justifyContent: "center",
    gap: spacing.xl,
    ...shadow.card,
    ...squircle,
  },
  live: {
    ...type.display,
    color: colors.ink,
    textAlign: "center",
  },
  bar: {
    flexDirection: "row",
    height: 88,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.paperDeep,
  },
  slice: {
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: colors.white,
  },
  sliceFirst: {
    borderLeftWidth: 0,
  },
  sliceOn: {
    backgroundColor: colors.teal,
  },
  sliceOff: {
    backgroundColor: colors.paperDeep,
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
