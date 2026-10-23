export function spotifyTrackUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com' || url.port || url.username || url.password || !/^\/track\/[A-Za-z0-9]{22}$/.test(url.pathname)) return null;
    return `https://open.spotify.com${url.pathname}`;
  } catch { return null; }
}
