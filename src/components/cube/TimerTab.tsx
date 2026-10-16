import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { averageOf, bestTime, effective, formatSolve, formatTime, generateScramble, type Penalty } from "@/lib/cube";
import { uid, type App } from "@/lib/store";

type Phase = "idle" | "holding" | "ready" | "inspecting" | "running";

export function TimerTab({ app }: { app: App }) {
  const { data, update } = app;
  const [scramble, setScramble] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [inspectLeft, setInspectLeft] = useState(15);
  const startRef = useRef(0);
  const inspectStart = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>();
  const raf = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const wasInspecting = useRef(false);
  phaseRef.current = phase;

  useEffect(() => setScramble(generateScramble()), []);
  const activeCube = data.cubes.find((c) => c.id === data.activeCubeId);

  const tick = useCallback(() => {
    if (phaseRef.current === "running") setElapsed(performance.now() - startRef.current);
    if (phaseRef.current === "inspecting" || (wasInspecting.current && phaseRef.current !== "running")) {
      setInspectLeft(15 - (performance.now() - inspectStart.current) / 1000);
    }
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => { raf.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf.current); }, [tick]);

  const finish = useCallback(() => {
    const ms = performance.now() - startRef.current;
    setElapsed(ms);
    const used = wasInspecting.current ? (startRef.current - inspectStart.current) / 1000 : 0;
    const penalty: Penalty = used > 17 ? "dnf" : used > 15 ? "+2" : "none";
    wasInspecting.current = false;
    update((d) => ({ ...d, solves: [...d.solves, { id: uid(), ms: Math.round(ms), penalty, scramble, date: Date.now(), cube: activeCube ? `${activeCube.brand} ${activeCube.model}` : undefined }] }));
    setScramble(generateScramble());
    setPhase("idle");
  }, [scramble, update, activeCube]);

  const press = useCallback(() => {
    const p = phaseRef.current;
    if (p === "running") return finish();
    if (p === "idle" && data.inspection) {
      inspectStart.current = performance.now();
      wasInspecting.current = true;
      setInspectLeft(15);
      return setPhase("inspecting");
    }
    if (p === "idle" || p === "inspecting") {
      setPhase("holding");
      holdTimer.current = setTimeout(() => setPhase("ready"), 300);
    }
  }, [data.inspection, finish]);

  const release = useCallback(() => {
    clearTimeout(holdTimer.current);
    const p = phaseRef.current;
    if (p === "ready") { startRef.current = performance.now(); setElapsed(0); setPhase("running"); }
    else if (p === "holding") setPhase(wasInspecting.current ? "inspecting" : "idle");
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); if (!e.repeat) press(); }
      else if (phaseRef.current === "running") finish();
    };
    const up = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); release(); } };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [press, release, finish]);

  const solves = data.solves;
  const last = solves[solves.length - 1];
  const setPenalty = (id: string, penalty: Penalty) => update((d) => ({ ...d, solves: d.solves.map((s) => (s.id === id ? { ...s, penalty: s.penalty === penalty ? "none" : penalty } : s)) }));
  const remove = (id: string) => update((d) => ({ ...d, solves: d.solves.filter((s) => s.id !== id) }));

  const display =
    phase === "inspecting" || (wasInspecting.current && (phase === "holding" || phase === "ready"))
      ? inspectLeft > 0 ? Math.ceil(inspectLeft).toString() : inspectLeft > -2 ? "+2" : "DNF"
      : phase === "running" ? formatTime(elapsed)
      : phase === "idle" && last ? formatSolve(last) : formatTime(elapsed);
  const color = phase === "ready" ? "text-success" : phase === "holding" ? "text-destructive" : phase === "running" || phase === "inspecting" ? "text-primary" : "text-foreground";

  const chartData = solves.slice(-50).map((s, i, arr) => {
    const upto = solves.slice(0, solves.length - arr.length + i + 1);
    const t = effective(s);
    const a5 = averageOf(upto, 5);
    return { n: solves.length - arr.length + i + 1, tempo: t === Infinity ? null : +(t / 1000).toFixed(2), ao5: a5 && a5 !== Infinity ? +(a5 / 1000).toFixed(2) : null };
  });

  const stats = [
    { label: "PB", value: formatTime(bestTime(solves)), accent: true },
    { label: "Ao5", value: formatTime(averageOf(solves, 5)) },
    { label: "Ao12", value: formatTime(averageOf(solves, 12)) },
    { label: "Resoluções", value: String(solves.length) },
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-5">
      <div className="space-y-5">
        <div className="surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Embaralhamento</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" className="accent-primary size-4" checked={data.inspection} onChange={(e) => update((d) => ({ ...d, inspection: e.target.checked }))} />
                Inspeção WCA 15s
              </label>
              <button aria-label="Novo embaralhamento" onClick={() => setScramble(generateScramble())} className="p-2 rounded-lg hover:bg-accent"><RefreshCw className="size-4" /></button>
            </div>
          </div>
          <p className="font-mono text-lg sm:text-2xl leading-relaxed tracking-wide">{scramble}</p>
        </div>

        <div
          role="button"
          tabIndex={-1}
          onPointerDown={(e) => { e.preventDefault(); press(); }}
          onPointerUp={release}
          className={`surface select-none touch-none cursor-pointer flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px] transition-shadow ${phase === "running" ? "glow-primary" : phase === "ready" ? "glow-success" : ""}`}
        >
          <div className={`font-mono font-bold tabular-nums text-7xl sm:text-9xl transition-colors ${color}`}>{display}</div>
          <p className="mt-4 text-sm text-muted-foreground text-center px-4">
            {phase === "running" ? "Toque ou pressione qualquer tecla para parar"
              : phase === "inspecting" ? "Inspecionando… segure para preparar"
              : phase === "holding" ? "Segure…" : phase === "ready" ? "Solte para iniciar!"
              : "Segure ESPAÇO ou toque e segure para começar"}
          </p>
          {activeCube && <p className="mt-2 text-xs text-success">Cubo ativo: {activeCube.brand} {activeCube.model}</p>}
          {last && phase === "idle" && (
            <div className="mt-4 flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
              <button onClick={() => setPenalty(last.id, "+2")} className={`px-3 py-1.5 rounded-md text-sm border ${last.penalty === "+2" ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-accent"}`}>+2</button>
              <button onClick={() => setPenalty(last.id, "dnf")} className={`px-3 py-1.5 rounded-md text-sm border ${last.penalty === "dnf" ? "bg-destructive text-destructive-foreground border-destructive" : "border-input hover:bg-accent"}`}>DNF</button>
              <button onClick={() => remove(last.id)} className="px-3 py-1.5 rounded-md text-sm border border-input hover:bg-accent"><Trash2 className="size-4" /></button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="surface p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className={`font-mono text-2xl font-bold mt-1 ${s.accent ? "text-primary" : ""}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="surface p-4 sm:p-5">
          <h3 className="font-semibold mb-3">Evolução dos tempos</h3>
          {chartData.length < 2 ? <p className="text-sm text-muted-foreground py-10 text-center">Faça ao menos 2 resoluções para ver o gráfico.</p> : (
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="n" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} width={36} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="tempo" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  <Line type="monotone" dataKey="ao5" stroke="var(--success)" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="surface p-4 h-fit lg:sticky lg:top-24">
        <h3 className="font-semibold mb-3">Histórico</h3>
        {solves.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma resolução ainda.</p> : (
          <ul className="space-y-1 max-h-[560px] overflow-y-auto pr-1">
            {[...solves].reverse().map((s, i) => (
              <li key={s.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent" title={s.scramble}>
                <span className="text-xs text-muted-foreground w-8">{solves.length - i}</span>
                <span className={`font-mono flex-1 ${s.penalty === "dnf" ? "text-destructive" : ""}`}>{formatSolve(s)}</span>
                <button onClick={() => setPenalty(s.id, "+2")} className={`text-xs px-1.5 rounded ${s.penalty === "+2" ? "text-primary" : "text-muted-foreground"}`}>+2</button>
                <button onClick={() => setPenalty(s.id, "dnf")} className={`text-xs px-1.5 rounded ${s.penalty === "dnf" ? "text-destructive" : "text-muted-foreground"}`}>DNF</button>
                <button aria-label="Excluir" onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
