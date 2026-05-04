-- Saldo Verde - schema base para auth/perfil
-- Idempotente: pode executar mais de uma vez sem quebrar.

begin;

-- Tabela usada para bloquear reuso de email/CPF de contas excluidas.
create table if not exists public.deleted_accounts (
  id bigint generated always as identity primary key,
  email text,
  cpf text,
  deleted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint deleted_accounts_email_or_cpf_chk check (
    (email is not null and length(trim(email)) > 0)
    or (cpf is not null and length(trim(cpf)) > 0)
  )
);

create unique index if not exists deleted_accounts_email_cpf_uq
  on public.deleted_accounts (email, cpf);

create index if not exists deleted_accounts_email_idx
  on public.deleted_accounts (email);

create index if not exists deleted_accounts_cpf_idx
  on public.deleted_accounts (cpf);

-- Perfil basico para leituras em /profile/:id (id = auth.users.id).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  cpf text,
  phone text,
  birthdate date,
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  avatar_url text,
  profile_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles drop column if exists email;
alter table public.profiles drop column if exists provider;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists cpf text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists birthdate date;
alter table public.profiles add column if not exists cep text;
alter table public.profiles add column if not exists street text;
alter table public.profiles add column if not exists number text;
alter table public.profiles add column if not exists complement text;
alter table public.profiles add column if not exists neighborhood text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists profile_complete boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles drop column if exists birthday;
alter table public.profiles drop column if exists document;

alter table public.deleted_accounts
  alter column email type text,
  alter column cpf type text;

alter table public.profiles
  alter column first_name type text,
  alter column last_name type text,
  alter column cpf type text,
  alter column phone type text,
  alter column birthdate type date using (case when pg_typeof(birthdate)::text = 'text' then to_date(birthdate::text, 'DD/MM/YYYY') else birthdate::date end),
  alter column cep type text,
  alter column street type text,
  alter column number type text,
  alter column complement type text,
  alter column neighborhood type text,
  alter column city type text,
  alter column state type text;

create index if not exists profiles_cpf_idx
  on public.profiles (cpf);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind varchar(64) not null,
  title varchar(255) not null,
  message text not null,
  unread boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_notifications_user_kind_uq unique (user_id, kind)
);

create index if not exists user_notifications_user_id_idx
  on public.user_notifications (user_id);

create index if not exists user_notifications_created_at_idx
  on public.user_notifications (created_at desc);

-- Trigger generico de updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists user_notifications_set_updated_at on public.user_notifications;
create trigger user_notifications_set_updated_at
before update on public.user_notifications
for each row
execute function public.set_updated_at();

-- Cria/atualiza perfil automaticamente para novos usuarios (email/senha e Google).
create or replace function public.handle_auth_user_upsert_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name_fallback text;
  v_first_name text;
  v_last_name text;
  v_cpf text;
  v_phone text;
  v_birthdate date;
  v_cep text;
  v_street text;
  v_number text;
  v_complement text;
  v_neighborhood text;
  v_city text;
  v_state text;
  v_avatar_url text;
  v_complete boolean;
begin
  v_name_fallback := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '');
  v_first_name := coalesce(
    new.raw_user_meta_data ->> 'first_name',
    nullif(split_part(v_name_fallback, ' ', 1), '')
  );
  v_last_name := coalesce(
    new.raw_user_meta_data ->> 'last_name',
    case
      when position(' ' in v_name_fallback) > 0
        then nullif(trim(substring(v_name_fallback from position(' ' in v_name_fallback) + 1)), '')
      else null
    end
  );
  v_cpf := new.raw_user_meta_data ->> 'cpf';
  v_phone := new.raw_user_meta_data ->> 'phone';
  v_birthdate := case
    when length(trim(coalesce(new.raw_user_meta_data ->> 'birthdate', ''))) = 0 then null
    when new.raw_user_meta_data ->> 'birthdate' ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
      then to_date(new.raw_user_meta_data ->> 'birthdate', 'DD/MM/YYYY')
    else (new.raw_user_meta_data ->> 'birthdate')::date
  end;
  v_cep := new.raw_user_meta_data ->> 'cep';
  v_street := new.raw_user_meta_data ->> 'street';
  v_number := new.raw_user_meta_data ->> 'number';
  v_complement := new.raw_user_meta_data ->> 'complement';
  v_neighborhood := new.raw_user_meta_data ->> 'neighborhood';
  v_city := new.raw_user_meta_data ->> 'city';
  v_state := new.raw_user_meta_data ->> 'state';
  v_avatar_url := coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture');
  v_complete :=
    coalesce(length(trim(new.raw_user_meta_data ->> 'first_name')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'last_name')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'cpf')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'phone')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'birthdate')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'cep')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'street')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'number')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'complement')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'neighborhood')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'city')) > 0, false)
    and coalesce(length(trim(new.raw_user_meta_data ->> 'state')) > 0, false);

  insert into public.profiles (
    id,
    first_name,
    last_name,
    cpf,
    phone,
    birthdate,
    cep,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    avatar_url,
    profile_complete
  )
  values (
    new.id,
    v_first_name,
    v_last_name,
    v_cpf,
    v_phone,
    v_birthdate,
    v_cep,
    v_street,
    v_number,
    v_complement,
    v_neighborhood,
    v_city,
    v_state,
    v_avatar_url,
    v_complete
  )
  on conflict (id) do update
    set first_name = coalesce(excluded.first_name, public.profiles.first_name),
        last_name = coalesce(excluded.last_name, public.profiles.last_name),
        cpf = coalesce(excluded.cpf, public.profiles.cpf),
        phone = coalesce(excluded.phone, public.profiles.phone),
        birthdate = coalesce(excluded.birthdate, public.profiles.birthdate),
        cep = coalesce(excluded.cep, public.profiles.cep),
        street = coalesce(excluded.street, public.profiles.street),
        number = coalesce(excluded.number, public.profiles.number),
        complement = coalesce(excluded.complement, public.profiles.complement),
        neighborhood = coalesce(excluded.neighborhood, public.profiles.neighborhood),
        city = coalesce(excluded.city, public.profiles.city),
        state = coalesce(excluded.state, public.profiles.state),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        profile_complete = excluded.profile_complete,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists auth_users_upsert_profile on auth.users;
create trigger auth_users_upsert_profile
after insert or update on auth.users
for each row
execute function public.handle_auth_user_upsert_profile();

drop trigger if exists auth_user_profile on auth.users;
drop function if exists public.create_profile_after_signup();


-- Backfill para usuarios ja existentes no projeto.
insert into public.profiles (
  id,
  first_name,
  last_name,
  cpf,
  phone,
  birthdate,
  cep,
  street,
  number,
  complement,
  neighborhood,
  city,
  state,
  avatar_url,
  profile_complete
)
select
  u.id,
  coalesce(
    u.raw_user_meta_data ->> 'first_name',
    nullif(split_part(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''), ' ', 1), '')
  ) as first_name,
  coalesce(
    u.raw_user_meta_data ->> 'last_name',
    case
      when position(' ' in coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')) > 0
        then nullif(trim(substring(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '') from position(' ' in coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')) + 1)), '')
      else null
    end
  ) as last_name,
  u.raw_user_meta_data ->> 'cpf' as cpf,
  u.raw_user_meta_data ->> 'phone' as phone,
  case
    when length(trim(coalesce(u.raw_user_meta_data ->> 'birthdate', ''))) = 0 then null
    when u.raw_user_meta_data ->> 'birthdate' ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
      then to_date(u.raw_user_meta_data ->> 'birthdate', 'DD/MM/YYYY')
    else (u.raw_user_meta_data ->> 'birthdate')::date
  end as birthdate,
  u.raw_user_meta_data ->> 'cep' as cep,
  u.raw_user_meta_data ->> 'street' as street,
  u.raw_user_meta_data ->> 'number' as number,
  u.raw_user_meta_data ->> 'complement' as complement,
  u.raw_user_meta_data ->> 'neighborhood' as neighborhood,
  u.raw_user_meta_data ->> 'city' as city,
  u.raw_user_meta_data ->> 'state' as state,
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture') as avatar_url,
  (
    coalesce(length(trim(u.raw_user_meta_data ->> 'first_name')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'last_name')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'cpf')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'phone')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'birthdate')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'cep')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'street')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'number')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'complement')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'neighborhood')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'city')) > 0, false)
    and coalesce(length(trim(u.raw_user_meta_data ->> 'state')) > 0, false)
  ) as profile_complete
from auth.users u
on conflict (id) do update
  set first_name = coalesce(excluded.first_name, public.profiles.first_name),
      last_name = coalesce(excluded.last_name, public.profiles.last_name),
      cpf = coalesce(excluded.cpf, public.profiles.cpf),
      phone = coalesce(excluded.phone, public.profiles.phone),
      birthdate = coalesce(excluded.birthdate, public.profiles.birthdate),
      cep = coalesce(excluded.cep, public.profiles.cep),
      street = coalesce(excluded.street, public.profiles.street),
      number = coalesce(excluded.number, public.profiles.number),
      complement = coalesce(excluded.complement, public.profiles.complement),
      neighborhood = coalesce(excluded.neighborhood, public.profiles.neighborhood),
      city = coalesce(excluded.city, public.profiles.city),
      state = coalesce(excluded.state, public.profiles.state),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      profile_complete = coalesce(excluded.profile_complete, public.profiles.profile_complete),
      updated_at = now();


create or replace function public.count_active_session_devices(p_user_id uuid)
returns integer
language sql
security definer
set search_path = public, auth
as $$
  select coalesce(count(*), 0)::int
  from (
    select distinct
      coalesce(ip::text, 'unknown-ip') as ip_key,
      coalesce(nullif(trim(user_agent), ''), 'unknown-agent') as ua_key
    from auth.sessions
    where user_id = p_user_id
      and (not_after is null or not_after > now())
  ) device_sessions;
$$;

grant execute on function public.count_active_session_devices(uuid) to authenticated;
grant execute on function public.count_active_session_devices(uuid) to service_role;


-- RLS habilitado e sem politicas publicas (backend usa service role).
alter table public.deleted_accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.user_notifications enable row level security;

commit;
