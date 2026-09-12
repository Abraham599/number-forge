export const WEAVE_SIZE = 4;

export type WeaveCell = {
  index: number;
  value: number;
};

export function cellAt(grid: number[], index: number): WeaveCell {
  const value = grid[index];
  if (value === undefined) {
    throw new Error(`Weave cell ${index} is missing`);
  }
  return { index, value };
}

export function neighbors(index: number): number[] {
  const row = Math.floor(index / WEAVE_SIZE);
  const col = index % WEAVE_SIZE;
  const next: number[] = [];
  if (row > 0) next.push(index - WEAVE_SIZE);
  if (row < WEAVE_SIZE - 1) next.push(index + WEAVE_SIZE);
  if (col > 0) next.push(index - 1);
  if (col < WEAVE_SIZE - 1) next.push(index + 1);
  return next;
}

export function isAdjacent(a: number, b: number): boolean {
  return neighbors(a).includes(b);
}

export function pathSum(grid: number[], path: number[]): number {
  return path.reduce((sum, index) => sum + cellAt(grid, index).value, 0);
}

export function formatPathEquation(grid: number[], path: number[]): string {
  if (path.length === 0) return "0";
  const parts = path.map((index) => String(cellAt(grid, index).value));
  return `${parts.join(" + ")} = ${pathSum(grid, path)}`;
}

export function canExtend(path: number[], next: number): boolean {
  if (path.includes(next)) return false;
  const last = path[path.length - 1];
  if (last === undefined) return true;
  return isAdjacent(last, next);
}

export function isWinningPath(grid: number[], path: number[], target: number): boolean {
  return path.length >= 2 && pathSum(grid, path) === target;
}

export function starsForPaths(completed: number): 1 | 2 | 3 {
  if (completed >= 1) return 3;
  return 1;
}
