import type { parseTraining } from './training-data';

type Training = ReturnType<typeof parseTraining>;
export const DAILY_XP = 50;
const challenges = [
  { title: 'Cinco resoluções, um passo à frente', description: 'Registre 5 resoluções no cronômetro hoje.', target: 5, kind: 'solves' },
  { title: 'Reconhecimento em dia', description: 'Acerte 3 questões no quiz OLL / PLL hoje.', target: 3, kind: 'quiz' },
  { title: 'Constância que transforma', description: 'Registre 8 resoluções no cronômetro hoje.', target: 8, kind: 'solves' },
] as const;

export function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function dailyChallenge(data: Training, now: Date) {
  const day = localDay(now);
  const ordinal = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const challenge = challenges[((ordinal % challenges.length) + challenges.length) % challenges.length] ?? challenges[0];
  const record = data.dailyChallenges[day];
  const rewarded = record?.awardedAt != null;
  const actual = challenge.kind === 'quiz' ? record?.quizCorrect ?? 0
    : new Set(data.solves.filter(s => localDay(new Date(s.date)) === day).map(s => s.id)).size;
  const progress = rewarded ? challenge.target : Math.min(actual, challenge.target);
  const xp = Object.values(data.dailyChallenges).filter(r => r.awardedAt !== null).length * DAILY_XP;
  return { ...challenge, day, progress, complete: progress >= challenge.target, rewarded, xp, level: Math.floor(xp / 200) + 1 };
}

/** Saved with the same revision-checked payload as training, never a separate claim. */
export function awardDailyChallenge(data: Training, now: Date): Training {
  const state = dailyChallenge(data, now);
  if (!state.complete || state.rewarded) return data;
  return { ...data, dailyChallenges: { ...data.dailyChallenges, [state.day]: { quizCorrect: data.dailyChallenges[state.day]?.quizCorrect ?? 0, awardedAt: now.getTime() } } };
}

export function recordDailyQuizCorrect(data: Training, now: Date): Training {
  const day = localDay(now);
  const record = data.dailyChallenges[day];
  return { ...data, dailyChallenges: { ...data.dailyChallenges, [day]: { quizCorrect: (record?.quizCorrect ?? 0) + 1, awardedAt: record?.awardedAt ?? null } } };
}