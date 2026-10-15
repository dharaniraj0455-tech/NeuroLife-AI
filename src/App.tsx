import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PortalSelection } from './components/PortalSelection';
import { PatientLoginPage } from './components/auth/PatientLoginPage';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ArchitectureView } from './components/ArchitectureView';
import { FloatingCameraPip } from './components/common/FloatingCameraPip';
import { ShieldCheck, HeartPulse, Activity } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'portal-select' && <PortalSelection />}
        {currentView === 'patient-login' && <PatientLoginPage />}
        {currentView === 'admin-login' && <AdminLoginPage />}
        {currentView === 'patient-dashboard' && <PatientDashboard />}
        {currentView === 'admin-dashboard' && <AdminDashboard />}
        {currentView === 'architecture' && <ArchitectureView />}
      </main>

      {/* Persistent Floating Camera PIP Overlay */}
      <FloatingCameraPip />

      {/* Clinical Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">NeuroLife AI Tele-Neurology</span>
            <span className="text-slate-600">|</span>
            <span>Stroke Rehabilitation & Ocular EAR Telemetry Pipeline</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              HIPAA & FHIR Standard
            </span>
            <span>•</span>
            <button
              onClick={() => setCurrentView('architecture')}
              className="hover:text-cyan-400 transition-colors"
            >
              System Architecture
            </button>
            <span>•</span>
            <span className="text-rose-400 font-mono">Emergency Code Stroke: 911</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
