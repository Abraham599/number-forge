import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { canvas, colors } from "@/theme/tokens";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PaperScreen({ children, style }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.frame}>
        <View style={[styles.body, style]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  frame: {
    flex: 1,
    alignItems: "center",
  },
  body: {
    flex: 1,
    width: "100%",
    maxWidth: canvas.width,
    paddingHorizontal: canvas.inset,
  },
});
