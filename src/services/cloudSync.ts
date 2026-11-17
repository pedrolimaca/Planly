import { supabase } from './supabase';
import { exportAllData } from './storage';
import { acknowledgeChange, applyCloudRows, enableSyncStore, pendingChanges, type CloudRow, type PendingChange } from './syncStore';
export interface SyncTransport { write(change:PendingChange):Promise<{conflict:boolean;row:CloudRow}>;read():Promise<CloudRow[]> }
export async function syncOnce(user:string,transport:SyncTransport,active=()=>true){
 const conflicts:CloudRow[]=[];
 for(const change of pendingChanges(user)){
  if(!active())return conflicts;
  const result=await transport.write(change);if(!active())return conflicts;
  if(result.conflict)conflicts.push(result.row);else acknowledgeChange(user,change,result.row);
 }
 if(active()){const rows=await transport.read();if(active())applyCloudRows(user,rows);}
 return conflicts;
}
export interface SyncStatus {userId:string;state:'local'|'syncing'|'synced'|'error'|'offline'|'conflict';message:string;pending:number;lastSynced?:string;conflicts:CloudRow[]}
let status:SyncStatus={userId:'',state:'local',message:'Perfil local — dados somente neste navegador.',pending:0,conflicts:[]};
const listeners=new Set<()=>void>();
export const getSyncStatus=()=>status;
export function subscribeSync(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
function emit(value:SyncStatus){status=value;listeners.forEach(fn=>fn());}
let requestSync=()=>{};
export function syncNow(){requestSync();}
export function startCloudSync(userId:string){
 let active=true;let running=false;let timer:ReturnType<typeof setTimeout>|undefined;
 const client=supabase;if(!client)return()=>{};
 try{enableSyncStore(userId,exportAllData(userId));}catch{emit({userId,state:'error',message:'Não foi possível preparar o cache. Exporte os dados antes de tentar reparar.',pending:0,conflicts:[]});return()=>{};}
 const transport:SyncTransport={
  async write(c){const {data,error}=await client.rpc('planly_write_record',{p_collection:c.collection,p_record_id:c.record_id,p_payload:c.payload,p_deleted:c.deleted,p_expected_revision:c.expected_revision,p_mutation_id:c.mutation_id});if(error)throw error;return data;},
  async read(){const rows:CloudRow[]=[];let from=0;for(;;){
   const {data,error}=await client.from('planly_records').select('collection,record_id,payload,deleted,revision,mutation_id').eq('user_id',userId).order('collection').order('record_id').range(from,from+499);if(error)throw error;
   rows.push(...data);if(data.length<500)break;from+=500;
  }return rows;}
 };
 const run=async()=>{
  if(!active||running)return;running=true;
  try{
   const {data,error}=await client.auth.getSession();if(error||data.session?.user.id!==userId)throw new Error('Sessão inválida.');
   if(!active)return;
   emit({userId,state:'syncing',message:'Sincronizando com sua conta…',pending:pendingChanges(userId).length,conflicts:[]});
   const execute=()=>syncOnce(userId,transport,()=>active);
   const conflicts=navigator.locks?await navigator.locks.request('planly-sync-'+userId,execute):await execute();
   if(active){const count=pendingChanges(userId).length;emit({userId,state:conflicts.length?'conflict':count?'syncing':'synced',message:conflicts.length?'Há alterações feitas em dois dispositivos. Resolva em Configurações.':count?'Enviando alterações pendentes…':'Dados sincronizados com sua conta.',pending:count,conflicts,lastSynced:new Date().toISOString()});}
  }catch(e){if(active)emit({userId,state:navigator.onLine?'error':'offline',message:navigator.onLine?'Não foi possível sincronizar. Confira a sessão e a migração planly_records no Supabase. Seus dados locais foram mantidos.':'Sem conexão. As alterações serão enviadas quando a conexão voltar.',pending:pendingChanges(userId).length,conflicts:[],lastSynced:status.lastSynced});void e;}
  finally{running=false;}
 };
 const schedule=()=>{if(!active||running)return;clearTimeout(timer);timer=setTimeout(()=>void run(),350);};
 requestSync=()=>void run();void run();
 const interval=setInterval(()=>void run(),15000);
 window.addEventListener('planly:data',schedule);window.addEventListener('storage',schedule);window.addEventListener('online',schedule);window.addEventListener('focus',schedule);
 return()=>{active=false;clearTimeout(timer);clearInterval(interval);window.removeEventListener('planly:data',schedule);window.removeEventListener('storage',schedule);window.removeEventListener('online',schedule);window.removeEventListener('focus',schedule);requestSync=()=>{};emit({userId:'',state:'local',message:'Perfil local — dados somente neste navegador.',pending:0,conflicts:[]});};
}
