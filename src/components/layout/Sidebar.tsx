import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, CheckSquare, Timer, Bell,
  DollarSign, Dumbbell, Heart, UtensilsCrossed, BookOpen,
  Church, Target, BarChart3, Settings, Music2, Globe, ChevronLeft, ChevronRight,
  Sun, LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PlanlyLogo from '../common/PlanlyLogo';

interface SidebarProps {
  collapsed: boolean;
  open: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

const navSections = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Visão Geral' },
      { to: '/my-day', icon: Sun, label: 'Meu Dia' },
      { to: '/calendar', icon: CalendarDays, label: 'Calendário' },
    ]
  },
  {
    label: 'Organização',
    items: [
      { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
      { to: '/habits', icon: Timer, label: 'Rotinas e Hábitos' },
      { to: '/reminders', icon: Bell, label: 'Lembretes' },
    ]
  },
  {
    label: 'Vida Pessoal',
    items: [
      { to: '/finance', icon: DollarSign, label: 'Finanças' },
      { to: '/fitness', icon: Dumbbell, label: 'Academia e Saúde' },
      { to: '/nutrition', icon: UtensilsCrossed, label: 'Alimentação' },
      { to: '/health', icon: Heart, label: 'Saúde' },
    ]
  },
  {
    label: 'Crescimento',
    items: [
      { to: '/studies', icon: BookOpen, label: 'Estudos e Trabalho' },
      { to: '/spiritual', icon: Church, label: 'Vida Espiritual' },
      { to: '/goals', icon: Target, label: 'Metas e Sonhos' },
      { to: '/guitar', icon: Music2, label: 'Prática de Violão' },
      { to: '/english', icon: Globe, label: 'Aprender Inglês' },
    ]
  },
  {
    label: 'Ferramentas',
    items: [
      { to: '/reports', icon: BarChart3, label: 'Relatórios' },
      { to: '/settings', icon: Settings, label: 'Configurações' },
    ]
  },
];

export default function Sidebar({ collapsed, open, onToggleCollapse, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <PlanlyLogo size={34} showText={true} textColor="var(--sidebar-text-active)" />
        </div>

        <nav className="sidebar-nav">
          {navSections.map(section => (
            <div key={section.label} className="sidebar-section">
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => 
                    `sidebar-link ${isActive || (item.to === '/' && location.pathname === '/') ? 'active' : ''}`
                  }
                  end={item.to === '/'}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-link-icon">
                    <item.icon size={20} />
                  </span>
                  <span className="sidebar-link-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <button
              className="sidebar-link"
              onClick={logout}
              style={{ width: '100%' }}
              title={collapsed ? 'Sair da conta' : undefined}
            >
              <span className="sidebar-link-icon">
                <LogOut size={20} />
              </span>
              <span className="sidebar-link-text">Sair</span>
            </button>
          )}
          <button
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span className="sidebar-link-text">Recolher</span>
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}
