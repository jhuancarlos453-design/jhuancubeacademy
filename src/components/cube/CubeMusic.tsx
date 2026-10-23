import { useState } from 'react';
import { ExternalLink, Music2, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type App } from '@/lib/store';
import { YOUTUBE_EMBED, YOUTUBE_PLAYLIST } from '@/lib/music';

export function CubeMusic({ app: _app }: { app: App }) {
  const [pinned, setPinned] = useState(false);

  return <section aria-labelledby="cube-music-title" onKeyDown={e => e.stopPropagation()} onKeyUp={e => e.stopPropagation()} className="max-w-7xl mx-auto px-4 py-6 border-t border-border scroll-mt-20">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <h2 id="cube-music-title" className="flex items-center gap-2 text-xl font-display font-semibold"><Music2 className="size-6 text-primary" />Cube Music 🎧</h2>
      <Button asChild variant="outline"><a href={YOUTUBE_PLAYLIST} target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir playlist no YouTube</a></Button>
    </div>
    <div className="max-w-3xl mx-auto aspect-video">
      <div className={pinned ? 'fixed bottom-20 md:bottom-4 right-4 z-30 w-[min(360px,calc(100vw-2rem))] bg-background border border-primary rounded-lg overflow-hidden' : 'w-full'}>
        <div className="flex justify-end bg-background pb-2">
          <Button size="sm" variant="ghost" aria-pressed={pinned} onClick={() => setPinned(value => !value)} title={pinned ? 'Voltar à seção musical' : 'Manter player à vista durante o treino'}>
            {pinned ? <PinOff /> : <Pin />}{pinned ? 'Desafixar player' : 'Fixar durante o treino'}
          </Button>
        </div>
        <iframe title="Cube Music — playlist YouTube" src={YOUTUBE_EMBED} className="block w-full aspect-video rounded-lg border-0" allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
    </div>
  </section>;
}