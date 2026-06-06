-- Prompt2Post – PostgreSQL schema (Docker local / any Postgres host)

create extension if not exists "pgcrypto";

create table if not exists users (
  id                 text primary key,
  email              text unique not null,
  stripe_customer_id text unique,
  plan               text not null default 'free'
                       check (plan in ('free', 'pro', 'creator')),
  posts_this_month   integer not null default 0,
  posts_reset_at     timestamptz not null default date_trunc('month', now()),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null references users(id) on delete cascade,
  topic      text not null,
  tone       text,
  style      text,
  post_type  text,
  num_slides integer not null default 1,
  structure  jsonb not null default '{}',
  content    jsonb not null default '{}',
  slides     jsonb not null default '[]',
  zip_url    text,
  created_at timestamptz not null default now()
);

create index if not exists posts_user_created on posts(user_id, created_at desc);

create table if not exists subscriptions (
  id                    text primary key,
  user_id               text not null references users(id) on delete cascade,
  stripe_customer_id    text not null,
  stripe_price_id       text not null,
  status                text not null,
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at on users;
create trigger users_updated_at
  before update on users
  for each row execute procedure touch_updated_at();

drop trigger if exists subscriptions_updated_at on subscriptions;
create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute procedure touch_updated_at();

create or replace function reset_monthly_posts()
returns trigger language plpgsql as $$
begin
  if date_trunc('month', now()) > date_trunc('month', old.posts_reset_at) then
    new.posts_this_month = 0;
    new.posts_reset_at = date_trunc('month', now());
  end if;
  return new;
end;
$$;

drop trigger if exists users_reset_monthly on users;
create trigger users_reset_monthly
  before update on users
  for each row execute procedure reset_monthly_posts();
