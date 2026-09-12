import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import type { GradeBand, LessonMode, SkillId, SkillStatus } from "@/curriculum/types";
import { localDateKeyFromIso } from "@/progress/dates";
import { nextSkillStatus } from "@/progress/mastery";

export type SkillRow = {
  skill_id: SkillId;
  status: SkillStatus;
  stars: number;
  accuracy: number;
  plays: number;
  updated_at: string;
};

export type SessionRow = {
  id: string;
  lesson_id: string;
  mode: LessonMode;
  stars: number;
  accuracy: number;
  duration_ms: number;
  created_at: string;
  synced: number;
};

type Memory = {
  settings: Map<string, string>;
  skills: Map<SkillId, SkillRow>;
  sessions: SessionRow[];
};

const memory: Memory = {
  settings: new Map(),
  skills: new Map(),
  sessions: [],
};

const nativeDb = Platform.OS === "web" ? null : SQLite.openDatabaseSync("number-forge.db");

export function initLocalDb(): void {
  nativeDb?.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS skill_mastery (
      skill_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      stars INTEGER NOT NULL DEFAULT 0,
      accuracy REAL NOT NULL DEFAULT 0,
      plays INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS play_sessions (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      stars INTEGER NOT NULL,
      accuracy REAL NOT NULL,
      duration_ms INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export function getSetting(key: string): string | null {
  if (!nativeDb) return memory.settings.get(key) ?? null;
  const row = nativeDb.getFirstSync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    [key],
  );
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  if (!nativeDb) {
    memory.settings.set(key, value);
    return;
  }
  nativeDb.runSync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}

export function recordSession(input: {
  id: string;
  lessonId: string;
  skillId: SkillId;
  mode: LessonMode;
  stars: number;
  accuracy: number;
  durationMs: number;
}): SkillRow {
  const createdAt = new Date().toISOString();
  const current = getSkill(input.skillId);
  const plays = (current?.plays ?? 0) + 1;
  const accuracy =
    current == null
      ? input.accuracy
      : (current.accuracy * current.plays + input.accuracy) / plays;
  const stars = Math.max(current?.stars ?? 0, input.stars);
  const status = nextSkillStatus({ plays, accuracy, bestStars: stars });
  const row: SkillRow = {
    skill_id: input.skillId,
    status,
    stars,
    accuracy,
    plays,
    updated_at: createdAt,
  };

  if (!nativeDb) {
    memory.sessions.push({
      id: input.id,
      lesson_id: input.lessonId,
      mode: input.mode,
      stars: input.stars,
      accuracy: input.accuracy,
      duration_ms: input.durationMs,
      created_at: createdAt,
      synced: 0,
    });
    memory.skills.set(input.skillId, row);
    return row;
  }

  nativeDb.runSync(
    `INSERT INTO play_sessions (id, lesson_id, mode, stars, accuracy, duration_ms, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [input.id, input.lessonId, input.mode, input.stars, input.accuracy, input.durationMs, createdAt],
  );
  nativeDb.runSync(
    `INSERT INTO skill_mastery (skill_id, status, stars, accuracy, plays, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(skill_id) DO UPDATE SET
       status = excluded.status,
       stars = excluded.stars,
       accuracy = excluded.accuracy,
       plays = excluded.plays,
       updated_at = excluded.updated_at`,
    [input.skillId, status, stars, accuracy, plays, createdAt],
  );
  return row;
}

export function listSkills(): SkillRow[] {
  if (!nativeDb) return [...memory.skills.values()];
  return nativeDb.getAllSync<SkillRow>(
    "SELECT skill_id, status, stars, accuracy, plays, updated_at FROM skill_mastery",
  );
}

export function unsyncedSessions(): SessionRow[] {
  if (!nativeDb) return memory.sessions.filter((session) => session.synced === 0);
  return nativeDb.getAllSync<SessionRow>(
    `SELECT id, lesson_id, mode, stars, accuracy, duration_ms, created_at, synced
     FROM play_sessions WHERE synced = 0`,
  );
}

export function markSessionsSynced(ids: string[]): void {
  if (ids.length === 0) return;
  if (!nativeDb) {
    for (const session of memory.sessions) {
      if (ids.includes(session.id)) session.synced = 1;
    }
    return;
  }
  const placeholders = ids.map(() => "?").join(",");
  nativeDb.runSync(`UPDATE play_sessions SET synced = 1 WHERE id IN (${placeholders})`, ids);
}

export function weekPlayDates(): string[] {
  const rows = nativeDb
    ? nativeDb.getAllSync<{ created_at: string }>(
        "SELECT created_at FROM play_sessions ORDER BY created_at DESC LIMIT 40",
      )
    : memory.sessions.map((session) => ({ created_at: session.created_at }));
  return rows.map((row) => localDateKeyFromIso(row.created_at));
}

export function playedLessonIds(): string[] {
  const rows = nativeDb
    ? nativeDb.getAllSync<{ lesson_id: string }>("SELECT DISTINCT lesson_id FROM play_sessions")
    : memory.sessions.map((session) => ({ lesson_id: session.lesson_id }));
  return rows.map((row) => row.lesson_id);
}

export function bestStarsByLesson(): Map<string, number> {
  const rows = nativeDb
    ? nativeDb.getAllSync<{ lesson_id: string; stars: number }>("SELECT lesson_id, stars FROM play_sessions")
    : memory.sessions.map((session) => ({ lesson_id: session.lesson_id, stars: session.stars }));
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.lesson_id, Math.max(map.get(row.lesson_id) ?? 0, row.stars));
  }
  return map;
}

export function masteredLessonIds(): string[] {
  return [...bestStarsByLesson().entries()]
    .filter(([, stars]) => stars >= 3)
    .map(([id]) => id);
}

export function repairCount(): number {
  return listSkills().filter((row) => row.status === "still_learning" || row.stars < 3).length;
}

export function isSmithTempered(): boolean {
  return getSetting("smith_tempered") === "1";
}

export function setSmithTempered(): void {
  setSetting("smith_tempered", "1");
}

export function savedGradeBand(): GradeBand | null {
  const value = getSetting("grade_band");
  if (value === "k1" || value === "g23" || value === "g45") return value;
  return null;
}

function getSkill(skillId: SkillId): SkillRow | undefined {
  if (!nativeDb) return memory.skills.get(skillId);
  return (
    nativeDb.getFirstSync<SkillRow>(
      "SELECT skill_id, status, stars, accuracy, plays, updated_at FROM skill_mastery WHERE skill_id = ?",
      [skillId],
    ) ?? undefined
  );
}
