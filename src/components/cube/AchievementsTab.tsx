import { useState } from "react";
import { computeAchievements } from "@/lib/achievements";
import { QUIZ_CASES } from "@/lib/methods";
import type { App } from "@/lib/store";
import { FaceGrid } from "./CubeLogo";

function newQuestion() {
  const answer = QUIZ_CASES[Math.floor(Math.random() * QUIZ_CASES.length)]!;
  const others = QUIZ_CASES.filter((c) => c.id !== answer.id).sort(() => Math.random() - 0.5).slice(0, 3);
  const options: (typeof answer)[] = [answer, ...others].sort(() => Math.random() - 0.5);
  return { answer, options };
}

export function AchievementsTab({ app }: { app: App }) {
  const { data, update } = app;
  const list = computeAchievements(data);
  const unlocked = list.filter((a) => a.unlocked).length;
  const [qn, setQn] = useState<ReturnType<typeof newQuestion> | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState({ ok: 0, total: 0 });

  const choose = (id: string) => {
    if (!qn || picked) return;
    setPicked(id);
    const ok = id === qn.answer.id;
    const s = ok ? streak + 1 : 0;
    setStreak(s);
    setScore((x) => ({ ok: x.ok + (ok ? 1 : 0), total: x.total + 1 }));
    update((d) => ({ ...d, quizBestStreak: Math.max(d.quizBestStreak, s), quizCorrect: d.quizCorrect + (ok ? 1 : 0) }));
    setTimeout(() => { setPicked(null); setQn(newQuestion()); }, 1100);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-5">
      <div className="surface p-5">
        <div className="flex items-end justify-between mb-4">
          <h3 className="font-semibold text-lg">Conquistas</h3>
          <span className="font-mono text-sm text-success">{unlocked}/{list.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {list.map((a) => (
            <div key={a.id} className={`rounded-xl border p-4 text-center transition-all ${a.unlocked ? "border-success bg-success/10" : "border-border bg-background opacity-50 grayscale"}`}>
              <div className="text-3xl">{a.icon}</div>
              <div className="font-semibold text-sm mt-2">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface p-5 h-fit">
        <h3 className="font-semibold text-lg">Quiz OLL / PLL</h3>
        <p className="text-sm text-muted-foreground">Reconheça o caso pelo padrão e algoritmo.</p>
        <div className="grid grid-cols-3 gap-2 my-4 text-center">
          <div className="rounded-lg bg-background p-2"><div className="text-xs text-muted-foreground">Acertos</div><div className="font-mono font-bold">{score.ok}/{score.total}</div></div>
          <div className="rounded-lg bg-background p-2"><div className="text-xs text-muted-foreground">Sequência</div><div className="font-mono font-bold text-primary">{streak}🔥</div></div>
          <div className="rounded-lg bg-background p-2"><div className="text-xs text-muted-foreground">Recorde</div><div className="font-mono font-bold text-success">{data.quizBestStreak}</div></div>
        </div>
        {!qn ? (
          <button onClick={() => setQn(newQuestion())} className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 glow-primary">Começar quiz</button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-background p-4 flex flex-col items-center gap-3">
              {qn.answer.pattern ? <FaceGrid face={qn.answer.pattern} size={96} /> : <span className="text-xs uppercase tracking-widest text-muted-foreground">{qn.answer.group}</span>}
              <code className="font-mono text-primary text-center">{qn.answer.alg}</code>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {qn.options.map((o) => {
                const st = picked ? (o.id === qn.answer.id ? "bg-success text-success-foreground border-success" : o.id === picked ? "bg-destructive text-destructive-foreground border-destructive" : "border-input opacity-60") : "border-input hover:bg-accent";
                return <button key={o.id} onClick={() => choose(o.id)} className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${st}`}>{o.name.split(" · ").pop()}</button>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
