import AccountAccess from './components/common/AccountAccess';
import { format } from 'date-fns';
import { loadCatholicDay } from './services/publicContent';
import { lazy, Suspense, useEffect } from 'react';
const NotesPage = lazy(() => import('./pages/NotesPage'));
const RadarPage = lazy(() => import('./pages/RadarPage'));
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import PageLayout from './components/layout/PageLayout';

// Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MyDayPage = lazy(() => import('./pages/MyDayPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));
const RemindersPage = lazy(() => import('./pages/RemindersPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const FitnessPage = lazy(() => import('./pages/FitnessPage'));
const NutritionPage = lazy(() => import('./pages/NutritionPage'));
const HealthPage = lazy(() => import('./pages/HealthPage'));
const StudiesPage = lazy(() => import('./pages/StudiesPage'));
const SpiritualPage = lazy(() => import('./pages/SpiritualPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const GuitarPracticePage = lazy(() => import('./pages/GuitarPracticePage'));
const EnglishLearningPage = lazy(() => import('./pages/EnglishLearningPage'));

function AppContent() {
  const { isLoading, user, isCloudAuthenticated } = useAuth();
  useEffect(()=>{
    let previous='';
    const preload=()=>{const today=format(new Date(),'yyyy-MM-dd');if(today!==previous){previous=today;void loadCatholicDay(today).catch(()=>{});}};
    preload();const timer=setInterval(preload,60000);return()=>clearInterval(timer);
  },[]);

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

  if(import.meta.env.PROD && !isCloudAuthenticated)return <main className="auth-screen"><h1>Planly</h1><p>Entre na sua conta para acessar seus dados em qualquer dispositivo.</p><AccountAccess /></main>;

  return (
    <PageLayout key={user?.id}>
      <Suspense fallback={<p role="status">Carregando módulo…</p>}><Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/my-day" element={<MyDayPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/radar" element={<RadarPage />} />
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
      </Routes></Suspense>
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
