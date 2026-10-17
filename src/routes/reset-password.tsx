import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [
    { title: 'Redefinir senha — Jhuan Carlos Cube Academy' },
    { name: 'description', content: 'Defina uma nova senha para sua conta na Cube Academy.' },
    { property: 'og:title', content: 'Redefinir senha — Cube Academy' },
    { property: 'og:description', content: 'Recupere o acesso à sua conta com segurança.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: ResetPassword,
});
function ResetPassword() {
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const valid = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
    if (valid) void supabase.auth.getUser().then(({ data }) => setRecovery(Boolean(data.user)));
  }, []);
  return <main className="min-h-screen flex items-center justify-center p-4">
    <form className="surface p-6 w-full max-w-md space-y-4" onSubmit={async e => {
      e.preventDefault(); setMessage('');
      if (!recovery || password.length < 6 || password !== confirm) { setMessage('Use ao menos 6 caracteres e confirme a mesma senha.'); return; }
      setBusy(true);
      const result = await supabase.auth.updateUser({ password });
      setBusy(false);
      if (result.error) setMessage('Não foi possível alterar a senha. Solicite um novo link ou confira os requisitos da senha.');
      else { setDone(true); setMessage('Senha alterada com sucesso.'); }
    }}>
      <h1 className="text-xl font-semibold">Redefinir senha</h1>
      {done ? <Button asChild className="w-full"><Link to="/">Continuar</Link></Button> : recovery ? <>
        <label className="block text-sm">Nova senha<input aria-label="Nova senha" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-md bg-background border border-input px-3 py-3" /></label>
        <label className="block text-sm">Confirmar senha<input aria-label="Confirmar senha" type="password" autoComplete="new-password" minLength={6} required value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-2 w-full rounded-md bg-background border border-input px-3 py-3" /></label>
        <Button disabled={busy} className="w-full">{busy ? 'Salvando…' : 'Salvar nova senha'}</Button>
      </> : <p className="text-sm text-muted-foreground">Abra o link enviado por e-mail para redefinir sua senha. Se ele expirou, solicite outro em “Esqueci minha senha”.</p>}
      {message && <p role="status" className={done ? 'text-success text-sm' : 'text-destructive text-sm'}>{message}</p>}
      <Link to="/auth" className="text-sm text-primary">Voltar para entrar</Link>
    </form>
  </main>;
}