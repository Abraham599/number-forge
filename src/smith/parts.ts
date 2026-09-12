import { townLessonById, worldPath } from "@/curriculum/tens-town";
import type { GradeBand, SkillId, WorldNode } from "@/curriculum/types";
import { currentNodeIndex, playIdForNode } from "@/progress/path-progress";

export type SmithPartId = "apron" | "hammer" | "armR" | "boots" | "hat" | "armL" | "cape";

export type SmithPart = {
  id: SmithPartId;
  name: string;
  blurb: string;
};

const PARTS: Record<SmithPartId, SmithPart> = {
  apron: { id: "apron", name: "Apron", blurb: "Keeps sparks off Smith." },
  hammer: { id: "hammer", name: "Hammer", blurb: "For pounding tens into place." },
  armR: { id: "armR", name: "Strong arm", blurb: "Lifts the heavy tens." },
  boots: { id: "boots", name: "Boots", blurb: "Stomps ones into cubes." },
  hat: { id: "hat", name: "Forge hat", blurb: "A smith needs a hat." },
  armL: { id: "armL", name: "Other arm", blurb: "Holds the work still." },
  cape: { id: "cape", name: "Cape", blurb: "The town hero look." },
};

const PLAY_PART: Record<string, SmithPartId> = {
  "forge-make-47": "apron",
  "forge-47-plus-8": "armR",
  "weave-12": "hammer",
  "weave-15": "hammer",
  "forge-make-7": "boots",
  "forge-make-14": "hat",
  "forge-make-20": "hat",
  "forge-30-minus-6": "armL",
  "node-chest": "cape",
};

export function partById(id: SmithPartId): SmithPart {
  return PARTS[id];
}

export function partForPlayId(playId: string): SmithPart | undefined {
  const id = PLAY_PART[playId];
  return id ? PARTS[id] : undefined;
}

export function partForNode(node: WorldNode): SmithPart | undefined {
  return partForPlayId(playIdForNode(node));
}

export function partForSkill(skillId: SkillId): SmithPart | undefined {
  switch (skillId) {
    case "compose-to-100":
      return PARTS.apron;
    case "add-with-regroup":
      return PARTS.armR;
    case "weave-fluency":
      return PARTS.hammer;
    case "compose-ones":
      return PARTS.boots;
    case "compose-tens":
      return PARTS.hat;
    case "subtract-with-regroup":
      return PARTS.armL;
    case "make-ten":
    case "add-no-regroup":
    case "add-tens":
    case "compose-hundreds":
    case "compare-heaps":
    case "groups-of":
    case "share-out":
    case "unit-parts":
    case "subtract-no-regroup":
    case "rewind-mix":
    case "repair-mix":
    case "daily-mix":
      return undefined;
    default: {
      const _exhaustive: never = skillId;
      return _exhaustive;
    }
  }
}

export function allParts(): SmithPart[] {
  return [PARTS.apron, PARTS.armR, PARTS.hammer, PARTS.boots, PARTS.hat, PARTS.armL, PARTS.cape];
}

export function visibleSmithParts(unlocked: readonly SmithPartId[]): SmithPartId[] {
  const on = new Set(unlocked);
  const drawn: SmithPartId[] = [];
  if (on.has("apron")) drawn.push("apron");
  if (on.has("armR")) drawn.push("armR");
  if (on.has("armL")) drawn.push("armL");
  if (on.has("hammer") && on.has("armR")) drawn.push("hammer");
  if (on.has("boots")) drawn.push("boots");
  if (on.has("hat")) drawn.push("hat");
  if (on.has("cape")) drawn.push("cape");
  return drawn;
}

export function unlockedPartIds(nodes: WorldNode[], mastered: ReadonlySet<string>): SmithPartId[] {
  const unlocked = new Set<SmithPartId>();
  const work = nodes.filter((node) => node.kind !== "chest");
  const workDone = work.every((node) => mastered.has(playIdForNode(node)));
  for (const node of nodes) {
    if (node.kind === "chest") {
      if (workDone) unlocked.add("cape");
      continue;
    }
    if (!mastered.has(playIdForNode(node))) continue;
    const part = partForNode(node);
    if (!part) continue;
    if (part.id === "hammer" && !unlocked.has("armR")) continue;
    unlocked.add(part.id);
  }
  return allParts()
    .map((part) => part.id)
    .filter((id) => unlocked.has(id));
}

export function smithSnapshot(
  band: GradeBand,
  mastered: ReadonlySet<string>,
  extras?: { tempered?: boolean },
) {
  const nodes = worldPath(band);
  const current = nodes[currentNodeIndex(nodes, mastered)];
  const unlocked = unlockedPartIds(nodes, mastered);
  const nextPart = current ? partForNode(current) : undefined;
  return { nodes, current, unlocked, nextPart, tempered: extras?.tempered ?? false };
}

export function nodeForSkill(nodes: WorldNode[], skillId: SkillId): WorldNode | undefined {
  return nodes.find((node) => {
    if (node.kind === "forge") return townLessonById(node.lessonId)?.skillId === skillId;
    if (node.kind === "weave") return skillId === "weave-fluency";
    return false;
  });
}
