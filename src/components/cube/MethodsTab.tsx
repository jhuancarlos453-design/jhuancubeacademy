import { useState } from "react";
import { Search } from "lucide-react";
import { ALL_CASES, METHODS } from "@/lib/methods";
import type { App } from "@/lib/store";
import { FaceGrid } from "./CubeLogo";

export function MethodsTab({ app }: { app: App }) {
  const { data, update } = app;
  const [methodId, setMethodId] = useState<"layers" | "cfop">("layers");
  const [stepId, setStepId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const method = METHODS.find((m) => m.id === methodId)!;
  const allIds = method.steps.flatMap((s) => s.cases.map((c) => c.id));
  const pct = Math.round((allIds.filter((id) => data.progress[id] === "know").length / allIds.length) * 100);
  const step = method.steps.find((s) => s.id === stepId) ?? method.steps[0];

  const mark = (id: string, v: "know" | "learning") =>
    update((d) => { const p = { ...d.progress }; if (p[id] === v) delete p[id]; else p[id] = v; return { ...d, progress: p }; });

  const results = q.trim() ? ALL_CASES.filter((c) => (c.name + c.alg + c.desc).toLowerCase().includes(q.toLowerCase())) : [];

  const CaseRow = ({ c }: { c: (typeof ALL_CASES)[number] | (typeof step.cases)[number] }) => (
    <div className="rounded-xl bg-background border border-border p-4 flex gap-4 items-start">
      {c.pattern && <FaceGrid face={c.pattern} size={48} />}
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{c.name}</div>
        <p className="text-sm text-muted-foreground">{c.desc}</p>
        <code className="mt-2 inline-block font-mono text-sm sm:text-base bg-surface-2 text-primary rounded-md px-2.5 py-1 break-words">{c.alg}</code>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button onClick={() => mark(c.id, "know")} className={`text-xs px-2.5 py-1.5 rounded-md border ${data.progress[c.id] === "know" ? "bg-success text-success-foreground border-success" : "border-input hover:bg-accent"}`}>Já sei</button>
        <button onClick={() => mark(c.id, "learning")} className={`text-xs px-2.5 py-1.5 rounded-md border ${data.progress[c.id] === "learning" ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-accent"}`}>Aprendendo</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="inline-flex p-1 rounded-xl bg-card border border-border">
          {METHODS.map((m) => (
            <button key={m.id} onClick={() => { setMethodId(m.id); setStepId(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${methodId === m.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {m.name} <span className="opacity-70">({m.level})</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar algoritmo…" className="w-full rounded-lg bg-card border border-input pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      {q.trim() ? (
        <div className="surface p-4 space-y-3">
          <h3 className="font-semibold">{results.length} resultado(s)</h3>
          {results.map((c) => <CaseRow key={c.id} c={c} />)}
        </div>
      ) : (
        <>
          <div className="surface p-4">
            <div className="flex justify-between text-sm mb-2"><span>Progresso do {method.name}</span><span className="font-mono text-success font-semibold">{pct}%</span></div>
            <div className="h-2.5 rounded-full bg-background overflow-hidden"><div className="h-full bg-success transition-all duration-500" style={{ width: `${pct}%` }} /></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {method.steps.map((s, i) => {
              const done = s.cases.every((c) => data.progress[c.id] === "know");
              return (
                <button key={s.id} onClick={() => setStepId(s.id)} className={`surface p-3 text-left flex items-center gap-3 transition-all hover:-translate-y-0.5 ${step.id === s.id ? "!border-primary" : ""}`}>
                  <FaceGrid face={s.face} size={44} />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Etapa {i + 1} {done && <span className="text-success">✓</span>}</div>
                    <div className="font-semibold text-sm truncate">{s.title.replace(/^Passo \d · /, "")}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="surface p-4 sm:p-6 space-y-4">
            <div className="flex gap-4 items-center">
              <FaceGrid face={step.face} size={72} />
              <div>
                <h2 className="text-2xl font-bold">{step.title}</h2>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            </div>
            <div className="space-y-3">{step.cases.map((c) => <CaseRow key={c.id} c={c} />)}</div>
          </div>
        </>
      )}
    </div>
  );
}
