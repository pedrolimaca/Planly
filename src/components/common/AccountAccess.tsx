import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../services/supabase';
import { createItem, exportAllData, getAllItems } from '../../services/storage';
import Card from './Card';
import Button from './Button';
export default function AccountAccess() {
  const { login, register, user, isCloudAuthenticated } = useAuth();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [failed, setFailed] = useState(false);
  const creating = mode === 'register';
  return <Card className="account-access" title={isCloudAuthenticated ? 'Sua conta' : creating ? 'Crie sua conta' : 'Bem-vindo de volta'} subtitle={isCloudAuthenticated ? 'Gerencie seus dados e o acesso à sua conta.' : creating ? 'Um lugar para organizar sua rotina, no celular e no computador.' : 'Entre para continuar de onde parou.'}>
    {isCloudAuthenticated ? <p className="account-current">Conectado como <strong>{user?.email}</strong></p> : <>
    <div className="account-mode" role="group" aria-label="Tipo de acesso">
      <button type="button" aria-pressed={!creating} disabled={busy} onClick={() => { setMode('login'); setStatus(''); }}>Entrar</button>
      <button type="button" aria-pressed={creating} disabled={busy} onClick={() => { setMode('register'); setStatus(''); }}>Criar conta</button>
    </div>
    {isSupabaseConfigured() ? <form className="account-form" aria-label={creating ? 'Cadastro' : 'Login'} onSubmit={async e => {
      e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); setStatus(''); setFailed(false);
      try {
        const email = String(form.get('email')).trim();
        const result = creating ? await register(String(form.get('name')).trim(), email, String(form.get('password'))) : await login(email, String(form.get('password')));
        setFailed(!result.success);
        setStatus(result.success ? creating ? 'Cadastro solicitado. Confira seu e-mail para confirmar a conta e depois entre.' : 'Login realizado. Abrindo seu Planly…' : result.error || 'Não foi possível entrar. Confira seus dados.');
      } catch { setFailed(true); setStatus('Não foi possível conectar. Tente novamente em instantes.'); } finally { setBusy(false); }
    }}>
      {creating && <label className="account-field">Seu nome<input className="input" name="name" required autoComplete="name" placeholder="Como você quer ser chamado?" disabled={busy} maxLength={120} /></label>}
      <label className="account-field">E-mail<input className="input" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" disabled={busy} /></label>
      <div className="account-field"><label htmlFor="account-password">Senha</label><div className="account-password">
        <input id="account-password" className="input" name="password" type={showPassword ? 'text' : 'password'} minLength={creating ? 8 : undefined} required autoComplete={creating ? 'new-password' : 'current-password'} placeholder={creating ? 'Crie uma senha' : 'Sua senha'} disabled={busy} aria-describedby={creating ? 'account-password-hint' : undefined} />
        <button type="button" className="account-password-toggle" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>{creating && <small id="account-password-hint">Use pelo menos 8 caracteres.</small>}</div>
      <Button className="account-submit" disabled={busy} type="submit">{busy ? 'Aguarde…' : creating ? 'Criar minha conta' : 'Entrar no Planly'}{!busy && <ArrowRight size={18} aria-hidden="true" />}</Button>
    </form> : <p className="account-notice" role="status">O acesso ainda não está configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na hospedagem.</p>}
    <p className="account-footnote"><LockKeyhole size={14} aria-hidden="true" /> Use a mesma conta no celular e no computador.</p>
    </>}
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
    {status && <p className={`account-notice ${failed ? 'account-notice-error' : ''}`} role={failed ? 'alert' : 'status'}>{status}</p>}
  </Card>;
}
