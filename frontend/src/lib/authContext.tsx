import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, AdminUser, UserRole } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from './api';

interface AuthContextType {
  user: User | null;
  studentUser: User | null;
  adminUser: AdminUser | null;
  role: UserRole | string;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  loginStudent: (email?: string, password?: string) => Promise<boolean>;
  loginAdmin: (email?: string, password?: string) => Promise<boolean>;
  loginAsStudent: (email?: string, password?: string) => Promise<boolean>;
  loginAsAdmin: (email?: string, password?: string) => Promise<boolean>;
  registerStudent: (details: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = getAuthToken();
    if (!token) return null;
    const saved = localStorage.getItem('sahayak_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const token = getAuthToken();
    if (!token) return null;
    const saved = localStorage.getItem('sahayak_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const role = user?.role || (adminUser ? 'admin' : 'student');
  const isAuthenticated = !!user;
  const isAdminAuthenticated = !!adminUser || (user?.role === 'admin' || user?.role === 'proctor');

  // Load latest live user profile from database on startup
  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const liveUser = await api.auth.me();
      if (liveUser) {
        setUser(liveUser);
        localStorage.setItem('sahayak_auth_user', JSON.stringify(liveUser));
        if (liveUser.role === 'admin' || liveUser.role === 'proctor') {
          setAdminUser(liveUser);
          localStorage.setItem('sahayak_admin_user', JSON.stringify(liveUser));
        }
      }
    } catch (err: any) {
      console.warn('Session expired or server unreachable:', err?.message);
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        logout();
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sahayak_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sahayak_auth_user');
    }
  }, [user]);

  const loginStudent = async (email?: string, password?: string) => {
    const loginEmail = (email || '').trim();
    const loginPassword = password || '';

    if (!loginEmail || !loginPassword) {
      throw new Error('Please enter both your NIE institutional email and password.');
    }

    try {
      const res = await api.auth.login({ email: loginEmail, password: loginPassword });
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setUser(res.user);
        return true;
      }
      throw new Error('Invalid login response from server.');
    } catch (err: any) {
      console.warn('API login failed:', err);
      const msg = err.message || '';
      if (msg.includes('401') || msg.includes('Invalid') || msg.includes('Incorrect') || msg.includes('not found')) {
        throw new Error('Invalid NIE email or password. Please verify your credentials or register an account.');
      }
      throw new Error(err.message || 'Unable to connect to SAHAYAK database. Please ensure backend is running.');
    }
  };

  const loginAdmin = async (email?: string, password?: string) => {
    const loginEmail = (email || '').trim();
    const loginPassword = password || '';

    if (!loginEmail || !loginPassword) {
      throw new Error('Please enter official administrative credentials.');
    }

    try {
      const res = await api.auth.adminLogin({ email: loginEmail, password: loginPassword });
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setUser(res.user);
        setAdminUser(res.user);
        return true;
      }
      throw new Error('Invalid admin login response from server.');
    } catch (err: any) {
      console.warn('Admin API login failed:', err);
      const msg = err.message || '';
      if (msg.includes('401') || msg.includes('403') || msg.includes('Invalid') || msg.includes('Unauthorized')) {
        throw new Error('Invalid administrator credentials or access denied.');
      }
      throw new Error(err.message || 'Unable to connect to SAHAYAK database.');
    }
  };

  const loginAsStudent = loginStudent;
  const loginAsAdmin = loginAdmin;

  const registerStudent = async (details: any) => {
    try {
      const payload = {
        email: details.email,
        password: details.password || 'Student@123',
        full_name: details.fullName || details.name,
        usn: details.usn,
        phone: details.phone,
        branch: details.department || details.branch || 'Computer Science & Engineering',
        semester: Number(details.semester) || 5,
        section: details.section || 'A'
      };

      const res = await api.auth.register(payload);
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setUser(res.user);
        return true;
      }
      throw new Error('Registration failed. Please check your details.');
    } catch (err: any) {
      console.warn('Registration API failed:', err);
      throw new Error(err.message || 'Registration failed. Institutional email or USN might already exist.');
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setAdminUser(null);
    localStorage.removeItem('sahayak_auth_user');
    localStorage.removeItem('sahayak_admin_user');
  };

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    if (!user) return false;

    const mergedUser = { ...user, ...updates } as User;
    setUser(mergedUser);
    localStorage.setItem('sahayak_auth_user', JSON.stringify(mergedUser));

    try {
      const updated = await api.users.updateProfile({
        full_name: updates.fullName || updates.name,
        phone: updates.phone,
        branch: updates.department || updates.branch,
        semester: updates.semester ? Number(updates.semester) : undefined,
        section: updates.section,
        emergency_contact: updates.emergencyContact,
        privacy_shield_active: updates.privacyShieldActive
      });
      if (updated) {
        setUser(updated);
        localStorage.setItem('sahayak_auth_user', JSON.stringify(updated));
      }
      return true;
    } catch (err: any) {
      console.warn('Failed to sync profile update to backend:', err);
      throw new Error(err.message || 'Failed to save changes to database.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentUser: user,
        adminUser,
        role,
        isAuthenticated,
        isAdminAuthenticated,
        loginStudent,
        loginAdmin,
        loginAsStudent,
        loginAsAdmin,
        registerStudent,
        logout,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
