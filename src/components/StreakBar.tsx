import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Surface } from "@/components/Surface";
import { currentWeekMarks, localDateKey, mondayOfWeek, streakCount } from "@/progress/dates";
import { colors, spacing, type } from "@/theme/tokens";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

type Props = {
  dateKeys: string[];
};

export function StreakBar({ dateKeys }: Props) {
  const today = new Date();
  const marks = currentWeekMarks(dateKeys, today);
  const streak = streakCount(dateKeys, today);
  const todayKey = localDateKey(today);
  const monday = mondayOfWeek(today);

  return (
    <Surface level="tile" contentStyle={styles.inner}>
      <View style={styles.flame}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={styles.count}>{streak}</Text>
      </View>
      <View style={styles.week}>
        {DAYS.map((label, index) => {
          const day = new Date(monday);
          day.setDate(monday.getDate() + index);
          const isToday = localDateKey(day) === todayKey;
          return (
            <View key={`${label}-${index}`} style={styles.day}>
              <View
                style={[
                  styles.dot,
                  marks[index] ? styles.dotOn : null,
                  isToday ? styles.dotToday : null,
                ]}
              />
              <Text style={[styles.dayLabel, isToday ? styles.dayToday : null]}>{label}</Text>
            </View>
          );
        })}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  flame: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 52,
  },
  emoji: {
    fontSize: 22,
  },
  count: {
    ...type.subtitle,
    color: colors.amber,
  },
  week: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  day: {
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.paperDeep,
  },
  dotOn: {
    backgroundColor: colors.teal,
  },
  dotToday: {
    borderWidth: 2,
    borderColor: colors.amber,
  },
  dayLabel: {
    ...type.micro,
    color: colors.inkSoft,
  },
  dayToday: {
    color: colors.amber,
  },
});
