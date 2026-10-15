import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, AdminUser } from '../types';
import { INITIAL_PATIENTS, INITIAL_ADMINS } from '../data/mockData';

export type AppView = 
  | 'portal-select'
  | 'patient-login'
  | 'admin-login'
  | 'patient-dashboard'
  | 'admin-dashboard'
  | 'architecture';

interface AuthContextType {
  activePatient: Patient | null;
  activeAdmin: AdminUser | null;
  currentView: AppView;
  highContrast: boolean;
  soundEnabled: boolean;
  pipCameraActive: boolean;
  loginAsPatient: (patient: Patient) => void;
  loginAsAdmin: (admin: AdminUser) => void;
  logoutPatient: () => void;
  logoutAdmin: () => void;
  switchActiveAdmin: (admin: AdminUser) => void;
  switchActivePatient: (patient: Patient) => void;
  setCurrentView: (view: AppView) => void;
  toggleHighContrast: () => void;
  toggleSound: () => void;
  togglePipCamera: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(() => {
    try {
      const saved = localStorage.getItem('neurolife_active_patient_v2');
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS[0];
    } catch {
      return INITIAL_PATIENTS[0];
    }
  });

  const [activeAdmin, setActiveAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('neurolife_active_admin_v2');
      return saved ? JSON.parse(saved) : INITIAL_ADMINS[0];
    } catch {
      return INITIAL_ADMINS[0];
    }
  });

  const [currentView, setCurrentView] = useState<AppView>('portal-select');
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neurolife_high_contrast') === 'true';
    } catch {
      return false;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pipCameraActive, setPipCameraActive] = useState<boolean>(false);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
    try {
      localStorage.setItem('neurolife_high_contrast', String(highContrast));
    } catch {
      // Ignore
    }
  }, [highContrast]);

  const loginAsPatient = (patient: Patient) => {
    setActivePatient(patient);
    try {
      localStorage.setItem('neurolife_active_patient_v2', JSON.stringify(patient));
    } catch {
      // Ignore
    }
    setCurrentView('patient-dashboard');
  };

  const loginAsAdmin = (admin: AdminUser) => {
    setActiveAdmin(admin);
    try {
      localStorage.setItem('neurolife_active_admin_v2', JSON.stringify(admin));
    } catch {
      // Ignore
    }
    setCurrentView('admin-dashboard');
  };

  const logoutPatient = () => {
    setActivePatient(null);
    try {
      localStorage.removeItem('neurolife_active_patient_v2');
    } catch {
      // Ignore
    }
    setCurrentView('patient-login');
  };

  const logoutAdmin = () => {
    setActiveAdmin(null);
    try {
      localStorage.removeItem('neurolife_active_admin_v2');
    } catch {
      // Ignore
    }
    setCurrentView('admin-login');
  };

  const switchActiveAdmin = (admin: AdminUser) => {
    setActiveAdmin(admin);
    try {
      localStorage.setItem('neurolife_active_admin_v2', JSON.stringify(admin));
    } catch {
      // Ignore
    }
  };

  const switchActivePatient = (patient: Patient) => {
    setActivePatient(patient);
    try {
      localStorage.setItem('neurolife_active_patient_v2', JSON.stringify(patient));
    } catch {
      // Ignore
    }
  };

  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleSound = () => setSoundEnabled((prev) => !prev);
  const togglePipCamera = () => setPipCameraActive((prev) => !prev);

  return (
    <AuthContext.Provider
      value={{
        activePatient,
        activeAdmin,
        currentView,
        highContrast,
        soundEnabled,
        pipCameraActive,
        loginAsPatient,
        loginAsAdmin,
        logoutPatient,
        logoutAdmin,
        switchActiveAdmin,
        switchActivePatient,
        setCurrentView,
        toggleHighContrast,
        toggleSound,
        togglePipCamera,
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
