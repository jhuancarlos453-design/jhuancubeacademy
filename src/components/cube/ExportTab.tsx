import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { effective, formatSolve } from "@/lib/cube";
import type { App } from "@/lib/store";

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function ExportTab({ app }: { app: App }) {
  const { data, user } = app;
  const csv = () => {
    const rows = [["#", "Data", "Tempo (s)", "Penalidade", "Resultado", "Embaralhamento", "Cubo"]];
    data.solves.forEach((s, i) => {
      const t = effective(s);
      rows.push([String(i + 1), new Date(s.date).toISOString(), t === Infinity ? "" : (t / 1000).toFixed(2), s.penalty, formatSolve(s), s.scramble, s.cube ?? ""]);
    });
    download("tempos-cube-academy.csv", rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv");
  };
  const json = () => download("backup-cube-academy.json", JSON.stringify({ user: { name: user?.name, email: user?.email }, exportedAt: new Date().toISOString(), ...data }, null, 2), "application/json");

  const Card = ({ icon: Icon, title, desc, onClick }: { icon: typeof Download; title: string; desc: string; onClick: () => void }) => (
    <div className="surface p-6 flex flex-col">
      <Icon className="size-8 text-primary" />
      <h3 className="font-semibold text-lg mt-3">{title}</h3>
      <p className="text-sm text-muted-foreground flex-1 mt-1">{desc}</p>
      <button onClick={onClick} className="mt-5 rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 flex items-center justify-center gap-2"><Download className="size-4" /> Baixar</button>
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
      <Card icon={FileSpreadsheet} title="Histórico de tempos (CSV)" desc={`${data.solves.length} resoluções, prontas para abrir no Excel ou Google Planilhas.`} onClick={csv} />
      <Card icon={FileJson} title="Backup completo (JSON)" desc="Tempos, progresso nos métodos, coleção de cubos e recordes do quiz." onClick={json} />
    </div>
  );
}
