import type { PlaceValue } from "@/curriculum/types";

export type ForgeTile = {
  id: string;
  value: PlaceValue;
};

export type ForgeBoard = {
  tiles: ForgeTile[];
};

export function emptyBoard(): ForgeBoard {
  return { tiles: [] };
}

export function boardTotal(board: ForgeBoard): number {
  return board.tiles.reduce((sum, tile) => sum + tile.value, 0);
}

export function equationParts(board: ForgeBoard): number[] {
  return [...board.tiles]
    .sort((a, b) => b.value - a.value)
    .map((tile) => tile.value);
}

export function formatEquation(board: ForgeBoard): string {
  const parts = equationParts(board);
  if (parts.length === 0) return "0";
  return `${parts.join(" + ")} = ${boardTotal(board)}`;
}

export function addTile(board: ForgeBoard, value: PlaceValue, id: string): ForgeBoard {
  return { tiles: [...board.tiles, { id, value }] };
}

export function removeTile(board: ForgeBoard, id: string): ForgeBoard {
  return { tiles: board.tiles.filter((tile) => tile.id !== id) };
}

export function makeOneTen(board: ForgeBoard): { board: ForgeBoard; didMake: boolean } {
  const ones = board.tiles.filter((tile) => tile.value === 1);
  if (ones.length < 10) return { board, didMake: false };
  const rest = board.tiles.filter((tile) => tile.value !== 1);
  const leftoverOnes = ones.slice(10);
  return {
    board: {
      tiles: [
        ...rest,
        { id: `make-10-${ones[0]?.id ?? "x"}`, value: 10 },
        ...leftoverOnes,
      ],
    },
    didMake: true,
  };
}

export function regroupOnes(board: ForgeBoard): { board: ForgeBoard; didRegroup: boolean } {
  let next = board;
  let didRegroup = false;
  while (true) {
    const traded = makeOneTen(next);
    if (!traded.didMake) break;
    next = traded.board;
    didRegroup = true;
  }
  return { board: next, didRegroup };
}

export function breakTen(board: ForgeBoard): { board: ForgeBoard; didBreak: boolean } {
  const ten = board.tiles.find((tile) => tile.value === 10);
  if (!ten) return { board, didBreak: false };

  const ones: ForgeTile[] = Array.from({ length: 10 }, (_, index) => ({
    id: `break-${ten.id}-${index}`,
    value: 1,
  }));

  return {
    board: {
      tiles: [...board.tiles.filter((tile) => tile.id !== ten.id), ...ones],
    },
    didBreak: true,
  };
}

export function checkTarget(board: ForgeBoard, target: number): boolean {
  return boardTotal(board) === target;
}

export function seedBoardFromTotal(total: number, idPrefix: string): ForgeBoard {
  const hundreds = Math.floor(total / 100);
  const tens = Math.floor((total % 100) / 10);
  const ones = total % 10;
  const tiles: ForgeTile[] = [];
  for (let i = 0; i < hundreds; i += 1) {
    tiles.push({ id: `${idPrefix}-100-${i}`, value: 100 });
  }
  for (let i = 0; i < tens; i += 1) {
    tiles.push({ id: `${idPrefix}-10-${i}`, value: 10 });
  }
  for (let i = 0; i < ones; i += 1) {
    tiles.push({ id: `${idPrefix}-1-${i}`, value: 1 });
  }
  return { tiles };
}
