import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppLayout } from "@/theme/layout";
import { colors, fonts, spacing, type } from "@/theme/tokens";

const ITEMS = [
  { href: "/(tabs)" as const, match: "/", title: "Path", glyph: "◎" },
  { href: "/(tabs)/garden" as const, match: "/garden", title: "Garden", glyph: "✶" },
  { href: "/(tabs)/smith" as const, match: "/smith", title: "Smith", glyph: "⚒" },
] as const;

export default function TabsLayout() {
  const { sideChrome } = useAppLayout();
  return (
    <View style={[styles.shell, sideChrome ? styles.shellSide : null]}>
      {sideChrome ? <SideTabRail /> : null}
      <View style={styles.tabs}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.teal,
            tabBarInactiveTintColor: colors.inkSoft,
            tabBarStyle: sideChrome ? styles.barHidden : styles.bar,
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
      </View>
    </View>
  );
}

function SideTabRail() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.rail, { paddingTop: Math.max(insets.top, spacing.lg) }]} accessibilityRole="tablist">
      {ITEMS.map((item) => {
        const on = item.match === "/" ? pathname === "/" || pathname === "/(tabs)" : pathname.includes(item.match);
        return (
          <Pressable
            key={item.title}
            onPress={() => router.replace(item.href)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={item.title}
            style={[styles.railItem, on ? styles.railOn : null]}
          >
            <Glyph color={on ? colors.teal : colors.inkSoft} glyph={item.glyph} />
            <Text style={[styles.railLabel, on ? styles.railLabelOn : null]}>{item.title}</Text>
          </Pressable>
        );
      })}
    </View>
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
  shell: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  shellSide: {
    flexDirection: "row",
  },
  tabs: {
    flex: 1,
    minWidth: 0,
  },
  bar: {
    backgroundColor: colors.white,
    borderTopColor: colors.paperDeep,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 72,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  barHidden: {
    display: "none",
    height: 0,
  },
  label: {
    ...type.micro,
  },
  rail: {
    width: 76,
    backgroundColor: colors.white,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.paperDeep,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  railItem: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  railOn: {
    backgroundColor: colors.tealSoft,
  },
  railLabel: {
    ...type.micro,
    color: colors.inkSoft,
  },
  railLabelOn: {
    color: colors.tealDeep,
  },
});
