import { useState } from "react";
import { Magnet, Plus, Star, Trash2 } from "lucide-react";
import { uid, type App } from "@/lib/store";

const CATS = ["2x2", "3x3", "4x4", "5x5", "Pyraminx", "Megaminx", "Skewb", "Square-1", "Clock", "Outro"];

export function CollectionTab({ app }: { app: App }) {
  const { data, update } = app;
  const [f, setF] = useState({ brand: "", model: "", category: "3x3", magnetic: true, notes: "" });
  const input = "w-full rounded-lg bg-background border border-input px-3 py-2.5 text-sm outline-none focus:border-primary";

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.brand.trim() || !f.model.trim()) return;
    const cube = { id: uid(), ...f };
    update((d) => ({ ...d, cubes: [...d.cubes, cube], activeCubeId: d.activeCubeId ?? cube.id }));
    setF({ brand: "", model: "", category: "3x3", magnetic: true, notes: "" });
  };

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-5">
      <form onSubmit={add} className="surface p-5 space-y-3 h-fit">
        <h3 className="font-semibold text-lg">Cadastrar cubo</h3>
        <input className={input} placeholder="Marca (ex: GAN, MoYu)" value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} required />
        <input className={input} placeholder="Modelo (ex: 12 M Pro)" value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} required />
        <select className={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary size-4" checked={f.magnetic} onChange={(e) => setF({ ...f, magnetic: e.target.checked })} /> Magnético</label>
        <textarea className={input} rows={3} placeholder="Lubrificante / manutenção" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <button className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 flex items-center justify-center gap-2"><Plus className="size-4" /> Adicionar</button>
      </form>

      <div>
        {data.cubes.length === 0 ? (
          <div className="surface p-10 text-center text-muted-foreground">Sua coleção está vazia. Cadastre seu primeiro cubo!</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {data.cubes.map((c) => {
              const active = c.id === data.activeCubeId;
              return (
                <div key={c.id} className={`surface p-5 space-y-3 ${active ? "!border-success glow-success" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2">{c.category}</span>
                      <h4 className="mt-2 font-bold text-lg">{c.brand} {c.model}</h4>
                      {c.magnetic && <span className="text-xs text-primary inline-flex items-center gap-1"><Magnet className="size-3" /> Magnético</span>}
                    </div>
                    <button aria-label="Remover" onClick={() => update((d) => ({ ...d, cubes: d.cubes.filter((x) => x.id !== c.id), activeCubeId: d.activeCubeId === c.id ? null : d.activeCubeId }))} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                  <textarea
                    className={input} rows={2} placeholder="Anotações de manutenção…" value={c.notes}
                    onChange={(e) => update((d) => ({ ...d, cubes: d.cubes.map((x) => (x.id === c.id ? { ...x, notes: e.target.value } : x)) }))}
                  />
                  <button onClick={() => update((d) => ({ ...d, activeCubeId: c.id }))} disabled={active} className={`w-full rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 ${active ? "bg-success text-success-foreground" : "border border-input hover:bg-accent"}`}>
                    <Star className="size-4" /> {active ? "Cubo ativo" : "Definir como ativo"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
