import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import type { SkillRow } from "@/progress/db";
import { listSkills, markSessionsSynced, unsyncedSessions } from "@/progress/db";

const TOKEN_KEY = "nf.device.jwt";

type BootstrapResponse = {
  token: string;
  userId: string;
};

function apiBase(): string | null {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  return process.env.EXPO_PUBLIC_API_URL ?? extra?.apiUrl ?? null;
}

async function readToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function writeToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // Web / missing native module — play still works offline.
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function bootstrapRemote(): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  try {
    const response = await fetch(`${base}/v1/bootstrap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return false;
    const body = (await response.json()) as BootstrapResponse;
    await writeToken(body.token);
    return true;
  } catch {
    return false;
  }
}

export async function syncProgress(): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  const sessions = unsyncedSessions();
  const skills = listSkills();
  try {
    const response = await fetch(`${base}/v1/progress/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({
        sessions,
        skills: skills.map((skill: SkillRow) => ({
          skillId: skill.skill_id,
          status: skill.status,
          stars: skill.stars,
          accuracy: skill.accuracy,
          updatedAt: skill.updated_at,
        })),
      }),
    });
    if (!response.ok) return false;
    markSessionsSynced(sessions.map((session) => session.id));
    return true;
  } catch {
    return false;
  }
}
