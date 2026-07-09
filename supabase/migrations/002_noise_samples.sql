-- Minute-level noise samples for timeline charts

create table public.sleep_noise_samples (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sleep_sessions (id) on delete cascade,
  minute_offset integer not null check (minute_offset >= 0),
  avg_db numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (session_id, minute_offset)
);

create index sleep_noise_samples_session_id_idx on public.sleep_noise_samples (session_id);

alter table public.sleep_noise_samples enable row level security;

create policy "Users can view own noise samples"
  on public.sleep_noise_samples for select
  using (
    exists (
      select 1 from public.sleep_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own noise samples"
  on public.sleep_noise_samples for insert
  with check (
    exists (
      select 1 from public.sleep_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
