import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import QuickCreateModal from './QuickCreateModal';
import ToastContainer from './ToastContainer';
import AIAgentDrawer from '../ai/AIAgentDrawer';
import type { QuickCreateType } from '../../types';

interface PageLayoutProps {
  children: React.ReactNode;
  onRefreshData?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function PageLayout({
  children,
  onRefreshData,
  onSearchChange,
}: PageLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<QuickCreateType | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const handleQuickCreate = (type: QuickCreateType) => {
    setQuickCreateType(type);
  };

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        open={mobileOpen}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onClose={() => setMobileOpen(false)}
      />

      <div className="main-content">
        <TopBar
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          onQuickCreate={handleQuickCreate}
          onSearchChange={onSearchChange || (() => {})}
          onOpenAgent={() => setIsAgentOpen(true)}
        />

        <main className="page-container">
          {children}
        </main>
      </div>

      <ToastContainer />

      {/* Floating 3D AI Copilot Launcher */}
      <button
        className="floating-ai-launcher"
        onClick={() => setIsAgentOpen(true)}
        title="Planly Copilot IA (Análise, Tarefas, Documentos)"
        aria-label="Abrir Copilot IA"
      >
        <Sparkles size={18} />
        <span>Copilot IA</span>
      </button>

      <AIAgentDrawer
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        onRefreshData={onRefreshData}
      />

      {quickCreateType && (
        <QuickCreateModal
          isOpen={!!quickCreateType}
          initialType={quickCreateType}
          onClose={() => setQuickCreateType(null)}
          onItemCreated={() => {
            onRefreshData?.();
          }}
        />
      )}
    </div>
  );
}

