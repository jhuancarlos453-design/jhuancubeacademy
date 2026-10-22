import { describe, expect, it } from 'vitest';
import { parseTraining } from './training-data';
import { awardDailyChallenge, dailyChallenge, localDay, recordDailyQuizCorrect } from './daily-challenge';
const day = new Date(1970, 0, 1, 12);
const solves = (count: number, now = day) => Array.from({ length: count }, (_, i) => ({ id: `${i}`, ms: 10000, penalty: 'none', scramble: 'R U', date: now.getTime() }));
describe('Daily challenge rules', () => {
  it('selects the same predefined challenge throughout a local day and changes next day', () => {
    const data = parseTraining({});
    expect(localDay(new Date(1970, 0, 1, 23, 59))).toBe('1970-01-01');
    expect(dailyChallenge(data, day).title).toBe(dailyChallenge(data, new Date(1970, 0, 1, 23, 59)).title);
    expect(dailyChallenge(data, new Date(1970, 0, 2)).kind).toBe('quiz');
    expect(dailyChallenge(data, new Date(1970, 0, 3)).target).toBe(8);
  });
  it('requires five actual daily solves and awards exactly 50 XP', () => {
    expect(dailyChallenge(awardDailyChallenge(parseTraining({ solves: solves(4) }), day), day).xp).toBe(0);
    expect(dailyChallenge(awardDailyChallenge(parseTraining({ solves: solves(5) }), day), day).xp).toBe(50);
  });
  it('does not count old solves or duplicate solve IDs', () => {
    const data = parseTraining({ solves: [...solves(5, new Date(1969, 11, 31, 12)), ...Array(5).fill(solves(1)[0])] });
    expect(dailyChallenge(awardDailyChallenge(data, day), day).xp).toBe(0);
  });
  it('persists partial progress and never repeats a reward after reload or history deletion', () => {
    const partial = parseTraining(JSON.parse(JSON.stringify(parseTraining({ solves: solves(3) }))));
    expect(dailyChallenge(partial, day).progress).toBe(3);
    const awarded = awardDailyChallenge(parseTraining({ solves: solves(5) }), day);
    const reloaded = parseTraining(JSON.parse(JSON.stringify(awarded)));
    expect(awardDailyChallenge(reloaded, day)).toBe(reloaded);
    expect(dailyChallenge(awardDailyChallenge({ ...reloaded, solves: [] }, day), day).xp).toBe(50);
  });
  it('counts only real quiz correct events on the matching day', () => {
    const now = new Date(1970, 0, 2, 12);
    let data = parseTraining({ quizCorrect: 100 });
    expect(dailyChallenge(data, now).progress).toBe(0);
    for (let i = 0; i < 2; i++) data = recordDailyQuizCorrect(data, now);
    expect(dailyChallenge(awardDailyChallenge(data, now), now).xp).toBe(0);
    data = awardDailyChallenge(recordDailyQuizCorrect(data, now), now);
    expect(dailyChallenge(data, now).xp).toBe(50);
    expect(dailyChallenge(data, new Date(1970, 0, 5, 12)).progress).toBe(0);
  });
  it('starts a fresh next-day challenge while preserving XP and derives levels', () => {
    const data = awardDailyChallenge(parseTraining({ solves: solves(5) }), day);
    expect(dailyChallenge(data, new Date(1970, 0, 2, 12))).toMatchObject({ xp: 50, level: 1, progress: 0, rewarded: false });
    const records = Object.fromEntries([1,2,3,4].map(i => [`1970-01-0${i}`, { quizCorrect: 0, awardedAt: i }]));
    expect(dailyChallenge(parseTraining({ dailyChallenges: records }), day)).toMatchObject({ xp: 200, level: 2 });
  });
});