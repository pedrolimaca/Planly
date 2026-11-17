-- Independent of the older module-specific schema. Never deletes existing tables/data.
create table if not exists public.planly_records (
 user_id uuid not null references auth.users(id) on delete cascade,
 collection text not null check (length(collection) between 1 and 100),
 record_id text not null check (length(record_id) between 1 and 500),
 payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload)='object'),
 deleted boolean not null default false,
 revision bigint not null default 0,
 mutation_id text,
 updated_at timestamptz not null default now(),
 primary key(user_id,collection,record_id)
);
alter table public.planly_records enable row level security;
drop policy if exists own_records on public.planly_records;
create policy own_records on public.planly_records for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update on public.planly_records to authenticated;
revoke all on public.planly_records from anon;
create or replace function public.planly_write_record(p_collection text,p_record_id text,p_payload jsonb,p_deleted boolean,p_expected_revision bigint,p_mutation_id text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare current_row public.planly_records;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_mutation_id is null or length(p_mutation_id)>100 or p_expected_revision<0 then raise exception 'Invalid mutation'; end if;
 if jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Invalid payload'; end if;
 insert into public.planly_records(user_id,collection,record_id,deleted)
 values(auth.uid(),p_collection,p_record_id,true) on conflict do nothing;
 select * into current_row from public.planly_records where user_id=auth.uid() and collection=p_collection and record_id=p_record_id for update;
 if current_row.mutation_id=p_mutation_id then return jsonb_build_object('conflict',false,'row',to_jsonb(current_row)); end if;
 if current_row.revision<>p_expected_revision then return jsonb_build_object('conflict',true,'row',to_jsonb(current_row)); end if;
 update public.planly_records set payload=p_payload||jsonb_build_object('id',p_record_id,'user_id',auth.uid()),deleted=p_deleted,revision=revision+1,mutation_id=p_mutation_id,updated_at=now()
 where user_id=auth.uid() and collection=p_collection and record_id=p_record_id returning * into current_row;
 return jsonb_build_object('conflict',false,'row',to_jsonb(current_row));
end $$;
revoke all on function public.planly_write_record(text,text,jsonb,boolean,bigint,text) from public,anon;
grant execute on function public.planly_write_record(text,text,jsonb,boolean,bigint,text) to authenticated;
