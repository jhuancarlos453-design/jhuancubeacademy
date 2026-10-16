import { useState } from "react";
import { CubeLogo } from "./CubeLogo";
import type { App } from "@/lib/store";

export function AuthScreen({ app }: { app: App }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Informe seu nome.");
        if (password.length < 6) throw new Error("A senha precisa ter ao menos 6 caracteres.");
        app.signup(name, email, password);
      } else app.login(email, password);
    } catch (err) { setError((err as Error).message); }
  };

  const input = "w-full rounded-lg bg-background border border-input px-4 py-3 text-sm outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <CubeLogo size={72} />
          <h1 className="mt-4 text-3xl font-bold">Jhuan Carlos <span className="text-primary">Cube Academy</span></h1>
          <p className="mt-2 text-muted-foreground">Treine, aprenda e evolua no cubo mágico.</p>
        </div>
        <div className="surface p-6">
          <form onSubmit={submit} className="space-y-3">
            <h2 className="text-lg font-semibold mb-2">Entrar na sua conta</h2>
            <input className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className={input} type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && mode === "login" && <p className="text-sm text-destructive">{error}</p>}
            <button className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 glow-primary">Entrar</button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
          <button onClick={app.loginGoogle} className="w-full rounded-lg border border-input py-3 font-medium hover:bg-accent flex items-center justify-center gap-2">
            <span className="font-bold text-primary">G</span> Continuar com Google
          </button>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Não tem conta? <button onClick={() => { setMode("signup"); setError(""); }} className="text-primary font-semibold hover:underline">Criar conta</button>
          </p>
        </div>
      </div>

      {mode === "signup" && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMode("login")}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="surface p-6 w-full max-w-md space-y-3 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-semibold">Criar conta</h2>
            <input className={input} placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className={input} type="password" placeholder="Senha (mín. 6)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setMode("login")} className="flex-1 rounded-lg border border-input py-3 hover:bg-accent">Cancelar</button>
              <button className="flex-1 rounded-lg bg-primary text-primary-foreground font-semibold py-3">Cadastrar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
