import assert from "node:assert/strict";
import { worldPath } from "../curriculum/tens-town.ts";
import { currentNodeIndex, isNodeLocked, playIdForNode } from "./path-progress.ts";

const nodes = worldPath("g23");
assert.equal(playIdForNode(nodes[0]!), "forge-make-47");
assert.equal(playIdForNode(nodes[1]!), "forge-add-no-regroup");
assert.equal(currentNodeIndex(nodes, new Set()), 0);
assert.equal(currentNodeIndex(nodes, new Set(["forge-make-47"])), 1);
assert.equal(isNodeLocked(0, 0), false);
assert.equal(isNodeLocked(2, 0), true);

console.log("path progress ok");
