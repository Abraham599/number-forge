import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { KidButton } from "@/components/KidButton";
import { PaperScreen } from "@/components/PaperScreen";
import { Surface } from "@/components/Surface";
import { GRADE_BANDS } from "@/curriculum/tens-town";
import type { GradeBand } from "@/curriculum/types";
import { useAppState } from "@/progress/store";
import { useAppLayout } from "@/theme/layout";
import { colors, spacing, type } from "@/theme/tokens";

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAppState((state) => state.completeOnboarding);
  const [band, setBand] = useState<GradeBand>("g23");
  const { split } = useAppLayout();

  return (
    <PaperScreen style={styles.wrap} includeBottom>
      <Text style={styles.title}>Where do you start?</Text>
      <Text style={styles.sub}>Same town. You will build, compare, bunch, and share numbers.</Text>
      <View style={[styles.cards, split ? styles.cardsRow : null]}>
        {GRADE_BANDS.map((item) => {
          const selected = item.id === band;
          return (
            <Pressable
              key={item.id}
              onPress={() => setBand(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${item.title}. ${item.blurb}`}
              style={split ? styles.cardHit : undefined}
            >
              <Surface
                style={[styles.cardShell, selected ? styles.cardOn : null]}
                contentStyle={styles.card}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardAges}>{item.ages}</Text>
                <Text style={styles.cardBlurb}>{item.blurb}</Text>
              </Surface>
            </Pressable>
          );
        })}
      </View>
      <KidButton
        label="Let's play!"
        onPress={() => {
          completeOnboarding(band);
          router.replace("/(tabs)");
        }}
      />
    </PaperScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    ...type.title,
    color: colors.ink,
  },
  sub: {
    ...type.body,
    color: colors.inkSoft,
    marginBottom: spacing.sm,
  },
  cards: {
    flex: 1,
    gap: spacing.md,
  },
  cardsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  cardHit: {
    flex: 1,
  },
  cardShell: {
    flex: 1,
  },
  card: {
    padding: spacing.xl,
    minHeight: 96,
  },
  cardOn: {
    borderWidth: 2,
    borderColor: colors.teal,
  },
  cardTitle: {
    ...type.subtitle,
    color: colors.ink,
  },
  cardAges: {
    ...type.callout,
    color: colors.teal,
    marginTop: spacing.xs,
  },
  cardBlurb: {
    ...type.body,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
});
