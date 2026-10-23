export const CUBE_PLAYLIST = 'https://open.spotify.com/playlist/6VAlyWe8BYs1ZG15Abxqtk';
export const SPOTIFY_SEARCH = 'https://open.spotify.com/search';
export const YOUTUBE_PLAYLIST_ID = 'PLt68EySXh-C4OfjMOKK0_U3Exsg5AbNi9';
export const YOUTUBE_PLAYLIST = `https://www.youtube.com/playlist?list=${YOUTUBE_PLAYLIST_ID}`;
export const YOUTUBE_EMBED = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=0&controls=1&playsinline=1`;
export function spotifyTrackUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com' || url.port || url.username || url.password || !/^\/track\/[A-Za-z0-9]{22}$/.test(url.pathname)) return null;
    return `https://open.spotify.com${url.pathname}`;
  } catch { return null; }
}