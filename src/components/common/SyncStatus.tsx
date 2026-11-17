import { useSyncExternalStore } from 'react';
import { getSyncStatus, subscribeSync, syncNow } from '../../services/cloudSync';
import { resolveSyncConflict } from '../../services/syncStore';
import { useAuth } from '../../contexts/AuthContext';
export default function SyncStatus({details=false}:{details?:boolean}){
 const {user,isCloudAuthenticated}=useAuth();const sync=useSyncExternalStore(subscribeSync,getSyncStatus);
 if(!isCloudAuthenticated)return <div className="sync-status" role="status">Perfil local · dados somente neste navegador. Entre em Configurações para sincronizar.</div>;
 const current=sync.userId===user?.id?sync:null;
 return <div className="sync-status" role="status"><span>{current?.message||'Preparando sincronização…'} {current?.pending?`${current.pending} alteração(ões) pendente(s).`:''}</span><button className="btn btn-outline btn-sm" onClick={syncNow} disabled={current?.state==='syncing'}>Sincronizar agora</button>{details&&current?.conflicts.map(row=><div className="sync-conflict" key={row.collection+row.record_id}><strong>{row.collection}: {String(row.payload.title||row.payload.name||row.record_id)}</strong><p>Este registro mudou em outro dispositivo. Antes de escolher, você pode exportar o backup local.</p><details><summary>Ver versão da nuvem</summary><pre>{JSON.stringify(row.payload,null,2)}</pre></details><button className="btn btn-outline" onClick={()=>{resolveSyncConflict(user!.id,row,'cloud');syncNow();}}>Usar versão da nuvem</button><button className="btn btn-outline" onClick={()=>{resolveSyncConflict(user!.id,row,'local');syncNow();}}>Manter minha versão local</button></div>)}</div>;
}
