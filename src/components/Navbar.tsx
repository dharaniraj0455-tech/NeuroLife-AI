import React from 'react';
import {
  Activity,
  ShieldAlert,
  User,
  Shield,
  Layers,
  Volume2,
  VolumeX,
  Sun,
  Camera,
  LogOut,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export const Navbar: React.FC = () => {
  const {
    activePatient,
    activeAdmin,
    currentView,
    highContrast,
    soundEnabled,
    pipCameraActive,
    setCurrentView,
    logoutPatient,
    logoutAdmin,
    toggleHighContrast,
    toggleSound,
    togglePipCamera,
  } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('portal-select')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                    NeuroLife AI
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Live EAR Telemetry
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Stroke Rehab & Critical Care Emergency Dispatch
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentView('portal-select')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'portal-select'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Portal Home
            </button>

            {/* Patient Portal Link */}
            <button
              onClick={() => {
                if (activePatient) {
                  setCurrentView('patient-dashboard');
                } else {
                  setCurrentView('patient-login');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'patient-dashboard' || currentView === 'patient-login'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Patient Portal</span>
              {activePatient && (
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              )}
            </button>

            {/* Admin Command Center Link */}
            <button
              onClick={() => {
                if (activeAdmin) {
                  setCurrentView('admin-dashboard');
                } else {
                  setCurrentView('admin-login');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'admin-dashboard' || currentView === 'admin-login'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Console</span>
              {activeAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            {/* Architecture / Evidence */}
            <button
              onClick={() => setCurrentView('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'architecture'
                  ? 'bg-slate-800 text-purple-300 border border-purple-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Clinical Architecture</span>
            </button>
          </nav>

          {/* User Status, Emergency Route Pill & Controls */}
          <div className="flex items-center gap-2">
            {/* Active Duty Routing Indicator */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-[11px]">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="text-slate-400">Routed Admin:</span>
              <span className="font-mono font-bold text-cyan-300">
                {activeAdmin?.id || 'ADM-8801'}
              </span>
            </div>

            {/* Active User session info */}
            {currentView.startsWith('patient') && activePatient && (
              <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/50 px-2 py-1 rounded-lg text-xs">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <span className="font-semibold text-cyan-200 hidden sm:inline">
                  {activePatient.name}
                </span>
                <button
                  onClick={logoutPatient}
                  title="Log out of Patient Portal"
                  className="p-1 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 rounded transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {currentView.startsWith('admin') && activeAdmin && (
              <div className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-800/50 px-2 py-1 rounded-lg text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-semibold text-indigo-200 hidden sm:inline">
                  {activeAdmin.name.split(',')[0]}
                </span>
                <button
                  onClick={logoutAdmin}
                  title="Log out of Admin Portal"
                  className="p-1 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 rounded transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Floating PIP Camera Button */}
            <button
              onClick={togglePipCamera}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                pipCameraActive
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title="Toggle Floating Camera / EAR PIP monitor"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden xl:inline text-[11px]">
                {pipCameraActive ? 'PIP On' : 'PIP'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                soundEnabled
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800'
              }`}
              title={soundEnabled ? 'Mute Audio Alerts' : 'Unmute Audio Alerts'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-400" />
              )}
            </button>

            {/* High Contrast Accessibility Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`p-2 rounded-lg border text-xs transition-all ${
                highContrast
                  ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="WCAG AAA High Contrast Theme Toggle"
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
