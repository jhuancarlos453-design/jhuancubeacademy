import { z } from 'zod';

const solve = z.object({ id: z.string().min(1), ms: z.number().finite().nonnegative(), penalty: z.enum(['none', '+2', 'dnf']), scramble: z.string(), date: z.number().finite().nonnegative(), cube: z.string().optional() }).passthrough();
const cube = z.object({ id: z.string().min(1), brand: z.string(), model: z.string(), category: z.string(), magnetic: z.boolean(), notes: z.string() }).passthrough();
export const trainingSchema = z.object({
  solves: z.array(solve).default([]), progress: z.record(z.enum(['know', 'learning'])).default({}),
  cubes: z.array(cube).default([]), activeCubeId: z.string().nullable().default(null),
  inspection: z.boolean().default(false), quizBestStreak: z.number().int().nonnegative().default(0), quizCorrect: z.number().int().nonnegative().default(0),
}).passthrough();

export function parseTraining(value: unknown) { return trainingSchema.parse(value); }
export function mergeTraining(current: ReturnType<typeof parseTraining>, incoming: ReturnType<typeof parseTraining>) {
  const merge = <T extends { id: string }>(a: T[], b: T[]) => [...a, ...b.filter(x => !a.some(y => y.id === x.id))];
  return parseTraining({ ...incoming, ...current, solves: merge(current.solves, incoming.solves).sort((a,b) => a.date-b.date), cubes: merge(current.cubes, incoming.cubes), progress: { ...incoming.progress, ...current.progress }, quizBestStreak: Math.max(current.quizBestStreak, incoming.quizBestStreak), quizCorrect: Math.max(current.quizCorrect, incoming.quizCorrect) });
}