import { expect, it } from 'vitest';
import { spotifyTrackUrl, CUBE_PLAYLIST, SPOTIFY_SEARCH } from './music';
import { parseTraining } from './training-data';
it('uses the requested Spotify playlist and official search', () => {
  expect(CUBE_PLAYLIST).toBe('https://open.spotify.com/playlist/6VAlyWe8BYs1ZG15Abxqtk');
  expect(SPOTIFY_SEARCH).toBe('https://open.spotify.com/search');
});
it('accepts shared Spotify track URLs and rejects unsafe or non-track links', () => {
  expect(spotifyTrackUrl('https://open.spotify.com/track/1234567890123456789012?si=abc')).toBe('https://open.spotify.com/track/1234567890123456789012');
  for (const url of ['javascript:alert(1)', 'https://evil.example/track/1234567890123456789012', CUBE_PLAYLIST, 'https://open.spotify.com@evil.example/track/1234567890123456789012']) expect(spotifyTrackUrl(url)).toBeNull();
});
it('preserves personal favorites and training list through payload reload without changing history', () => {
  const data = parseTraining({ musicTracks: [{ id: 'track', title: 'Treino', url: 'https://open.spotify.com/track/1234567890123456789012', favorite: true, training: true }], quizCorrect: 12 });
  const loaded = parseTraining(JSON.parse(JSON.stringify(data)));
  expect(loaded.musicTracks[0]).toMatchObject({ favorite: true, training: true });
  expect(loaded.quizCorrect).toBe(12);
});