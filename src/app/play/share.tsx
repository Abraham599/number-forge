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
import { generateShareLesson } from "@/curriculum/generate";
import { shareLessonById } from "@/curriculum/tens-town";
import { leavePlay } from "@/navigation/open-node";
import { checkShare, shareCoach, shareEach, shareHitCopy, shareLeft } from "@/game/bunch/engine";
import { COACH_IDLE_MS, visibleCoach } from "@/game/forge/coach";
import { kidHaptic } from "@/lib/haptics";
import { playSfx } from "@/lib/sound";
import { usePlayMusic } from "@/lib/use-play-music";
import { isSmithTempered, listSkills, masteredLessonIds } from "@/progress/db";
import { useAppState } from "@/progress/store";
import { partForPlayId, smithSnapshot } from "@/smith/parts";
import { useAppLayout } from "@/theme/layout";
import { colors, radius, shadow, spacing, squircle, type } from "@/theme/tokens";

type Sheet = "correct" | "incorrect" | "quit" | null;

export default function ShareScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const template = shareLessonById(lessonId ?? "");
  const seed = useRef(Date.now()).current;
  const lesson = useMemo(
    () => (template ? generateShareLesson(template, gradeBand, seed) : undefined),
    [template, gradeBand, seed],
  );
  const part = partForPlayId(lessonId ?? "");
  const smith = smithSnapshot(gradeBand, new Set(masteredLessonIds()), { tempered: isSmithTempered() });
  usePlayMusic();
  const startedAt = useRef(Date.now());
  const attempts = useRef(0);
  const correct = useRef(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [counts, setCounts] = useState<number[]>([]);
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
  const left = beat ? shareLeft(counts, beat.total) : 0;
  const rawCoach = beat ? shareCoach(counts, beat.total) : { kind: "idle" as const, kicker: "", text: "" };
  const coach = visibleCoach(rawCoach, {
    introduce: !skillMastered,
    moved,
    missed,
    idle,
    asked,
  });

  useEffect(() => {
    const bowls = lesson?.beats[beatIndex]?.bowls ?? 0;
    setCounts(Array.from({ length: bowls }, () => 0));
    setMoved(false);
    setMissed(false);
    setAsked(false);
  }, [lesson, beatIndex]);

  useEffect(() => {
    if (sheet !== null) return;
    setIdle(false);
    const timer = setTimeout(() => setIdle(true), COACH_IDLE_MS);
    return () => clearTimeout(timer);
  }, [activityTick, sheet, beatIndex]);

  const notePlay = () => {
    setMoved(true);
    setMissed(false);
    setAsked(false);
    setActivityTick((tick) => tick + 1);
  };

  const dropIn = (index: number) => {
    if (!beat || left <= 0) return;
    playSfx("tile");
    setCounts((current) => current.map((count, i) => (i === index ? count + 1 : count)));
    notePlay();
    void kidHaptic("light");
  };

  const takeBack = (index: number) => {
    if ((counts[index] ?? 0) <= 0) return;
    playSfx("tile");
    setCounts((current) => current.map((count, i) => (i === index ? Math.max(0, count - 1) : count)));
    notePlay();
  };

  const onCheck = () => {
    if (!lesson || !beat) return;
    attempts.current += 1;
    if (checkShare(counts, beat.total)) {
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
          mode: "share",
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

  const { split, foldGutter } = useAppLayout();

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
        <Text style={styles.left}>{left === 0 ? "All shared" : `${left} left`}</Text>
        <View style={[styles.bowls, { gap: split ? foldGutter : spacing.sm }]}>
          {counts.map((count, index) => (
            <View key={index} style={styles.bowl}>
              <Pressable
                onPress={() => dropIn(index)}
                style={styles.bowlHit}
                accessibilityRole="button"
                accessibilityLabel={`Bowl ${index + 1}, ${count}`}
                accessibilityHint="Tap to share one"
              >
                <Text style={styles.bowlCount}>{count}</Text>
              </Pressable>
              <View style={styles.cubes}>
                {Array.from({ length: Math.min(count, 6) }, (_, cube) => (
                  <Pressable
                    key={cube}
                    onPress={() => takeBack(index)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel="Take one back"
                  >
                    <View style={styles.cube} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
        }
        dock={
          <>
      <TradeCoach tip={coach} onAskHint={() => setAsked(true)} />
      <KidButton label="Check" tone={left > 0 ? "disabled" : "primary"} onPress={onCheck} />
          </>
        }
      />
      {sheet === "correct" ? (
        <FeedbackSheet
          variant="correct"
          title="Even!"
          detail={shareHitCopy(beat.total, beat.bowls)}
          formula={`${shareEach(beat.total, beat.bowls)} each`}
          action="Continue"
          onAction={onContinue}
        />
      ) : null}
      {sheet === "incorrect" ? (
        <FeedbackSheet
          variant="incorrect"
          title="Almost"
          detail={left > 0 ? "Share every cube first." : "Bowls should match. Tap a cube to move it."}
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
    padding: spacing.md,
    backgroundColor: colors.white,
    ...shadow.card,
    ...squircle,
  },
  left: {
    ...type.headline,
    color: colors.teal,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  bowls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  bowl: {
    width: 96,
    minHeight: 110,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.paper,
    alignItems: "center",
    ...squircle,
  },
  bowlHit: {
    minHeight: 44,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  bowlCount: {
    ...type.subtitle,
    color: colors.ink,
  },
  cubes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  cube: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.amber,
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
