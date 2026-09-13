## Learned User Preferences

- Use the Mobbin MCP for every screen’s UI/UX and for mechanic inspiration; do not invent kids-app layouts from scratch.
- Kid-facing copy must stay non-technical: no Cloudflare, Workers, or tech-stack mentions.
- The app is kids-only K–5; adults/parent mode is gone.
- Verify playable flows in the iPhone Simulator (portrait and landscape), or the Safari web build when Expo Go’s SDK does not match the project; do not verify only by reading code.
- iOS visual bar: SF Pro Rounded, consistent spacing, layered shadows, and simplify everything. Follow Apple’s Designing for iPhone Duo so screens fill every pose from size and safe area—not a locked 430×932 canvas; compact stacks, wide/landscape splits with a fold gutter.
- Lesson numbers must be generated, not hardcoded static targets, so play stays challenging.
- The smith should look real and animated (not a stickman), fit the screen without scrolling, and unlocks should feel connective across Path, Garden, and play.
- Design for short attention spans with innovative progression and mastery rewards, not a thin or half-built loop.
- Cover a broader range of K–5 foundational arithmetic than a small compose/add slice; use distinct mechanics per concept family and reuse similar mechanics for similar concepts.
- Use Emil Kowalski animation and UI skills when polishing motion and interfaces.
- Follow the ShePoses Expo/React Native client patterns; backend is Cloudflare D1 + Workers + R2, production-grade even for a hackathon.
- Kid coaching is just-in-time, not always-on: name the move once, then hide; bring it back on miss, idle, or Hint. On compose, show a pile of placed ones—not empty 10-frame slots or remaining tap counts—unless making a ten / regroup is the actual move.

## Learned Workspace Facts

- Product is Number Forge: Tens Town path with Forge (place-value, including hundreds and add/take tens), Weave, Heap (compare piles), Bunch (groups), Share (even bowls), and Slice (color parts).
- Client is Expo 56 + Expo Router, iOS-first; local progress is `expo-sqlite`; sync is a Hono Cloudflare Worker plus D1 `number-forge`.
- Expo Go on the iPhone 17 simulator is SDK 57 vs this project’s Expo 56, so playtest often uses the web build in Safari rather than native Expo Go.
- R2 is not enabled on this Cloudflare account yet; art is bundled.
- Typography is SF Pro Rounded via `ui-rounded`; do not embed SF font files.
- Adults/parent surfaces were removed; remaining copy should read as kid-only.
- Curriculum should generate problems rather than hardcode demo targets such as 47.
- New town verbs keep Path `kind: "forge"` nodes and route via `playForSkill` to `/play/heap`, `/play/bunch`, `/play/share`, `/play/slice`. g23 still starts `forge-make-47`; new lessons append before Rewind. MIX_POOL stays Forge-only (now includes hundreds and add-tens).
- ShePoses at `/Users/richard/dev/ShePoses` is the client stack reference.
- Screens use `useAppLayout` / DuoPane / PlayStage: compact is one column; regular width splits; landscape puts Path / Garden / Smith on a leading side rail; primary buttons stay inset.
