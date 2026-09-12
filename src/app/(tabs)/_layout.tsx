import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing, type } from "@/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Path",
          tabBarIcon: ({ color }) => <Glyph color={String(color)} glyph="◎" />,
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: "Garden",
          tabBarIcon: ({ color }) => <Glyph color={String(color)} glyph="✶" />,
        }}
      />
      <Tabs.Screen
        name="smith"
        options={{
          title: "Smith",
          tabBarIcon: ({ color }) => <Glyph color={String(color)} glyph="⚒" />,
        }}
      />
    </Tabs>
  );
}

function Glyph({ color, glyph }: { color: string; glyph: string }) {
  return (
    <View>
      <Text style={{ color, fontSize: 18, fontFamily: fonts.bold, fontWeight: "600" }}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopColor: colors.paperDeep,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 72,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  label: {
    ...type.micro,
  },
});
