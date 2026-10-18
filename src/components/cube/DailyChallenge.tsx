import { useEffect, useState } from 'react';
import { CheckCircle2, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { App } from '@/lib/store';
import { awardDailyChallenge, dailyChallenge, DAILY_XP } from '@/lib/daily-challenge';

export function DailyChallenge({ app, onTrain }: { app: App; onTrain: (tab: 'timer' | 'achievements') => void }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const refresh = () => setNow(new Date());
    refresh();
    const timer = window.setInterval(refresh, 1000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('focus', refresh); };
  }, []);
  const state = now ? dailyChallenge(app.data, now) : null;
  useEffect(() => {
    if (state?.complete && !state.rewarded && app.saveStatus === 'saved') {
      app.update(d => awardDailyChallenge(d, new Date()));
    }
  }, [state?.day, state?.complete, state?.rewarded, app.saveStatus, app.update]);
  if (!state) return null;
  const saved = app.saveStatus === 'saved';
  return (
    <section aria-labelledby="daily-challenge-title" className="surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2"><Target className="size-5 text-primary" /><h2 id="daily-challenge-title" className="font-display font-semibold">Desafio do Dia</h2></div>
        <div className="flex items-center gap-3 text-sm font-mono"><span className="text-primary flex items-center gap-1"><Flame className="size-4" />{state.xp} XP</span><span className="text-muted-foreground">Nível {state.level}</span></div>
      </div>
      <h3 className="font-semibold mt-3">{state.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{state.description}</p>
      <div className="flex items-center justify-between gap-3 mt-4 text-sm">
        <span>{state.rewarded ? 'Concluído' : state.progress ? 'Em progresso' : 'Pendente'} · {state.progress}/{state.target}</span>
        <span className="font-mono text-primary">+{DAILY_XP} XP</span>
      </div>
      <progress aria-label="Progresso do desafio" value={state.progress} max={state.target} className="w-full h-2 mt-2 accent-primary" />
      <div className="mt-3" role="status" aria-live="polite">
        {state.rewarded ? <p className={`flex items-center gap-2 text-sm ${saved ? 'text-success' : 'text-muted-foreground'}`}><CheckCircle2 className="size-4 shrink-0" />{saved ? `Recompensa recebida! +${DAILY_XP} XP. Até amanhã!` : app.saveStatus === 'error' ? 'Conclusão ainda não salva. Confira o aviso da conta.' : 'Desafio concluído! Salvando recompensa…'}</p>
          : <Button variant="outline" size="sm" onClick={() => onTrain(state.kind === 'quiz' ? 'achievements' : 'timer')}><Target className="size-4" />{state.kind === 'quiz' ? 'Ir ao quiz' : 'Ir ao cronômetro'}</Button>}
      </div>
    </section>
  );
}