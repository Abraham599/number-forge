import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
import { KidButton } from "@/components/KidButton";
import { PaperScreen } from "@/components/PaperScreen";
import { Surface } from "@/components/Surface";
import { isMixLesson } from "@/curriculum/tens-town";
import type { LessonMode, SkillId } from "@/curriculum/types";
import { kidHaptic } from "@/lib/haptics";
import { playSfx } from "@/lib/sound";
import { openForgeLesson, openWorldNode } from "@/navigation/open-node";
import { syncProgress } from "@/api/client";
import { isSmithTempered, masteredLessonIds, recordSession, setSmithTempered } from "@/progress/db";
import { starsFromLesson } from "@/progress/mastery";
import { playIdForNode } from "@/progress/path-progress";
import { useAppState } from "@/progress/store";
import { partById, partForPlayId, smithSnapshot } from "@/smith/parts";
import { colors, spacing, type } from "@/theme/tokens";

export default function CompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lessonId: string;
    skillId: SkillId;
    mode: LessonMode;
    correct: string;
    attempts: string;
    durationMs: string;
    accuracy: string;
    stars?: string;
  }>();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const setOfflineChip = useAppState((state) => state.setOfflineChip);

  const stars = useMemo(() => {
    if (params.stars) return Number(params.stars) as 1 | 2 | 3;
    return starsFromLesson({
      correctBeats: Number(params.correct ?? 0),
      totalBeats: Number(params.attempts ?? 1),
      durationMs: Number(params.durationMs ?? 0),
    });
  }, [params]);

  const xp = stars * 10;
  const lessonId = params.lessonId ?? "";
  const part = partForPlayId(lessonId);
  const priorMastered = useMemo(() => new Set(masteredLessonIds()), []);
  const newlyTempered = stars >= 3 && lessonId === "forge-rewind";
  const displayMastered = useMemo(() => {
    const next = new Set(priorMastered);
    if (stars >= 3 && lessonId) next.add(lessonId);
    return next;
  }, [priorMastered, stars, lessonId]);
  const priorSnap = useMemo(
    () => smithSnapshot(gradeBand, priorMastered, { tempered: isSmithTempered() }),
    [gradeBand, priorMastered],
  );
  const snap = useMemo(
    () => smithSnapshot(gradeBand, displayMastered, { tempered: isSmithTempered() || newlyTempered }),
    [gradeBand, displayMastered, newlyTempered],
  );
  const newPartId = snap.unlocked.find((id) => !priorSnap.unlocked.includes(id));
  const newlyForged = Boolean(newPartId);
  const forgedPart = newPartId ? partById(newPartId) : undefined;
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    recordSession({
      id: `ses-${Date.now()}`,
      lessonId: lessonId || "unknown",
      skillId: params.skillId ?? "compose-ones",
      mode: params.mode ?? "forge",
      stars,
      accuracy: Number(params.accuracy ?? 0),
      durationMs: Number(params.durationMs ?? 0),
    });
    if (newlyTempered) setSmithTempered();
    void kidHaptic("success");
    if (newlyForged || newlyTempered) playSfx("unlock");
    else playSfx("correct");
    void syncProgress().then((ok) => setOfflineChip(!ok));
  }, [lessonId, newlyForged, newlyTempered, params, setOfflineChip, stars]);

  const current = snap.current;
  const stillThis = current ? playIdForNode(current) === lessonId : false;
  const pathDone = current?.kind === "chest";

  const title = (() => {
    if (forgedPart) return `You forged the ${forgedPart.name}!`;
    if (newlyTempered) return "Smith's tools shine!";
    if (stars < 3 && part) return `Earn 3 stars to forge the ${part.name}`;
    return cheer(stars);
  })();

  const keepGoing = () => {
    if (stillThis) {
      if (params.mode === "weave") {
        router.replace({ pathname: "/play/weave", params: { puzzleId: lessonId } });
        return;
      }
      openForgeLesson(router, lessonId, "replace");
      return;
    }
    if (pathDone) {
      router.replace("/(tabs)/smith");
      return;
    }
    if (current) {
      openWorldNode(router, current, "replace");
      return;
    }
    router.replace("/(tabs)/smith");
  };

  return (
    <PaperScreen style={styles.wrap}>
      <DigitSmith
        size={140}
        mood="glad"
        unlocked={snap.unlocked}
        highlight={newPartId}
        tempered={snap.tempered || newlyTempered}
      />
      <Text style={styles.title}>{title}</Text>
      {forgedPart ? (
        <Text style={styles.detail}>{forgedPart.blurb}</Text>
      ) : part ? (
        <Text style={styles.detail}>
          {stars < 3
            ? `${stars} of 3 stars. Get every check to forge the ${part.name}.`
            : `${part.name} sits tighter on Smith.`}
        </Text>
      ) : isMixLesson(lessonId) ? (
        <Text style={styles.detail}>
          {newlyTempered ? "Rewind tempered Smith's tools." : "Same forge. Fresh numbers."}
        </Text>
      ) : null}
      <Text style={styles.stars}>{"★".repeat(stars)}</Text>
      <View style={styles.row}>
        <Stat label="Stars" value={String(stars)} />
        <Stat label="XP" value={`+${xp}`} />
      </View>
      <KidButton
        label={
          stillThis
            ? "Try again"
            : pathDone
              ? "See Smith"
              : snap.nextPart
                ? `Forge the ${snap.nextPart.name}`
                : current
                  ? `Play ${current.label}`
                  : "See Smith"
        }
        onPress={keepGoing}
      />
      <KidButton
        label="See Smith"
        tone="ghost"
        onPress={() => router.replace("/(tabs)/smith")}
      />
    </PaperScreen>
  );
}

function cheer(stars: number): string {
  if (stars >= 3) return "You did it!";
  if (stars >= 2) return "Nice!";
  return "Good try!";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Surface style={styles.stat} contentStyle={styles.statInner}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingBottom: spacing.huge,
  },
  title: {
    ...type.title,
    color: colors.ink,
    textAlign: "center",
  },
  detail: {
    ...type.body,
    color: colors.inkSoft,
    textAlign: "center",
  },
  stars: {
    ...type.display,
    color: colors.amber,
    letterSpacing: 6,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  stat: {
    flex: 1,
  },
  statInner: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  statLabel: {
    ...type.caption,
    color: colors.inkSoft,
  },
  statValue: {
    ...type.subtitle,
    color: colors.teal,
    marginTop: spacing.xs,
  },
});
