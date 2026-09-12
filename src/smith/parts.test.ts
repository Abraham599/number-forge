import assert from "node:assert/strict";
import { worldPath } from "@/curriculum/tens-town";
import { playIdForNode } from "@/progress/path-progress";
import { partForNode, unlockedPartIds, visibleSmithParts } from "@/smith/parts";

const nodes = worldPath("g23");
const first = nodes[0];
assert.equal(first && partForNode(first)?.id, "apron");

assert.deepEqual(unlockedPartIds(nodes, new Set()), []);

const after47 = new Set([playIdForNode(nodes[0]!)]);
assert.deepEqual(unlockedPartIds(nodes, after47), ["apron"]);

const apronAndArm = new Set(["forge-make-47", "forge-47-plus-8"]);
assert.deepEqual(unlockedPartIds(nodes, apronAndArm), ["apron", "armR"]);
assert.deepEqual(visibleSmithParts(["apron", "armR"]), ["apron", "armR"]);
assert.ok(!visibleSmithParts(["apron", "hammer"]).includes("hammer"));
assert.ok(!visibleSmithParts(["apron", "armR"]).includes("armL"));
assert.ok(!visibleSmithParts(["apron", "armR"]).includes("boots"));
assert.ok(!visibleSmithParts(["apron", "armR"]).includes("hat"));
assert.ok(!visibleSmithParts(["apron", "armR"]).includes("hammer"));

const withWeave = new Set(["forge-make-47", "forge-47-plus-8", "weave-12"]);
const afterHammer = unlockedPartIds(nodes, withWeave);
assert.ok(afterHammer.includes("hammer"));
assert.ok(afterHammer.includes("armR"));
assert.deepEqual(visibleSmithParts(afterHammer).includes("hammer"), true);

const work = nodes.filter((node) => node.kind !== "chest");
const allWork = new Set(work.map((node) => playIdForNode(node)));
const ids = unlockedPartIds(nodes, allWork);
assert.ok(ids.includes("cape"));
assert.ok(ids.includes("hammer"));
assert.ok(ids.includes("armR"));

console.log("smith parts ok");
