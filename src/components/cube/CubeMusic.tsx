import { useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Heart, Music2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type App, uid } from '@/lib/store';
import { CUBE_PLAYLIST, SPOTIFY_SEARCH, spotifyTrackUrl } from '@/lib/music';

export function CubeMusic({ app }: { app: App }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'all' | 'favorites' | 'training'>('all');
  const locked = app.saveStatus === 'error' || app.saveStatus === 'loading';
  const tracks = app.data.musicTracks.filter(t => view === 'all' || (view === 'favorites' ? t.favorite : t.training));
  const move = (id: string, offset: number) => app.update(d => {
    const list = [...d.musicTracks];
    const index = list.findIndex(t => t.id === id);
    const track = list[index];
    if (!track || index + offset < 0 || index + offset >= list.length) return d;
    list.splice(index, 1); list.splice(index + offset, 0, track);
    return { ...d, musicTracks: list };
  });
  return <section aria-labelledby="cube-music-title" onKeyDown={e => e.stopPropagation()} onKeyUp={e => e.stopPropagation()} className="max-w-7xl mx-auto px-4 py-6 border-t border-border scroll-mt-20">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <h2 id="cube-music-title" className="flex items-center gap-2 text-xl font-display font-semibold"><Music2 className="size-6 text-primary" />Cube Music</h2>
      <div className="flex flex-wrap gap-2">
        <Button asChild><a href={SPOTIFY_SEARCH} target="_blank" rel="noopener noreferrer"><Plus />Encontrar músicas</a></Button>
        <Button asChild variant="outline"><a href={CUBE_PLAYLIST} target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir playlist no Spotify</a></Button>
      </div>
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="min-w-0">
        <iframe title="Cube Music — playlist Spotify" src="https://open.spotify.com/embed/playlist/6VAlyWe8BYs1ZG15Abxqtk?utm_source=generator&theme=0" width="100%" height="352" className="block rounded-lg border-0" allow="encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
        <p className="text-xs text-muted-foreground mt-3">Para adicionar faixas à playlist original, abra o Spotify. A edição depende das suas permissões por lá.</p>
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold mb-3">Minhas músicas</h3>
        <form className="space-y-3" onSubmit={e => {
          e.preventDefault(); setError('');
          const normalized = spotifyTrackUrl(url);
          if (!normalized || !title.trim()) { setError('Informe o nome e um link de música do Spotify (open.spotify.com/track/…).'); return; }
          if (app.data.musicTracks.some(t => spotifyTrackUrl(t.url) === normalized)) { setError('Essa música já está na sua lista.'); return; }
          app.update(d => ({ ...d, musicTracks: [...d.musicTracks, { id: uid(), title: title.trim(), url: normalized, favorite: true, training: true }] }));
          setTitle(''); setUrl('');
        }}>
          <label className="block text-sm">Nome da música<input aria-label="Nome da música" required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
          <label className="block text-sm">Link da música no Spotify<input aria-label="Link da música no Spotify" type="url" required value={url} onChange={e => setUrl(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
          <Button type="submit" disabled={locked}><Plus />Salvar na minha lista</Button>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </form>
        <div className="flex flex-wrap gap-1 my-4" aria-label="Filtrar músicas">
          {(['all', 'favorites', 'training'] as const).map((v, i) => <Button key={v} size="sm" variant={view === v ? 'secondary' : 'ghost'} aria-pressed={view === v} onClick={() => setView(v)}>{['Todas', 'Favoritas', 'Para treinar'][i]}</Button>)}
        </div>
        {tracks.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma música nesta lista.</p> : <ul className="space-y-3">
          {tracks.map(t => <li key={t.id} className="border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <a className="min-w-0 flex-1 text-sm font-medium break-words text-primary" href={t.url} target="_blank" rel="noopener noreferrer">{t.title}<ExternalLink className="inline size-3 ml-1" /></a>
              <Button size="icon" variant="ghost" title="Favorita" aria-label={`Favoritar ${t.title}`} aria-pressed={t.favorite} disabled={locked} onClick={() => app.update(d => ({ ...d, musicTracks: d.musicTracks.map(x => x.id === t.id ? { ...x, favorite: !x.favorite } : x) }))}><Heart className={t.favorite ? 'fill-primary text-primary' : 'text-muted-foreground'} /></Button>
              <Button size="icon" variant="ghost" title="Remover música" aria-label={`Remover ${t.title}`} disabled={locked} onClick={() => { if (window.confirm(`Remover “${t.title}” da sua lista?`)) app.update(d => ({ ...d, musicTracks: d.musicTracks.filter(x => x.id !== t.id) })); }}><Trash2 /></Button>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={t.training} disabled={locked} className="accent-primary" onChange={() => app.update(d => ({ ...d, musicTracks: d.musicTracks.map(x => x.id === t.id ? { ...x, training: !x.training } : x) }))} />Na lista de treino</label>
              <div className="flex gap-1"><Button size="icon" variant="ghost" title="Mover para cima" aria-label={`Mover ${t.title} para cima`} disabled={locked || app.data.musicTracks[0]?.id === t.id} onClick={() => move(t.id, -1)}><ArrowUp /></Button><Button size="icon" variant="ghost" title="Mover para baixo" aria-label={`Mover ${t.title} para baixo`} disabled={locked || app.data.musicTracks.at(-1)?.id === t.id} onClick={() => move(t.id, 1)}><ArrowDown /></Button></div>
            </div>
          </li>)}
        </ul>}
      </div>
    </div>
  </section>;
}