import { Redirect, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
import { DuoPane } from "@/components/DuoPane";
import { KidButton } from "@/components/KidButton";
import { PaperScreen } from "@/components/PaperScreen";
import { useAppState } from "@/progress/store";
import { colors, spacing, type } from "@/theme/tokens";

export default function WelcomeScreen() {
  const router = useRouter();
  const onboardingDone = useAppState((state) => state.onboardingDone);

  if (onboardingDone) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <PaperScreen style={styles.wrap} includeBottom>
      <DuoPane
        primary={
          <View style={styles.hero}>
            <DigitSmith size={148} lively unlocked={[]} />
            <Text style={styles.wordmark}>Number Forge</Text>
            <Text style={styles.tag}>Build numbers in Tens Town.</Text>
          </View>
        }
        secondary={
          <View style={styles.cta}>
            <KidButton label="Play" onPress={() => router.push("/onboarding")} />
          </View>
        }
      />
    </PaperScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.huge,
  },
  cta: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: spacing.sm,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  wordmark: {
    ...type.display,
    color: colors.ink,
  },
  tag: {
    ...type.body,
    color: colors.inkSoft,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
