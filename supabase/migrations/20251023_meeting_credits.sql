-- Creates tables for tracking Calendly invitees and meeting credits.

create table if not exists public.meeting_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  remaining integer not null default 100,
  updated_at timestamptz not null default now()
);

create table if not exists public.calendly_invitees (
  invitee_uri text primary key,
  user_id uuid references auth.users(id) on delete set null,
  invitee_email text not null,
  scheduled_event_uri text,
  status text not null check (status in ('active', 'canceled')),
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meeting_credits_remaining_idx on public.meeting_credits (remaining);
create index if not exists calendly_invitees_user_idx on public.calendly_invitees (user_id);
create index if not exists calendly_invitees_status_idx on public.calendly_invitees (status);

comment on table public.meeting_credits is 'Keeps remaining Calendly meeting credits per user.';
comment on column public.meeting_credits.remaining is 'Remaining meeting credits available to the user.';

comment on table public.calendly_invitees is 'Caches Calendly invitee webhook payloads and statuses.';
comment on column public.calendly_invitees.status is 'Current status of the invitee (active/canceled).';
