import { Redirect, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DigitSmith } from "@/components/DigitSmith";
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
    <PaperScreen style={styles.wrap}>
      <View style={styles.hero}>
        <DigitSmith size={148} lively unlocked={[]} />
        <Text style={styles.wordmark}>Number Forge</Text>
        <Text style={styles.tag}>Build numbers in Tens Town.</Text>
      </View>
      <KidButton label="Play" onPress={() => router.push("/onboarding")} />
    </PaperScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: "flex-end",
    paddingBottom: spacing.huge,
    gap: spacing.lg,
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
