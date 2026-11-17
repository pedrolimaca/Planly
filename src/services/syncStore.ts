import { v4 as uuid } from 'uuid';
export type RecordData = {id:string;[key:string]:unknown};
export interface CloudRow { collection:string;record_id:string;payload:RecordData;deleted:boolean;revision:number;mutation_id?:string }
export interface PendingChange { collection:string;record_id:string;payload:RecordData;deleted:boolean;expected_revision:number;mutation_id:string }
interface Store { collections:Record<string,RecordData[]>; revisions:Record<string,number>;pending:Record<string,PendingChange> }
const key=(user:string)=>`planly_sync_${user}`;
const recordKey=(collection:string,id:string)=>JSON.stringify([collection,id]);
export function readSyncStore(user:string):Store|null {
  const raw=localStorage.getItem(key(user));if(!raw)return null;
  const value=JSON.parse(raw) as Store;
  if(!value.collections||!value.pending||!value.revisions)throw new Error('Cache de sincronização inválido. Exporte os dados antes de reparar.');
  return value;
}
function save(user:string,store:Store){localStorage.setItem(key(user),JSON.stringify(store));queueMicrotask(()=>window.dispatchEvent(new Event('planly:data')));}
export function enableSyncStore(user:string,collections:Record<string,unknown[]>){
  if(readSyncStore(user))return;
  const store:Store={collections:{},revisions:{},pending:{}};
  for(const [collection,items] of Object.entries(collections)){
    store.collections[collection]=items as RecordData[];
    for(const raw of items){const item=raw as RecordData;if(typeof item.id!=='string')throw new Error('Registro sem ID: '+collection);
      store.pending[recordKey(collection,item.id)]={collection,record_id:item.id,payload:item,deleted:false,expected_revision:0,mutation_id:uuid()};
    }
  }
  save(user,store);
}
export function writeSyncedCollection(user:string,collection:string,items:RecordData[]):boolean{
  const store=readSyncStore(user);if(!store)return false;
  const before=store.collections[collection]||[];
  for(const id of new Set([...before,...items].map(item=>item.id))){
    const old=before.find(i=>i.id===id);const next=items.find(i=>i.id===id);
    if(JSON.stringify(old)===JSON.stringify(next))continue;
    const k=recordKey(collection,id);
    store.pending[k]={collection,record_id:id,payload:next||{id},deleted:!next,expected_revision:store.pending[k]?.expected_revision??store.revisions[k]??0,mutation_id:uuid()};
  }
  store.collections[collection]=items;save(user,store);return true;
}
export function pendingChanges(user:string){return Object.values(readSyncStore(user)?.pending||{});}
export function applyCloudRows(user:string,rows:CloudRow[]){
  const store=readSyncStore(user);if(!store)return;
  for(const row of rows){const k=recordKey(row.collection,row.record_id);if(store.pending[k])continue;
    if((store.revisions[k]??-1)>row.revision)continue;
    const items=store.collections[row.collection]||[];
    store.collections[row.collection]=items.filter(i=>i.id!==row.record_id);
    if(!row.deleted)store.collections[row.collection].push(row.payload);
    store.revisions[k]=row.revision;
  }
  save(user,store);
}
export function acknowledgeChange(user:string,change:PendingChange,row:CloudRow){
  const store=readSyncStore(user);if(!store)return;
  const k=recordKey(change.collection,change.record_id);const pending=store.pending[k];
  if(pending?.mutation_id===change.mutation_id)delete store.pending[k];
  else if(pending)pending.expected_revision=row.revision;
  store.revisions[k]=row.revision;save(user,store);applyCloudRows(user,[row]);
}
export function resolveSyncConflict(user:string,row:CloudRow,choice:'cloud'|'local'){
  const store=readSyncStore(user);if(!store)return;const k=recordKey(row.collection,row.record_id);
  if(choice==='cloud')delete store.pending[k];
  else if(store.pending[k]){store.pending[k].expected_revision=row.revision;store.pending[k].mutation_id=uuid();}
  save(user,store);if(choice==='cloud')applyCloudRows(user,[row]);
}
