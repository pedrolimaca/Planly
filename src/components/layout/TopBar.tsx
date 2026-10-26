import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search, Plus, Bell, Moon, Sun, Menu, Sparkles,
  CheckSquare, CalendarDays, DollarSign, Target, StickyNote, Timer, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { QuickCreateType } from '../../types';

interface TopBarProps {
  onMenuToggle: () => void;
  onQuickCreate: (type: QuickCreateType) => void;
  onSearchChange: (query: string) => void;
  onOpenAgent?: () => void;
}

const quickCreateOptions: { type: QuickCreateType; icon: typeof Plus; label: string }[] = [
  { type: 'task', icon: CheckSquare, label: 'Nova Tarefa' },
  { type: 'event', icon: CalendarDays, label: 'Novo Evento' },
  { type: 'reminder', icon: Clock, label: 'Novo Lembrete' },
  { type: 'finance', icon: DollarSign, label: 'Novo Lançamento' },
  { type: 'habit', icon: Timer, label: 'Novo Hábito' },
  { type: 'goal', icon: Target, label: 'Nova Meta' },
  { type: 'note', icon: StickyNote, label: 'Nova Anotação' },
];

export default function TopBar({ onMenuToggle, onQuickCreate, onSearchChange, onOpenAgent }: TopBarProps) {
  const { user, updateProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const quickCreateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const dateStr = format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target as Node)) {
        setShowQuickCreate(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const toggleTheme = () => {
    const newTheme = user?.theme === 'dark' ? 'light' : 'dark';
    updateProfile({ theme: newTheme });
  };

  const initials = user?.display_name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-btn topbar-menu-btn" onClick={onMenuToggle} aria-label="Menu">
          <Menu size={20} />
        </button>
        <span className="topbar-date" style={{ textTransform: 'capitalize' }}>{dateStr}</span>
      </div>

      <div className="topbar-search">
        <Search size={16} className="topbar-search-icon" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Buscar tarefas, eventos, metas..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Busca global"
        />
      </div>

      <div className="topbar-right">
        {/* AI Copilot Button */}
        {onOpenAgent && (
          <button
            className="topbar-btn"
            onClick={onOpenAgent}
            aria-label="Abrir Copilot IA"
            title="Planly Copilot IA (Análise, Tarefas, Documentos)"
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(109, 40, 217, 0.12) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.45)',
              color: 'var(--color-primary-400)',
            }}
          >
            <Sparkles size={18} />
            <span style={{
              position: 'absolute',
              top: -3,
              right: -3,
              fontSize: '8px',
              fontWeight: 800,
              background: '#8b5cf6',
              color: '#fff',
              borderRadius: '9999px',
              padding: '1px 4px',
              lineHeight: 1,
            }}>
              IA
            </span>
          </button>
        )}

        {/* Quick Create */}
        <div className="dropdown" ref={quickCreateRef}>
          <button
            className="fab"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            aria-label="Criação rápida"
            style={{ width: 36, height: 36 }}
          >
            <Plus size={20} />
          </button>
          {showQuickCreate && (
            <div className="dropdown-menu" style={{ right: 0, minWidth: 200 }}>
              {quickCreateOptions.map(opt => (
                <button
                  key={opt.type}
                  className="dropdown-item"
                  onClick={() => {
                    onQuickCreate(opt.type);
                    setShowQuickCreate(false);
                  }}
                >
                  <opt.icon size={16} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button className="topbar-btn" onClick={toggleTheme} aria-label="Alternar tema">
          {user?.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="dropdown" ref={notifRef}>
          <button
            className="topbar-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificações"
          >
            <Bell size={20} />
          </button>
          {showNotifications && (
            <div className="dropdown-menu" style={{ right: 0, minWidth: 280 }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <span className="font-semibold text-sm">Notificações</span>
              </div>
              <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                <span className="text-sm text-secondary">Nenhuma notificação no momento</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="dropdown" ref={profileRef}>
          <div
            className="topbar-avatar"
            onClick={() => setShowProfile(!showProfile)}
          >
            {user?.avatar_url ? <img src={user.avatar_url} alt={`Foto de ${user.display_name}`} /> : initials}
          </div>
          {showProfile && (
            <div className="dropdown-menu" style={{ right: 0, minWidth: 200 }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="font-semibold text-sm">{user?.display_name}</div>
                <div className="text-xs text-secondary">{user?.email}</div>
              </div>
              <a href="/settings" className="dropdown-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                Configurações
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
