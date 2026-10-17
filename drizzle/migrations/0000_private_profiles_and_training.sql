CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT 'Cubista' CHECK (char_length(display_name) BETWEEN 1 AND 80),
 avatar_url text,
 preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TABLE public.training_data (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 payload jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(payload) = 'object'),
 revision integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.training_data TO authenticated;
GRANT ALL ON public.training_data TO service_role;
ALTER TABLE public.training_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_read_own ON public.training_data FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY training_insert_own ON public.training_data FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY training_update_own ON public.training_data FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE FUNCTION public.create_cube_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, display_name) VALUES (NEW.id, left(coalesce(nullif(NEW.raw_user_meta_data->>'name',''), nullif(NEW.raw_user_meta_data->>'full_name',''), 'Cubista'),80));
 RETURN NEW;
END;
$$;
CREATE TRIGGER cube_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_cube_profile();
REVOKE ALL ON FUNCTION public.create_cube_profile() FROM PUBLIC, anon, authenticated;
CREATE FUNCTION public.advance_training_revision() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 NEW.revision := OLD.revision + 1;
 NEW.updated_at := now();
 RETURN NEW;
END;
$$;
CREATE TRIGGER training_revision BEFORE UPDATE ON public.training_data FOR EACH ROW EXECUTE FUNCTION public.advance_training_revision();
REVOKE ALL ON FUNCTION public.advance_training_revision() FROM PUBLIC, anon, authenticated;