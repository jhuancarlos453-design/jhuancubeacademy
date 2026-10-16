import { describe, expect, it } from "vitest";
import { averageOf, bestTime, generateScramble, type Solve } from "./cube";

const s = (ms: number, penalty: Solve["penalty"] = "none"): Solve => ({ id: String(ms), ms, penalty, scramble: "", date: 0 });

describe("cube stats", () => {
  it("Ao5 drops best and worst", () => {
    expect(averageOf([s(10000), s(12000), s(14000), s(16000), s(30000)], 5)).toBe(14000);
  });
  it("one DNF in Ao5 is dropped as worst", () => {
    expect(averageOf([s(10000), s(12000), s(14000), s(16000), s(1, "dnf")], 5)).toBe(14000);
  });
  it("two DNFs make Ao5 a DNF", () => {
    expect(averageOf([s(10000), s(12000), s(14000), s(1, "dnf"), s(1, "dnf")], 5)).toBe(Infinity);
  });
  it("+2 adds two seconds to PB", () => {
    expect(bestTime([s(10000, "+2"), s(13000)])).toBe(12000);
  });
  it("scramble has 20 moves", () => {
    expect(generateScramble().split(" ")).toHaveLength(20);
  });
});
