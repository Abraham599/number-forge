import assert from "node:assert/strict";
import {
  canExtend,
  isWinningPath,
  pathSum,
  starsForPaths,
} from "./engine.ts";

const grid = [3, 8, 1, 4, 5, 2, 7, 6, 4, 1, 9, 3, 2, 6, 5, 8];
const path = [0, 4, 5];
assert.equal(pathSum(grid, path), 10);
assert.equal(canExtend(path, 6), true);
assert.equal(canExtend(path, 0), false);
assert.equal(isWinningPath(grid, [1, 2, 3], 13), true);
assert.equal(starsForPaths(1), 3);
assert.equal(starsForPaths(2), 3);
assert.equal(starsForPaths(0), 1);

console.log("weave engine ok");
