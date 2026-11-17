import test from 'node:test';
import assert from 'node:assert/strict';
import { enableSyncStore, pendingChanges, readSyncStore, resolveSyncConflict, type CloudRow, type PendingChange } from '../src/services/syncStore';
import { createItem, updateItem, deleteItem, getAllItems } from '../src/services/storage';
import { syncOnce, type SyncTransport } from '../src/services/cloudSync';
function device(){const map=new Map<string,string>();return {get length(){return map.size;},key:(i:number)=>[...map.keys()][i]??null,getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);},removeItem:(k:string)=>{map.delete(k);},clear:()=>map.clear()};}
function server():SyncTransport{
 const rows=new Map<string,CloudRow>();
 return {async write(c:PendingChange){const k=c.collection+':'+c.record_id;const old=rows.get(k);
  if(old?.mutation_id===c.mutation_id)return {conflict:false,row:old};
  if((old?.revision||0)!==c.expected_revision)return {conflict:true,row:old!};
  const row={...c,revision:(old?.revision||0)+1};rows.set(k,row);return {conflict:false,row};
 },async read(){return [...rows.values()];}};
}
test('two devices synchronize edits and tombstones, while conflicts preserve local data',async()=>{
 const original=globalThis.localStorage;const a=device();const b=device();const transport=server();
 try{
  Object.assign(globalThis,{localStorage:a});enableSyncStore('alice',{});createItem<{id:string;title:string}>('notes','alice',{id:'n',title:'Primeira'});await syncOnce('alice',transport);
  Object.assign(globalThis,{localStorage:b});enableSyncStore('alice',{});await syncOnce('alice',transport);assert.equal(getAllItems<{title:string}>('notes','alice')[0].title,'Primeira');updateItem('notes','alice','n',{title:'Celular'});
  Object.assign(globalThis,{localStorage:a});updateItem('notes','alice','n',{title:'PC'});await syncOnce('alice',transport);
  Object.assign(globalThis,{localStorage:b});const conflict=await syncOnce('alice',transport);assert.equal(conflict.length,1);assert.equal(getAllItems<{title:string}>('notes','alice')[0].title,'Celular');assert.equal(pendingChanges('alice').length,1);resolveSyncConflict('alice',conflict[0],'cloud');assert.equal(getAllItems<{title:string}>('notes','alice')[0].title,'PC');
  deleteItem('notes','alice','n');await syncOnce('alice',transport);
  Object.assign(globalThis,{localStorage:a});await syncOnce('alice',transport);assert.equal(getAllItems('notes','alice').length,0);assert.equal(pendingChanges('alice').length,0);assert.equal(readSyncStore('bob'),null);
 }finally{Object.assign(globalThis,{localStorage:original});}
});
test('offline queue survives a lost response and edits made while sending',async()=>{
 const original=globalThis.localStorage;Object.assign(globalThis,{localStorage:device()});const transport=server();
 try{
  enableSyncStore('alice',{});createItem<{id:string;title:string}>('notes','alice',{id:'n',title:'Original'});
  await assert.rejects(syncOnce('alice',{...transport,async write(c){await transport.write(c);throw new Error('Network lost');}}));assert.equal(pendingChanges('alice').length,1);await syncOnce('alice',transport);assert.equal(pendingChanges('alice').length,0);
  updateItem('notes','alice','n',{title:'Enviando'});await syncOnce('alice',{...transport,async write(c){updateItem('notes','alice','n',{title:'Mais recente'});return transport.write(c);}});
  assert.equal(pendingChanges('alice').length,1);assert.equal(getAllItems<{title:string}>('notes','alice')[0].title,'Mais recente');await syncOnce('alice',transport);assert.equal(pendingChanges('alice').length,0);
 }finally{Object.assign(globalThis,{localStorage:original});}
});

import { syncErrorMessage } from '../src/services/cloudSync';
test('sync errors distinguish missing schema from permissions without exposing server details',()=>{
 assert.match(syncErrorMessage({code:'PGRST205'}),/20261117_sync_records.sql/);
 assert.match(syncErrorMessage({code:'PGRST202'}),/SQL Editor/);
 assert.match(syncErrorMessage({code:'42501'}),/permissões/);
 assert.doesNotMatch(syncErrorMessage({message:'sensitive server details'}),/sensitive/);
});
