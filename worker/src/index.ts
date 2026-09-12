import { Hono } from "hono";
import { cors } from "hono/cors";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

type SkillPayload = {
  skillId: string;
  status: string;
  stars: number;
  accuracy: number;
  updatedAt: string;
};

type SessionPayload = {
  id: string;
  lesson_id: string;
  mode: string;
  stars: number;
  accuracy: number;
  duration_ms: number;
  created_at: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

app.get("/health", (c) => c.json({ ok: true, service: "number-forge" }));

app.post("/v1/bootstrap", async (c) => {
  const userId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await c.env.DB.prepare("INSERT INTO users (id, created_at) VALUES (?, ?)")
    .bind(userId, createdAt)
    .run();
  const token = await signJwt(c.env.JWT_SECRET, userId);
  return c.json({ token, userId });
});

app.post("/v1/progress/sync", async (c) => {
  const userId = await userFromRequest(c.req.raw, c.env.JWT_SECRET);
  if (!userId) return c.json({ error: "unauthorized" }, 401);

  const body = (await c.req.json()) as {
    sessions?: SessionPayload[];
    skills?: SkillPayload[];
  };

  for (const session of body.sessions ?? []) {
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO play_sessions
        (id, user_id, lesson_id, mode, stars, accuracy, duration_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        session.id,
        userId,
        session.lesson_id,
        session.mode,
        session.stars,
        session.accuracy,
        session.duration_ms,
        session.created_at,
      )
      .run();
  }

  for (const skill of body.skills ?? []) {
    const existing = await c.env.DB.prepare(
      "SELECT updated_at FROM skill_mastery WHERE user_id = ? AND skill_id = ?",
    )
      .bind(userId, skill.skillId)
      .first<{ updated_at: string }>();
    if (existing && existing.updated_at > skill.updatedAt) continue;
    await c.env.DB.prepare(
      `INSERT INTO skill_mastery (id, user_id, skill_id, status, stars, accuracy, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, skill_id) DO UPDATE SET
         status = excluded.status,
         stars = excluded.stars,
         accuracy = excluded.accuracy,
         updated_at = excluded.updated_at`,
    )
      .bind(
        `${userId}:${skill.skillId}`,
        userId,
        skill.skillId,
        skill.status,
        skill.stars,
        skill.accuracy,
        skill.updatedAt,
      )
      .run();
  }

  return c.json({ ok: true });
});

app.get("/v1/progress", async (c) => {
  const userId = await userFromRequest(c.req.raw, c.env.JWT_SECRET);
  if (!userId) return c.json({ error: "unauthorized" }, 401);

  const skills = await c.env.DB.prepare(
    "SELECT skill_id, status, stars, accuracy, updated_at FROM skill_mastery WHERE user_id = ?",
  )
    .bind(userId)
    .all();

  return c.json({ skills: skills.results });
});

export default app;

async function userFromRequest(request: Request, secret: string): Promise<string | null> {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return verifyJwt(secret, header.slice(7));
}

async function signJwt(secret: string, sub: string): Promise<string> {
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const payload = encodeJson({ sub, iat: now, exp: now + 60 * 60 * 24 * 180 });
  const data = `${header}.${payload}`;
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${encodeBytes(new Uint8Array(signature))}`;
}

async function verifyJwt(secret: string, token: string): Promise<string | null> {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const data = `${header}.${payload}`;
  const key = await hmacKey(secret);
  const expected = encodeBytes(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))),
  );
  if (!timingSafeEqual(expected, signature)) return null;
  const body = JSON.parse(decodeJson(payload)) as { sub?: string; exp?: number };
  if (!body.sub || (body.exp && body.exp < Math.floor(Date.now() / 1000))) return null;
  return body.sub;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function encodeJson(value: unknown): string {
  return encodeBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function encodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.byteLength !== right.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < left.byteLength; i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}
