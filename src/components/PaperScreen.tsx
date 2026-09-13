import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLayout } from "@/theme/layout";
import { canvas, colors } from "@/theme/tokens";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Play and other full-screen tasks always inset from the home indicator. */
  includeBottom?: boolean;
};

export function PaperScreen({ children, style, includeBottom }: Props) {
  const { sideChrome } = useAppLayout();
  const edges =
    includeBottom || sideChrome
      ? (["top", "right", "bottom", "left"] as const)
      : (["top", "right", "left"] as const);
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.body, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  body: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    paddingHorizontal: canvas.inset,
  },
});
