import { averageOf, bestTime } from "./cube";
import { METHODS } from "./methods";
import type { UserData } from "./store";

export interface Achievement { id: string; title: string; desc: string; icon: string; unlocked: boolean }

const stepDone = (d: UserData, methodId: string) => {
  const m = METHODS.find((x) => x.id === methodId)!;
  const ids = m.steps.flatMap((s) => s.cases.map((c) => c.id));
  return ids.filter((id) => d.progress[id] === "know").length / ids.length;
};

export function computeAchievements(d: UserData): Achievement[] {
  const pb = bestTime(d.solves);
  const ao5 = averageOf(d.solves, 5);
  const known = Object.values(d.progress).filter((v) => v === "know").length;
  const a = (id: string, title: string, desc: string, icon: string, unlocked: boolean) => ({ id, title, desc, icon, unlocked });
  return [
    a("first", "Primeiro Giro", "Registre sua primeira resolução", "🎯", d.solves.length >= 1),
    a("ten", "Aquecendo", "Registre 10 resoluções", "🔥", d.solves.length >= 10),
    a("hundred", "Centurião", "Registre 100 resoluções", "💯", d.solves.length >= 100),
    a("sub60", "Sub-1 minuto", "Resolva em menos de 60s", "⏱️", pb !== null && pb < 60000),
    a("sub30", "Sub-30", "Resolva em menos de 30s", "⚡", pb !== null && pb < 30000),
    a("sub20", "Sub-20", "Resolva em menos de 20s", "🚀", pb !== null && pb < 20000),
    a("sub10", "Sub-10 Elite", "Resolva em menos de 10s", "👑", pb !== null && pb < 10000),
    a("ao5", "Consistente", "Ao5 abaixo de 40s", "📈", ao5 !== null && ao5 < 40000),
    a("learn1", "Estudante", "Marque 1 caso como 'Já sei'", "📘", known >= 1),
    a("layers", "Mestre das Camadas", "Conclua 100% do Método de Camadas", "🧱", stepDone(d, "layers") === 1),
    a("cfop", "CFOP Pro", "Conclua 100% do Método CFOP", "🏆", stepDone(d, "cfop") === 1),
    a("collector", "Colecionador", "Cadastre 3 cubos", "🧊", d.cubes.length >= 3),
    a("quiz5", "Olho Treinado", "Sequência de 5 acertos no quiz", "🧠", d.quizBestStreak >= 5),
    a("quiz15", "Reconhecimento Relâmpago", "Sequência de 15 acertos no quiz", "🌟", d.quizBestStreak >= 15),
  ];
}
