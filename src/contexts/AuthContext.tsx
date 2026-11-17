import { startCloudSync } from '../services/cloudSync';
import { createItem, getAllItems, updateItem, subscribeToData } from '../services/storage';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { UserProfile, Theme } from '../types';
import { APP_CONFIG } from '../config/app';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isCloudAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'lifeos_auth';
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudUserId,setCloudUserId]=useState<string>();

  useEffect(() => {
    let active = true;
    const restoreLocal = () => {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      try { if (raw) { const profile = JSON.parse(raw); if (profile.id === 'demo-user-pedro') { setUser(profile); return; } } } catch { /* Preserve corrupt data for recovery. */ }
      const profile = createDefaultProfile('demo-user-pedro', '', 'Meu perfil local');
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile)); setUser(profile);
    };
    const applySession = (sessionUser: { id: string; email?: string } | undefined) => {
      if (!active) return;
      setCloudUserId(sessionUser?.id);
      if (sessionUser) {
        let profile = createDefaultProfile(sessionUser.id, sessionUser.email || '', sessionUser.email?.split('@')[0] || 'Meu perfil');
        try { const saved = localStorage.getItem(`lifeos_profile_${sessionUser.id}`); if (saved) profile = { ...profile, ...JSON.parse(saved), id: sessionUser.id }; } catch { /* Keep default. */ }
        setUser(profile);
      } else restoreLocal();
      setIsLoading(false);
    };
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => applySession(data.session?.user)).catch(() => applySession(undefined));
      const { data } = supabase.auth.onAuthStateChange((_event, session) => applySession(session?.user));
      return () => { active = false; data.subscription.unsubscribe(); };
    }
    applySession(undefined);
    return () => { active = false; };
  }, []);

  useEffect(()=>{
    if(!cloudUserId)return;
    const stop=startCloudSync(cloudUserId);
    const refresh=()=>{const profile=getAllItems<UserProfile>('profile',cloudUserId).find(p=>p.id===cloudUserId);if(profile)setUser(prev=>{if(prev?.id!==cloudUserId)return prev;const next={...profile,id:cloudUserId,email:prev.email};return JSON.stringify(next)===JSON.stringify(prev)?prev:next;});};
    const unsubscribe=subscribeToData(refresh);refresh();return()=>{unsubscribe();stop();};
  },[cloudUserId]);

  // Apply theme when user changes
  useEffect(() => {
    const theme = user?.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, [user?.theme]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) return { success: false, error: 'Configure Supabase para autenticar. O perfil local não usa senha.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { success: !error, error: error?.message };
  }, []);
  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!supabase) return { success: false, error: 'Configure Supabase para criar uma conta.' };
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
    return { success: !error, error: error?.message };
  }, []);

  const logout = useCallback(() => {
    setCloudUserId(undefined);
    void supabase?.auth.signOut();
    const local = createDefaultProfile('demo-user-pedro', '', 'Meu perfil local');
    setUser(local);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(local));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if(!user)return;
    const updated={...user,...updates,id:user.id,email:user.email,updated_at:new Date().toISOString()};
    if(!updateItem<UserProfile>('profile',user.id,user.id,updated))createItem<UserProfile>('profile',user.id,updated);
    localStorage.setItem(AUTH_STORAGE_KEY,JSON.stringify(updated));
    localStorage.setItem(`lifeos_profile_${user.id}`,JSON.stringify(updated));
    setUser(updated);
  },[user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isCloudAuthenticated: !!cloudUserId,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function createDefaultProfile(id: string, email: string, displayName: string): UserProfile {
  const now = new Date().toISOString();
  return {
    id,
    email,
    display_name: displayName,
    timezone: APP_CONFIG.defaultTimezone,
    date_format: APP_CONFIG.dateFormat,
    first_day_of_week: APP_CONFIG.defaultFirstDayOfWeek,
    day_start_hour: APP_CONFIG.defaultDayStartHour,
    day_end_hour: APP_CONFIG.defaultDayEndHour,
    theme: 'light' as Theme,
    notification_enabled: true,
    created_at: now,
    updated_at: now,
  };
}
