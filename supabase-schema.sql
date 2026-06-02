-- =============================================
-- POSTORIA — Schéma Supabase
-- À coller dans : Supabase > SQL Editor > New query
-- =============================================

-- Table utilisateurs (profils)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text default 'Utilisateur',
  role text default '',
  company text default '',
  sector text default '',
  audience text default '',
  tech_stack text default '',
  lang text default 'fr',
  created_at timestamp with time zone default now()
);

-- Table posts sauvegardés
create table if not exists saved_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  topic text,
  content text not null,
  format text default 'educational',
  created_at timestamp with time zone default now()
);

-- Table idées du jour
create table if not exists daily_ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  topic text,
  title text,
  hook text,
  generated_at date default current_date,
  created_at timestamp with time zone default now()
);

-- RLS (Row Level Security) — chaque user ne voit que ses données
alter table profiles enable row level security;
alter table saved_posts enable row level security;
alter table daily_ideas enable row level security;

create policy "Profil visible par le propriétaire" on profiles
  for all using (auth.uid() = id);

create policy "Posts visibles par le propriétaire" on saved_posts
  for all using (auth.uid() = user_id);

create policy "Idées visibles par le propriétaire" on daily_ideas
  for all using (auth.uid() = user_id);

-- Trigger : crée automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
