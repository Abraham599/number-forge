# Number Forge

Dedicated K–5 math game: kids **build** quantities with place-value tiles (Number Forge), then prove fluency by weaving number paths (Number Weave). 3 stars forge a Smith part and open the next node.

This is the hackathon loop — Tens Town place value plus add/sub — not a flashcard app.

## Stack

- Expo 56 + Expo Router (iOS first)
- Local progress: `expo-sqlite`
- Sync: Cloudflare Worker (Hono) + D1 (`number-forge`, id `6e0459c4-b61b-4d27-babc-93e07de06883`)
- R2 is not enabled on this Cloudflare account yet; art is bundled

## Run the app

```bash
pnpm install
pnpm start
```

Then press `i` for the iOS Simulator.

## Run the Worker locally

```bash
pnpm --dir worker install
pnpm --dir worker dev
```

Point the app at it:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:8787 pnpm start
```

Remote D1 already has the schema. Local D1 needs:

```bash
cd worker && npx wrangler d1 execute number-forge --local --file=./migrations/0001_init.sql
```

Set `JWT_SECRET` with `wrangler secret put JWT_SECRET` before a production deploy.

## Judge path

Open → Play → pick 2–3 → Build a number → Check → Claim (3 stars forges the Apron) → Add → Weave → Garden shows stars and a Repair pile for misses.
