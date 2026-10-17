import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { mergeTraining, parseTraining } from './training-data';

export interface Cube { id: string; brand: string; model: string; category: string; magnetic: boolean; notes: string }
export type UserData = ReturnType<typeof parseTraining>;
export interface User { id: string; email: string; name: string; avatar?: string }
export const emptyData = (): UserData => parseTraining({});

function useAppState() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<UserData>(emptyData);
  const [saveStatus, setSaveStatus] = useState<'loading' | 'saved' | 'saving' | 'error'>('loading');
  const [error, setError] = useState('');
  const [legacyData, setLegacyData] = useState<UserData | null>(null);
  const owner = useRef<string | null>(null);
  const generation = useRef(0);
  const current = useRef<UserData>(emptyData());
  const revision = useRef<number | null>(null);
  const queue = useRef(Promise.resolve());

  const load = useCallback(async (auth: AuthUser | null) => {
    const epoch = ++generation.current;
    owner.current = auth?.id ?? null;
    setUser(null); setData(emptyData()); setLegacyData(null); setError(''); setSaveStatus('loading');
    current.current = emptyData(); revision.current = null;
    if (!auth) { setReady(true); setSaveStatus('saved'); return; }
    const [profile, training] = await Promise.all([
      supabase.from('profiles').select('display_name,avatar_url').eq('id', auth.id).single(),
      supabase.from('training_data').select('payload,revision').eq('user_id', auth.id).maybeSingle(),
    ]);
    if (epoch !== generation.current) return;
    setUser({ id: auth.id, email: auth.email ?? '', name: profile.data?.display_name ?? 'Cubista', ...(profile.data?.avatar_url ? { avatar: profile.data.avatar_url } : {}) });
    try {
      if (profile.error || training.error) throw new Error('Não foi possível carregar seus dados. Tente novamente.');
      const loaded = parseTraining(training.data?.payload ?? {});
      current.current = loaded; setData(loaded); revision.current = training.data?.revision ?? null;
      setSaveStatus('saved');
      // Never trust the old local session or upload stored credentials.
      try {
        const raw = localStorage.getItem(`jcca_data_${auth.email?.toLowerCase()}`);
        if (raw) setLegacyData(parseTraining(JSON.parse(raw)));
      } catch { setError('Há dados locais inválidos; o original foi preservado para recuperação.'); }
    } catch (err) { setSaveStatus('error'); setError(err instanceof Error ? err.message : 'Dados inválidos. O original foi preservado.'); }
    setReady(true);
  }, []);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      const result = await supabase.auth.getUser();
      if (!active) return;
      await load(result.data.user);
    };
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (!['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) return;
      // Leave the auth callback before making another auth request.
      setTimeout(() => { if (active) { void sync(); void router.invalidate(); if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries(); } }, 0);
    });
    void sync();
    return () => { active = false; generation.current++; subscription.subscription.unsubscribe(); };
  }, [load, queryClient, router]);

  const update = useCallback((fn: (d: UserData) => UserData) => {
    const id = owner.current;
    if (!id || saveStatus === 'loading' || saveStatus === 'error') return;
    let next: UserData;
    try { next = parseTraining(fn(current.current)); } catch { setError('Alteração inválida. Seus dados não foram modificados.'); return; }
    const epoch = generation.current;
    current.current = next; setData(next); setSaveStatus('saving');
    queue.current = queue.current.then(async () => {
      if (owner.current !== id || generation.current !== epoch) return;
      const payload = JSON.parse(JSON.stringify(next));
      const request = revision.current === null
        ? supabase.from('training_data').insert({ user_id: id, payload }).select('revision').single()
        : supabase.from('training_data').update({ payload }).eq('user_id', id).eq('revision', revision.current).select('revision').single();
      const result = await request;
      if (owner.current !== id || generation.current !== epoch) return;
      if (result.error) {
        // Keep an explicit recovery copy; never use it as authorization or overwrite Cloud on load.
        try { localStorage.setItem(`jcca_pending_${id}`, JSON.stringify(next)); } catch { /* UI retains unsaved data. */ }
        setSaveStatus('error'); setError('Não foi possível salvar, ou houve alteração em outro aparelho. Baixe um backup antes de recarregar.');
        return;
      }
      revision.current = result.data.revision;
      if (current.current === next) { setSaveStatus('saved'); setError(''); }
    }).catch(() => { if (generation.current === epoch) { setSaveStatus('error'); setError('Falha ao salvar. Baixe um backup antes de sair.'); } });
  }, [saveStatus]);

  const signup = async (name: string, email: string, password: string) => {
    const result = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin } });
    if (result.error) throw new Error('Não foi possível criar a conta. Confira o e-mail e os requisitos da senha.');
    return Boolean(result.data.session);
  };
  const login = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (result.error) throw new Error(result.error.code === 'email_not_confirmed' ? 'Confirme seu e-mail antes de entrar.' : 'Não foi possível entrar. Confira seu e-mail e senha.');
  };
  const loginSocial = async (provider: 'google' | 'lovable') => {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin, ...(provider === 'google' ? { extraParams: { prompt: 'select_account' } } : {}) });
    if (result.error) throw new Error('Não foi possível entrar. Tente novamente.');
  };
  const resetPassword = async (email: string) => {
    const result = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (result.error) throw new Error('Não foi possível enviar o link. Tente novamente mais tarde.');
  };
  const logout = async () => {
    if (saveStatus !== 'saved' && !window.confirm('Há dados ainda não salvos. Deseja sair mesmo assim?')) return;
    await queue.current;
    await queryClient.cancelQueries(); queryClient.clear();
    const result = await supabase.auth.signOut();
    if (result.error) { setError('Não foi possível sair. Tente novamente.'); return; }
    await load(null); await router.navigate({ to: '/auth', replace: true });
  };
  const importLegacy = () => { if (legacyData) { update(d => mergeTraining(d, legacyData)); setLegacyData(null); } };
  return { ready, user, data, update, signup, login, loginGoogle: () => loginSocial('google'), loginLovable: () => loginSocial('lovable'), resetPassword, logout, saveStatus, error, legacyData, importLegacy, dismissLegacy: () => setLegacyData(null) };
}
export type App = ReturnType<typeof useAppState>;
const AppContext = createContext<App | null>(null);
export function AppProvider({ children }: { children: ReactNode }) { const app = useAppState(); return <AppContext.Provider value={app}>{children}</AppContext.Provider>; }
export function useApp() { const app = useContext(AppContext); if (!app) throw new Error('AppProvider is required'); return app; }
export const uid = () => crypto.randomUUID();