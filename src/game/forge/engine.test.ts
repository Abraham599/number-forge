import assert from "node:assert/strict";
import {
  addTile,
  boardTotal,
  checkTarget,
  emptyBoard,
  formatEquation,
  makeOneTen,
  regroupOnes,
  seedBoardFromTotal,
} from "./engine.ts";

let board = emptyBoard();
for (let i = 0; i < 7; i += 1) {
  board = addTile(board, 1, `one-${i}`);
}
assert.equal(boardTotal(board), 7);
assert.equal(checkTarget(board, 7), true);
assert.equal(formatEquation(board), "1 + 1 + 1 + 1 + 1 + 1 + 1 = 7");

for (let i = 7; i < 10; i += 1) {
  board = addTile(board, 1, `one-${i}`);
}
const made = makeOneTen(board);
assert.equal(made.didMake, true);
assert.equal(boardTotal(made.board), 10);
assert.equal(made.board.tiles.filter((tile) => tile.value === 10).length, 1);
assert.equal(made.board.tiles.filter((tile) => tile.value === 1).length, 0);

const regrouped = regroupOnes(board);
assert.equal(regrouped.didRegroup, true);
assert.equal(boardTotal(regrouped.board), 10);
assert.equal(regrouped.board.tiles.some((tile) => tile.value === 10), true);

const fortySeven = seedBoardFromTotal(47, "seed");
assert.equal(boardTotal(fortySeven), 47);
assert.equal(checkTarget(fortySeven, 47), true);
assert.equal(fortySeven.tiles.filter((tile) => tile.value === 10).length, 4);

const twoFortySeven = seedBoardFromTotal(247, "seed");
assert.equal(boardTotal(twoFortySeven), 247);
assert.equal(twoFortySeven.tiles.filter((tile) => tile.value === 100).length, 2);
assert.equal(twoFortySeven.tiles.filter((tile) => tile.value === 10).length, 4);
assert.equal(twoFortySeven.tiles.filter((tile) => tile.value === 1).length, 7);

console.log("forge engine ok");
