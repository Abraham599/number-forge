import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
import { FeedbackSheet } from "@/components/FeedbackSheet";
import { KidButton } from "@/components/KidButton";
import { LessonChrome } from "@/components/LessonChrome";
import { PaperScreen } from "@/components/PaperScreen";
import { TradeCoach } from "@/components/TradeCoach";
import { generateBunchLesson } from "@/curriculum/generate";
import { bunchLessonById } from "@/curriculum/tens-town";
import { leavePlay } from "@/navigation/open-node";
import { bunchCoach, bunchFormula, bunchTotal, checkBunch } from "@/game/bunch/engine";
import { COACH_IDLE_MS, visibleCoach } from "@/game/forge/coach";
import { kidHaptic } from "@/lib/haptics";
import { playSfx } from "@/lib/sound";
import { usePlayMusic } from "@/lib/use-play-music";
import { isSmithTempered, listSkills, masteredLessonIds } from "@/progress/db";
import { useAppState } from "@/progress/store";
import { partForPlayId, smithSnapshot } from "@/smith/parts";
import { colors, radius, shadow, spacing, squircle, type } from "@/theme/tokens";

type Sheet = "correct" | "incorrect" | "quit" | null;

export default function BunchScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const template = bunchLessonById(lessonId ?? "");
  const seed = useRef(Date.now()).current;
  const lesson = useMemo(
    () => (template ? generateBunchLesson(template, gradeBand, seed) : undefined),
    [template, gradeBand, seed],
  );
  const part = partForPlayId(lessonId ?? "");
  const smith = smithSnapshot(gradeBand, new Set(masteredLessonIds()), { tempered: isSmithTempered() });
  usePlayMusic();
  const startedAt = useRef(Date.now());
  const attempts = useRef(0);
  const correct = useRef(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [stamped, setStamped] = useState(0);
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
  const need = beat?.groups ?? 0;
  const size = beat?.size ?? 0;
  const total = beat ? bunchTotal(stamped, beat.size) : 0;
  const target = beat ? bunchTotal(beat.groups, beat.size) : 0;
  const rawCoach = beat ? bunchCoach(stamped, need) : { kind: "idle" as const, kicker: "", text: "" };
  const coach = visibleCoach(rawCoach, {
    introduce: !skillMastered,
    moved,
    missed,
    idle,
    asked,
  });

  useEffect(() => {
    setStamped(0);
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

  const notePlay = () => {
    setMoved(true);
    setMissed(false);
    setAsked(false);
    setActivityTick((tick) => tick + 1);
  };

  const onCheck = () => {
    if (!lesson || !beat) return;
    attempts.current += 1;
    if (checkBunch(stamped, need)) {
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
          mode: "bunch",
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
        <Text style={[styles.live, stamped === need ? styles.liveHot : null]}>{total}</Text>
        <Text style={styles.eq}>{bunchFormula(stamped, size)}</Text>
        <View style={styles.clusters}>
          {Array.from({ length: stamped }, (_, index) => (
            <Pressable
              key={index}
              onPress={() => {
                playSfx("tile");
                setStamped((count) => Math.max(0, count - 1));
                notePlay();
              }}
              style={styles.cluster}
              accessibilityRole="button"
              accessibilityLabel={`Bunch of ${size}, tap to take away`}
            >
              {Array.from({ length: size }, (__, cube) => (
                <View key={cube} style={styles.cube} />
              ))}
            </Pressable>
          ))}
        </View>
      </View>
      <TradeCoach tip={coach} onAskHint={() => setAsked(true)} />
      <KidButton
        label="+ bunch"
        tone="ghost"
        onPress={() => {
          playSfx("tile");
          setStamped((count) => count + 1);
          notePlay();
          void kidHaptic("light");
        }}
      />
      <KidButton label="Check" tone={stamped === 0 ? "disabled" : "primary"} onPress={onCheck} />
      {sheet === "correct" ? (
        <FeedbackSheet
          variant="correct"
          title={`${target}!`}
          detail={`${need} bunches of ${size} make ${target}.`}
          formula={`${need} × ${size}`}
          action="Continue"
          onAction={onContinue}
        />
      ) : null}
      {sheet === "incorrect" ? (
        <FeedbackSheet
          variant="incorrect"
          title="Almost"
          detail={
            stamped > need
              ? "Too many bunches. Tap one to take it away."
              : `You have ${stamped} bunches. You need ${need}.`
          }
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
  live: {
    ...type.display,
    fontSize: 44,
    lineHeight: 50,
    color: colors.ink,
    textAlign: "center",
  },
  liveHot: {
    color: colors.teal,
  },
  eq: {
    ...type.headline,
    color: colors.inkSoft,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  clusters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  cluster: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    maxWidth: 88,
    ...squircle,
  },
  cube: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.teal,
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
