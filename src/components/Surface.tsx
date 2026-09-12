import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadowLayer, squircle } from "@/theme/tokens";

type Level = keyof typeof shadowLayer;

type Props = {
  children: ReactNode;
  level?: Level;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Surface({ children, level = "card", style, contentStyle }: Props) {
  const layers = shadowLayer[level];
  return (
    <View style={[styles.base, layers.ambient, style]}>
      <View style={[styles.inner, layers.key, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    ...squircle,
  },
  inner: {
    borderRadius: radius.lg,
    ...squircle,
  },
});
