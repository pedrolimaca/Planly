import { useRef, useState } from 'react';
import {
  Moon, Sun, Database, RotateCcw, Trash2, Camera, UserRound
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { resetToSeedData } from '../services/seedData';
import { isSupabaseConfigured } from '../services/supabase';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.display_name || 'Pedro Cavalcanti');
  const [email, setEmail] = useState(user?.email || 'pedro@exemplo.com');
  const [theme, setTheme] = useState<'light' | 'dark'>(user?.theme || 'light');
  const [notifEnabled, setNotifEnabled] = useState(user?.notification_enabled ?? true);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      display_name: displayName.trim(),
      email: email.trim(),
      theme,
      notification_enabled: notifEnabled,
      avatar_url: avatarUrl || undefined,
    });
    addToast({ type: 'success', title: 'Configurações salvas com sucesso!' });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Formato inválido', message: 'Escolha uma imagem para o perfil.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: 'error', title: 'Imagem muito grande', message: 'Escolha uma foto de até 2 MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleResetDemoData = () => {
    if (!user) return;
    resetToSeedData(user.id);
    setShowResetDialog(false);
    addToast({
      type: 'success',
      title: 'Dados restaurados!',
      message: 'A base de demonstração foi recarregada.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleClearAllData = () => {
    if (!user) return;
    const collections = [
      'tasks', 'events', 'reminders', 'finance', 'budgets',
      'habits', 'habit_logs', 'workouts', 'workout_logs',
      'health', 'meals', 'spiritual', 'projects', 'goals', 'notes',
      'notifications'
    ];
    collections.forEach(col => {
      localStorage.removeItem(`lifeos_${user.id}_${col}`);
    });
    setShowClearDialog(false);
    addToast({
      type: 'info',
      title: 'Dados limpos!',
      message: 'Todos os registros foram removidos.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const hasSupabase = isSupabaseConfigured();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 840, margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Configurações do Sistema</h1>
        <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
          Personalize seu perfil, preferências de visualização, notificações e dados.
        </p>
      </div>

      {/* Profile & Preferences Form */}
      <Card title="Perfil & Conta">
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 'var(--border-radius-md)', background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))' }}>
              {avatarUrl ? <img src={avatarUrl} alt="Prévia do perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserRound size={28} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="font-semibold text-sm">Foto do perfil</div>
              <p className="text-xs text-secondary" style={{ margin: '3px 0 8px' }}>PNG, JPG ou WebP de até 2 MB. A imagem fica salva neste navegador.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}><Camera size={14} /> Escolher foto</Button>
                {avatarUrl && <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl('')}>Remover</Button>}
              </div>
              <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Nome de Exibição</label>
              <input
                type="text"
                className="input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">E-mail</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Tema da Interface</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setTheme('light')}
                  style={{ flex: 1 }}
                >
                  <Sun size={16} /> Claro
                </button>
                <button
                  type="button"
                  className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setTheme('dark')}
                  style={{ flex: 1 }}
                >
                  <Moon size={16} /> Escuro
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Notificações</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40 }}>
                <input
                  type="checkbox"
                  id="notifToggle"
                  checked={notifEnabled}
                  onChange={e => setNotifEnabled(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--color-primary-600)' }}
                />
                <label htmlFor="notifToggle" className="text-sm font-medium">
                  Ativar lembretes e alertas visuais no app
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="submit" variant="primary">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>

      {/* Database & Storage Status */}
      <Card title="Armazenamento & Conexão">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Database size={20} className="text-primary" />
            <div>
              <div className="font-semibold text-sm">Modo de Persistência</div>
              <div className="text-xs text-secondary">
                {hasSupabase ? 'Conectado à nuvem via Supabase PostgreSQL' : 'Local Storage Seguro (funciona offline e em qualquer navegador)'}
              </div>
            </div>
          </div>
          <Badge variant={hasSupabase ? 'success' : 'primary'}>
            {hasSupabase ? 'Supabase Ativo' : 'Local Offline'}
          </Badge>
        </div>
      </Card>

      {/* Danger Zone / Data Management */}
      <Card title="Gerenciamento de Dados">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
            <div>
              <div className="font-semibold text-sm">Restaurar Dados de Exemplo</div>
              <div className="text-xs text-secondary">
                Recarrega tarefas, treinos, rotinas e metas de demonstração com dados realistas.
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowResetDialog(true)}>
              <RotateCcw size={15} /> Restaurar Demo
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--color-danger-50)', border: '1px solid var(--color-danger-100)' }}>
            <div>
              <div className="font-semibold text-sm text-danger" style={{ color: '#dc2626' }}>Limpar Toda a Base</div>
              <div className="text-xs text-secondary">
                Apaga todas as tarefas, finanças e registros para você iniciar do zero.
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowClearDialog(true)}>
              <Trash2 size={15} /> Limpar Tudo
            </Button>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetDemoData}
        title="Restaurar Dados de Exemplo"
        message="Isto irá substituir seus dados atuais pela base de demonstração do Planly. Deseja prosseguir?"
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAllData}
        title="Limpar Toda a Base"
        message="Atenção: todos os registros criados serão apagados permanentemente. Esta ação não pode ser desfeita. Confirmar?"
        confirmText="Sim, Limpar Tudo"
        variant="danger"
      />
    </div>
  );
}
