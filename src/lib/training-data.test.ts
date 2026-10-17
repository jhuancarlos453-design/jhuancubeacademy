import { describe, expect, it } from 'vitest';
import { mergeTraining, parseTraining } from './training-data';
describe('Training integrity', () => {
  const result = { id: 'old', ms: 10000, penalty: 'none', scramble: 'R U', date: 1 };
  it('rejects malformed histories without silently overwriting them', () => {
    expect(() => parseTraining({ solves: null })).toThrow();
  });
  it('rejects negative solve durations', () => {
    expect(() => parseTraining({ solves: [{ ...result, ms: -1 }] })).toThrow();
  });
  it('preserves existing results when importing a conflicting ID', () => {
    const current = parseTraining({ solves: [result] });
    const imported = parseTraining({ solves: [{ ...result, ms: 5000 }, { ...result, id: 'new' }] });
    expect(mergeTraining(current, imported).solves.map(s => [s.id, s.ms])).toEqual([['old', 10000], ['new', 10000]]);
  });
  it('never lowers learning and quiz records when importing old data', () => {
    const merged = mergeTraining(parseTraining({ progress: { sune: 'know' }, quizBestStreak: 8, quizCorrect: 12 }), parseTraining({ progress: { sune: 'learning' }, quizBestStreak: 3, quizCorrect: 2 }));
    expect([merged.progress['sune'], merged.quizBestStreak, merged.quizCorrect]).toEqual(['know', 8, 12]);
  });
});