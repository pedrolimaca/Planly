import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import PageLayout from './components/layout/PageLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import MyDayPage from './pages/MyDayPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import HabitsPage from './pages/HabitsPage';
import RemindersPage from './pages/RemindersPage';
import FinancePage from './pages/FinancePage';
import FitnessPage from './pages/FitnessPage';
import NutritionPage from './pages/NutritionPage';
import HealthPage from './pages/HealthPage';
import StudiesPage from './pages/StudiesPage';
import SpiritualPage from './pages/SpiritualPage';
import GoalsPage from './pages/GoalsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import GuitarPracticePage from './pages/GuitarPracticePage';
import EnglishLearningPage from './pages/EnglishLearningPage';

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--surface-bg)',
          color: 'var(--color-primary-600)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="btn-spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Carregando Planly...</h3>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/my-day" element={<MyDayPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/fitness" element={<FitnessPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/studies" element={<StudiesPage />} />
        <Route path="/spiritual" element={<SpiritualPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/guitar" element={<GuitarPracticePage />} />
        <Route path="/english" element={<EnglishLearningPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
