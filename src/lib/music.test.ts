import { expect, it } from 'vitest';
import { spotifyTrackUrl } from './music';
import { parseTraining } from './training-data';
it('accepts shared Spotify track URLs and rejects unsafe or non-track links', () => {
  expect(spotifyTrackUrl('https://open.spotify.com/track/1234567890123456789012?si=abc')).toBe('https://open.spotify.com/track/1234567890123456789012');
  for (const url of ['javascript:alert(1)', 'https://evil.example/track/1234567890123456789012', 'https://open.spotify.com/playlist/6VAlyWe8BYs1ZG15Abxqtk', 'https://open.spotify.com@evil.example/track/1234567890123456789012']) expect(spotifyTrackUrl(url)).toBeNull();
});
it('preserves personal favorites and training list through payload reload without changing history', () => {
  const data = parseTraining({ musicTracks: [{ id: 'track', title: 'Treino', url: 'https://open.spotify.com/track/1234567890123456789012', favorite: true, training: true }], quizCorrect: 12 });
  const loaded = parseTraining(JSON.parse(JSON.stringify(data)));
  expect(loaded.musicTracks[0]).toMatchObject({ favorite: true, training: true });
  expect(loaded.quizCorrect).toBe(12);
});
