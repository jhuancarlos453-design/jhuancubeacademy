import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Box, Download, LogOut, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { CubeLogo } from "@/components/cube/CubeLogo";
import { AuthScreen } from "@/components/cube/AuthScreen";
import { TimerTab } from "@/components/cube/TimerTab";
import { MethodsTab } from "@/components/cube/MethodsTab";
import { CollectionTab } from "@/components/cube/CollectionTab";
import { AchievementsTab } from "@/components/cube/AchievementsTab";
import { ExportTab } from "@/components/cube/ExportTab";
import { DailyChallenge } from '@/components/cube/DailyChallenge';
import { CubeMusic } from '@/components/cube/CubeMusic';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jhuan Carlos Cube Academy — Timer, Métodos e Treino de Cubo Mágico" },
      { name: "description", content: "Cronômetro com inspeção WCA, métodos Camadas e CFOP, coleção de cubos, conquistas e quiz OLL/PLL." },
      { property: "og:title", content: "Jhuan Carlos Cube Academy" },
      { property: "og:description", content: "Treine, aprenda e evolua no cubo mágico com timer, algoritmos e conquistas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "timer", label: "Timer", icon: Timer },
  { id: "methods", label: "Métodos", icon: BookOpen },
  { id: "collection", label: "Coleção", icon: Box },
  { id: "achievements", label: "Conquistas", icon: Trophy },
  { id: "export", label: "Exportar", icon: Download },
] as const;

function Index() {
  const app = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("timer");

  if (!app.ready) return <div className="min-h-screen flex items-center justify-center"><CubeLogo size={56} /></div>;
  if (!app.user) return <AuthScreen app={app} />;

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
          <CubeLogo size={34} />
          <div className="leading-tight min-w-0">
            <div className="font-display font-bold truncate">Jhuan Carlos <span className="text-primary">Cube Academy</span></div>
            <div className="text-xs text-muted-foreground truncate">Olá, {app.user.name.split(" ")[0]} 👋</div>
          </div>
          <nav className="hidden md:flex ml-auto gap-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                <t.icon className="size-4" /> {t.label}
              </button>
            ))}
          </nav>
          <button onClick={() => { void app.logout(); }} aria-label="Sair" className="ml-auto md:ml-2 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent flex items-center gap-2 text-sm">
            <LogOut className="size-4" /><span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-3">
        <p role="status" className="text-xs text-muted-foreground">{app.saveStatus === "saving" ? "Salvando…" : app.saveStatus === "saved" ? "Dados salvos na sua conta" : app.saveStatus === "loading" ? "Carregando dados…" : "Dados não salvos"}</p>
        {app.error && <p role="alert" className="text-sm text-destructive">{app.error}</p>}
        {app.legacyData && <div className="border border-border rounded-lg p-4 flex flex-wrap items-center gap-3">
          <p className="flex-1 min-w-48 text-sm">Encontramos dados antigos deste e-mail neste navegador. Importar preserva os registros já salvos.</p>
          <Button onClick={app.importLegacy} disabled={app.saveStatus !== "saved"}>Importar dados antigos</Button>
          <Button variant="ghost" onClick={app.dismissLegacy}>Agora não</Button>
        </div>}
        <DailyChallenge app={app} onTrain={setTab} />
      </div>
      <main className="max-w-7xl mx-auto px-4 py-6 animate-in fade-in" key={tab}>
        {tab === "timer" && <TimerTab app={app} />}
        {tab === "methods" && <MethodsTab app={app} />}
        {tab === "collection" && <CollectionTab app={app} />}
        {tab === "achievements" && <AchievementsTab app={app} />}
        {tab === "export" && <ExportTab app={app} />}
      </main>
      <CubeMusic app={app} />

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl grid grid-cols-5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`py-2.5 flex flex-col items-center gap-1 text-[11px] ${tab === t.id ? "text-primary" : "text-muted-foreground"}`}>
            <t.icon className="size-5" /> {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
