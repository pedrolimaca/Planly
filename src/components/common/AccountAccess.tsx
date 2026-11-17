import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../services/supabase';
import { createItem, exportAllData, getAllItems } from '../../services/storage';
import Card from './Card';
import Button from './Button';
export default function AccountAccess() {
  const { login, register, user, isCloudAuthenticated } = useAuth();
  const [status, setStatus] = useState(''); const [busy, setBusy] = useState(false);
  return <Card title="Conta e privacidade" subtitle="Entre com a mesma conta no celular e no computador. A sincronização depende do banco configurado e é acompanhada pelo indicador de status.">
    <p>Perfil: {user?.email || 'local'}. Exporte seus dados antes de trocar de perfil. Os dados anteriores são preservados.</p>
    {isSupabaseConfigured() ? <form className="smart-actions" onSubmit={async e => {
      e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true);
      try {
        const result = form.get('register') ? await register(String(form.get('email')), String(form.get('email')), String(form.get('password'))) : await login(String(form.get('email')), String(form.get('password')));
        setStatus(result.success ? 'Solicitação aceita. Para cadastro, confira a confirmação enviada ao seu e-mail.' : result.error || 'Falha ao autenticar.');
      } catch { setStatus('Serviço de autenticação indisponível.'); } finally { setBusy(false); }
    }}><label>E-mail <input name="email" type="email" required autoComplete="email" /></label><label>Senha <input name="password" type="password" minLength={8} required autoComplete="current-password" /></label><label><input name="register" type="checkbox" /> Criar conta</label><Button disabled={busy} type="submit">{busy ? 'Aguarde…' : 'Continuar'}</Button></form> : <p>Autenticação remota indisponível: configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</p>}
    {isCloudAuthenticated && user && <details><summary>Trazer dados do perfil local deste navegador</summary>
      <p>Importa os registros do perfil local para esta conta, inclusive exemplos que você tenha mantido. Registros com o mesmo identificador são preservados na conta. Faça isso no navegador em que usava o Planly.</p>
      <Button type="button" disabled={busy} onClick={() => {
        setBusy(true);
        try {
          let count = 0;
          for (const [collection, records] of Object.entries(exportAllData('demo-user-pedro'))) {
            if (collection === 'profile') continue;
            const ids = new Set(getAllItems<{id:string}>(collection,user.id).map(r=>r.id));
            for (const record of records) {
              if (!record || typeof record !== 'object' || !('id' in record) || typeof record.id !== 'string' || ids.has(record.id)) continue;
              createItem<{id:string;user_id:string}>(collection,user.id,{...record,id:record.id,user_id:user.id});
              ids.add(record.id);count++;
            }
          }
          setStatus(`${count} registro(s) importado(s). Acompanhe o envio no indicador de sincronização.`);
        } catch { setStatus('A importação não terminou. Os dados originais foram preservados; você pode tentar novamente.'); }
        finally { setBusy(false); }
      }}>Importar dados locais para minha conta</Button>
    </details>}
    <p role="status">{status}</p>
  </Card>;
}
