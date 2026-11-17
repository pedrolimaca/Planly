const {PGlite}=require(process.env.PLANLY_PGLITE_PATH||'@electric-sql/pglite');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const db=new PGlite();try{
await db.exec(`create schema auth;create role authenticated;create role anon;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');`);
await db.exec(fs.readFileSync('supabase/migrations/20261117_sync_records.sql','utf8'));
await db.exec(`set role authenticated;set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';`);
const write=async(rev,op,title)=>{const r=await db.query('select public.planly_write_record($1,$2,$3::jsonb,$4,$5,$6) as result',['notes','n',JSON.stringify({id:'n',title}),false,rev,op]);return r.rows[0].result;};
const first=await write(0,'operation-1','PC');assert.equal(first.conflict,false);assert.equal(first.row.revision,1);
assert.equal((await write(0,'operation-1','PC')).row.revision,1);assert.equal((await write(0,'operation-2','Stale')).conflict,true);assert.equal((await write(1,'operation-3','Updated')).row.revision,2);
await db.exec(`set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';`);assert.equal((await db.query('select * from public.planly_records')).rows.length,0);
await assert.rejects(db.query("insert into public.planly_records(user_id,collection,record_id) values('11111111-1111-4111-8111-111111111111','notes','attack')"));
await db.exec('reset role;set role anon;');await assert.rejects(db.query('select * from public.planly_records'));await assert.rejects(write(0,'attack','No auth'));
console.log({migration:true,authenticatedCrud:true,idempotency:true,conflictCheck:true,crossUserIsolation:true,anonymousBlocked:true});
}finally{await db.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
