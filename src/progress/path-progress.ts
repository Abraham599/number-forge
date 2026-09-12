import type { WorldNode } from "@/curriculum/types";

export function playIdForNode(node: WorldNode): string {
  switch (node.kind) {
    case "forge":
      return node.lessonId;
    case "weave":
      return node.puzzleId;
    case "chest":
      return node.id;
    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

export function currentNodeIndex(nodes: WorldNode[], played: ReadonlySet<string>): number {
  const next = nodes.findIndex((node) => {
    if (node.kind === "chest") return false;
    return !played.has(playIdForNode(node));
  });
  if (next >= 0) return next;
  const chest = nodes.findIndex((node) => node.kind === "chest");
  return chest >= 0 ? chest : Math.max(0, nodes.length - 1);
}

export function isNodeLocked(index: number, current: number): boolean {
  return index > current;
}
