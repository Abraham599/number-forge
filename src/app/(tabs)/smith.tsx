import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
import { KidButton } from "@/components/KidButton";
import { PaperScreen } from "@/components/PaperScreen";
import { Surface } from "@/components/Surface";
import { openForgeLesson, openWorldNode } from "@/navigation/open-node";
import { playSfx } from "@/lib/sound";
import { isSmithTempered, masteredLessonIds } from "@/progress/db";
import { useAppState } from "@/progress/store";
import { allParts, smithSnapshot, type SmithPart } from "@/smith/parts";
import { colors, hit, spacing, type } from "@/theme/tokens";

export default function SmithScreen() {
  const router = useRouter();
  const gradeBand = useAppState((state) => state.gradeBand) ?? "g23";
  const soundOn = useAppState((state) => state.soundOn);
  const hapticsOn = useAppState((state) => state.hapticsOn);
  const setSoundOn = useAppState((state) => state.setSoundOn);
  const setHapticsOn = useAppState((state) => state.setHapticsOn);
  const [tick, setTick] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setTick((value) => value + 1);
    }, []),
  );
  const snap = useMemo(
    () => smithSnapshot(gradeBand, new Set(masteredLessonIds()), { tempered: isSmithTempered() }),
    [gradeBand, tick],
  );
  const next = snap.current;
  const nextPart = snap.nextPart;

  return (
    <PaperScreen style={styles.wrap}>
      <View style={styles.hero}>
        <DigitSmith
          size={128}
          lively
          mood="idle"
          unlocked={snap.unlocked}
          highlight={nextPart?.id}
          tempered={snap.tempered}
        />
        <Text style={styles.name}>Digit smith</Text>
        <Text style={styles.parts}>
          {snap.unlocked.length === 0
            ? "Earn 3 stars. Smith grows that part."
            : `${snap.unlocked.length} of ${allParts().length} parts on Smith.`}
        </Text>
      </View>
      {next?.kind === "chest" ? (
        <KidButton label="Keep Smith sharp" onPress={() => openForgeLesson(router, "forge-daily")} />
      ) : next ? (
        <KidButton
          label={nextPart ? `Forge the ${nextPart.name}` : `Play ${next.label}`}
          onPress={() => openWorldNode(router, next)}
        />
      ) : null}
      <ScrollView
        style={styles.shelf}
        contentContainerStyle={styles.shelfInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {allParts().map((part) => (
            <PartChip key={part.id} part={part} on={snap.unlocked.includes(part.id)} />
          ))}
        </View>
        <Surface contentStyle={styles.card}>
          <Toggle
            label="Sound"
            on={soundOn}
            onPress={() => {
              if (soundOn) {
                setSoundOn(false);
                return;
              }
              setSoundOn(true);
              playSfx("click");
            }}
          />
          <Toggle
            label="Buzz"
            on={hapticsOn}
            onPress={() => {
              playSfx("click");
              setHapticsOn(!hapticsOn);
            }}
          />
        </Surface>
      </ScrollView>
    </PaperScreen>
  );
}

function PartChip({ part, on }: { part: SmithPart; on: boolean }) {
  return (
    <View style={[styles.chip, on ? styles.chipOn : null]}>
      <Text style={[styles.chipName, on ? styles.chipNameOn : null]}>{part.name}</Text>
      <Text style={styles.chipHint} numberOfLines={1}>
        {on ? part.blurb : "Locked"}
      </Text>
    </View>
  );
}

function Toggle({
  label,
  on,
  onPress,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      style={styles.toggle}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleValue}>{on ? "On" : "Off"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
  },
  name: {
    ...type.title,
    color: colors.ink,
  },
  parts: {
    ...type.body,
    color: colors.inkSoft,
    textAlign: "center",
  },
  shelf: {
    flex: 1,
  },
  shelfInner: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chipOn: {
    backgroundColor: colors.tealSoft,
  },
  chipName: {
    ...type.footnote,
    color: colors.lock,
  },
  chipNameOn: {
    color: colors.tealDeep,
  },
  chipHint: {
    ...type.micro,
    color: colors.inkSoft,
    marginTop: 2,
  },
  card: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  toggle: {
    minHeight: hit.kid,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabel: {
    ...type.headline,
    color: colors.ink,
  },
  toggleValue: {
    ...type.headline,
    color: colors.teal,
  },
});
