import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { UserProfile, Theme } from '../types';
import { APP_CONFIG } from '../config/app';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'lifeos_auth';
const USERS_STORAGE_KEY = 'lifeos_users';

interface StoredUser {
  id: string;
  email: string;
  password: string; // In production, this would be hashed server-side
  display_name: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setUser(parsed);
        import('../services/seedData').then(m => m.initializeSeedDataIfEmpty(parsed.id));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } else {
      // Create and set default demo profile for seamless experience
      const demoUser = createDefaultProfile('demo-user-pedro', 'pedro@exemplo.com', 'Pedro Cavalcanti');
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      import('../services/seedData').then(m => m.initializeSeedDataIfEmpty(demoUser.id));
    }
    setIsLoading(false);
  }, []);

  // Apply theme when user changes
  useEffect(() => {
    const theme = user?.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, [user?.theme]);

  const getUsers = (): StoredUser[] => {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = useCallback(async (email: string, password: string) => {
    // Simulate async
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    const found = users.find(u => u.email === email.toLowerCase() && u.password === password);
    
    if (!found) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    const profileKey = `lifeos_profile_${found.id}`;
    let profile: UserProfile;
    
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      profile = JSON.parse(savedProfile);
    } else {
      profile = createDefaultProfile(found.id, found.email, found.display_name);
      localStorage.setItem(profileKey, JSON.stringify(profile));
    }

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    const exists = users.find(u => u.email === email.toLowerCase());
    
    if (exists) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    const newUser: StoredUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password,
      display_name: name,
    };

    users.push(newUser);
    saveUsers(users);

    const profile = createDefaultProfile(newUser.id, newUser.email, newUser.display_name);
    localStorage.setItem(`lifeos_profile_${newUser.id}`, JSON.stringify(profile));
    
    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(`lifeos_profile_${prev.id}`, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
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
