import { createFileRoute, Navigate } from '@tanstack/react-router';
import { AuthScreen } from '@/components/cube/AuthScreen';
import { CubeLogo } from '@/components/cube/CubeLogo';
import { useApp } from '@/lib/store';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Entrar — Jhuan Carlos Cube Academy' },
    { name: 'description', content: 'Entre ou crie sua conta para guardar seus treinos na Cube Academy.' },
    { property: 'og:title', content: 'Entrar — Cube Academy' },
    { property: 'og:description', content: 'Acesse sua conta e seus treinos de cubo mágico.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: AuthPage,
});
function AuthPage() {
  const app = useApp();
  if (!app.ready) return <div className="min-h-screen flex items-center justify-center"><CubeLogo size={56} /></div>;
  if (app.user) return <Navigate to="/" replace />;
  return <AuthScreen app={app} />;
}