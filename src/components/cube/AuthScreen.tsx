import { useState } from "react";
import { Button } from "@/components/ui/button";
import "@lovable.dev/cloud-auth-js/styles.css";
import { CubeLogo } from "./CubeLogo";
import type { App } from "@/lib/store";

export function AuthScreen({ app }: { app: App }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Informe seu nome.");
        if (password.length < 6) throw new Error("A senha precisa ter ao menos 6 caracteres.");
        const signedIn = await app.signup(name, email, password);
        if (!signedIn) { setMode("login"); setNotice("Confira seu e-mail e confirme sua conta antes de entrar."); }
      } else await app.login(email, password);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
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
            <input aria-label="E-mail" autoComplete="email" className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input aria-label="Senha" autoComplete={mode === "signup" ? "new-password" : "current-password"} className={input} type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && mode === "login" && <p className="text-sm text-destructive">{error}</p>}
            <Button disabled={busy} className="h-auto w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 glow-primary">Entrar</Button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
          <Button disabled={busy} variant="outline" onClick={() => { setError(""); setBusy(true); void app.loginGoogle().catch(err => setError(err.message)).finally(() => setBusy(false)); }} className="h-auto w-full rounded-lg border border-input py-3 font-medium hover:bg-accent flex items-center justify-center gap-2">
            <span className="font-bold text-primary">G</span> Continuar com Google
          </Button>
          <Button variant="outline" disabled={busy} className="lovable-auth-button mt-3 w-full" onClick={() => { setBusy(true); void app.loginLovable().catch(err => setError(err.message)).finally(() => setBusy(false)); }}>Continuar com Lovable</Button>
          <Button variant="link" disabled={busy} className="mt-2 w-full" onClick={() => { if (!email.trim()) { setError("Informe seu e-mail para recuperar a senha."); return; } setBusy(true); void app.resetPassword(email).then(() => setNotice("Se houver uma conta com esse e-mail, você receberá um link para redefinir a senha.")).catch(err => setError(err.message)).finally(() => setBusy(false)); }}>Esqueci minha senha</Button>
          {notice && <p role="status" className="mt-3 text-sm text-success">{notice}</p>}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Não tem conta? <Button variant="link" className="text-primary font-semibold" onClick={() => { setMode("signup"); setError(""); }}>Criar conta</Button>
          </p>
        </div>
      </div>

      {mode === "signup" && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMode("login")}>
          <form role="dialog" aria-modal="true" aria-label="Criar conta" onClick={(e) => e.stopPropagation()} onSubmit={submit} className="surface p-6 w-full max-w-md space-y-3 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-semibold">Criar conta</h2>
            <input aria-label="Nome" autoComplete="name" maxLength={80} className={input} placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <input aria-label="E-mail" autoComplete="email" className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input aria-label="Senha" autoComplete={mode === "signup" ? "new-password" : "current-password"} className={input} type="password" placeholder="Senha (mín. 6)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="button" onClick={() => setMode("login")} className="flex-1 rounded-lg border border-input py-3 hover:bg-accent">Cancelar</Button>
              <Button disabled={busy} className="h-auto flex-1 rounded-lg bg-primary text-primary-foreground font-semibold py-3">Cadastrar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
