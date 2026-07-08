-- CySleep initial schema (Faz 1 MVP)

create extension if not exists "uuid-ossp";

create type public.user_plan as enum ('free', 'premium');
create type public.sleep_event_type as enum ('snore', 'cough', 'talk', 'noise');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  plan public.user_plan not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sleep_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  sleep_score integer check (sleep_score between 0 and 100),
  avg_db numeric(5, 2),
  peak_db numeric(5, 2),
  snore_count integer not null default 0,
  cough_count integer not null default 0,
  talk_count integer not null default 0,
  noise_count integer not null default 0,
  interruption_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.sleep_events (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sleep_sessions (id) on delete cascade,
  occurred_at timestamptz not null,
  duration_ms integer not null default 0,
  event_type public.sleep_event_type not null default 'noise',
  peak_db numeric(5, 2) not null default 0,
  confidence numeric(4, 3) not null default 0,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan public.user_plan not null default 'free',
  status text not null default 'inactive',
  provider text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sleep_sessions_user_id_idx on public.sleep_sessions (user_id);
create index sleep_sessions_started_at_idx on public.sleep_sessions (started_at desc);
create index sleep_events_session_id_idx on public.sleep_events (session_id);
create index subscriptions_user_id_idx on public.subscriptions (user_id);

alter table public.profiles enable row level security;
alter table public.sleep_sessions enable row level security;
alter table public.sleep_events enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own sessions"
  on public.sleep_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sleep_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sleep_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sleep_sessions for delete
  using (auth.uid() = user_id);

create policy "Users can view own events"
  on public.sleep_events for select
  using (
    exists (
      select 1 from public.sleep_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own events"
  on public.sleep_events for insert
  with check (
    exists (
      select 1 from public.sleep_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();
