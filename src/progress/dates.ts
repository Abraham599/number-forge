const DAY_MS = 86_400_000;

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function localDateKeyFromIso(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return localDateKey(new Date(iso));
}

export function mondayOfWeek(today = new Date()): Date {
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  const weekday = today.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  monday.setDate(today.getDate() + diff);
  return monday;
}

export function currentWeekMarks(dateKeys: string[], today = new Date()): boolean[] {
  const played = new Set(dateKeys.map(localDateKeyFromIso));
  const monday = mondayOfWeek(today);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday.getTime() + index * DAY_MS);
    return played.has(localDateKey(day));
  });
}

export function streakCount(dateKeys: string[], today = new Date()): number {
  const played = new Set(dateKeys.map(localDateKeyFromIso));
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  if (!played.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (played.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
