-- Additive migration. Apply only with deployment authorization.
create table if not exists public.planly_agent_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now()
);
create index if not exists planly_agent_usage_user_time on public.planly_agent_usage(user_id, requested_at);
alter table public.planly_agent_usage enable row level security;
-- Only the definer function can write; users cannot reset their own quota.
revoke all on public.planly_agent_usage from anon, authenticated;
create or replace function public.reserve_planly_agent_request() returns boolean
language plpgsql security definer set search_path = public
as $$
declare caller uuid := auth.uid();
begin
  if caller is null then return false; end if;
  perform pg_advisory_xact_lock(hashtextextended(caller::text, 0));
  if (select count(*) from public.planly_agent_usage where user_id = caller and requested_at > now() - interval '1 hour') >= 30
     or (select count(*) from public.planly_agent_usage where user_id = caller and requested_at > now() - interval '1 day') >= 200 then
    return false;
  end if;
  delete from public.planly_agent_usage where user_id = caller and requested_at < now() - interval '2 days';
  insert into public.planly_agent_usage(user_id) values(caller);
  return true;
end;
$$;
revoke all on function public.reserve_planly_agent_request() from public;
grant execute on function public.reserve_planly_agent_request() to authenticated;
