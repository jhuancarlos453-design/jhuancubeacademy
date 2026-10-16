export type Penalty = "none" | "+2" | "dnf";
export interface Solve { id: string; ms: number; penalty: Penalty; scramble: string; date: number; cube?: string | undefined }

const AXES = [["U", "D"], ["R", "L"], ["F", "B"]];
const SUFFIX = ["", "'", "2"];

export function generateScramble(length = 20, rand: () => number = Math.random): string {
  const moves: string[] = [];
  let lastAxis = -1;
  let lastFace = "";
  while (moves.length < length) {
    const axis = Math.floor(rand() * 3);
    const pair = AXES[axis]!;
    const face = pair[Math.floor(rand() * 2)]!;
    if (face === lastFace) continue;
    if (axis === lastAxis && moves.length > 1) {
      const prev2 = moves[moves.length - 2]![0]!;
      if (pair.includes(prev2)) continue;
    }
    moves.push(face + SUFFIX[Math.floor(rand() * 3)]!);
    lastAxis = axis;
    lastFace = face;
  }
  return moves.join(" ");
}

/** Effective time in ms; Infinity for DNF. */
export function effective(s: Solve): number {
  if (s.penalty === "dnf") return Infinity;
  return s.ms + (s.penalty === "+2" ? 2000 : 0);
}

/** WCA average of N over the most recent N solves: drop best and worst, mean of rest. 2+ DNFs = DNF. */
export function averageOf(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null;
  const times = solves.slice(-n).map(effective).sort((a, b) => a - b);
  const trimmed = times.slice(1, -1);
  if (trimmed.some((t) => t === Infinity)) return Infinity;
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

export function bestTime(solves: Solve[]): number | null {
  const valid = solves.map(effective).filter((t) => t !== Infinity);
  return valid.length ? Math.min(...valid) : null;
}

export function formatTime(ms: number | null): string {
  if (ms === null) return "—";
  if (ms === Infinity) return "DNF";
  const total = ms / 1000;
  const m = Math.floor(total / 60);
  const s = (total % 60).toFixed(2);
  return m > 0 ? `${m}:${s.padStart(5, "0")}` : s;
}

export function formatSolve(s: Solve): string {
  if (s.penalty === "dnf") return "DNF";
  return formatTime(effective(s)) + (s.penalty === "+2" ? "+" : "");
}
