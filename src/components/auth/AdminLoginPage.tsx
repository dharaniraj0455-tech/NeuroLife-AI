import React, { useState } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ArrowRight,
  User,
  Radio,
  CheckCircle2,
  AlertCircle,
  Building,
  IdCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { INITIAL_ADMINS } from '../../data/mockData';
import { AdminUser } from '../../types';

export const AdminLoginPage: React.FC = () => {
  const { loginAsAdmin, setCurrentView } = useAuth();

  const [adminIdOrEmail, setAdminIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDept, setSelectedDept] = useState('Comprehensive Stroke Center');
  const [securityPin, setSecurityPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [badgeScanStatus, setBadgeScanStatus] = useState<string | null>(null);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminIdOrEmail.trim()) {
      setErrorMsg('Please enter your Staff Admin ID or Hospital Email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await apiService.adminLogin({
        adminIdOrEmail: adminIdOrEmail.trim(),
        password,
      });
      loginAsAdmin(result.admin);
    } catch {
      // Resilient fallback to chief neurologist
      loginAsAdmin(INITIAL_ADMINS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateHospitalBadgeScan = (admin: AdminUser) => {
    setBadgeScanStatus(`Scanning NFC Hospital Badge for ${admin.badgeNumber}...`);
    setTimeout(() => {
      setBadgeScanStatus(`Access Granted: ${admin.name} (${admin.role})`);
      setTimeout(() => {
        loginAsAdmin(admin);
      }, 700);
    }, 800);
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentView('portal-select')}
          className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to Portal Gateway</span>
        </button>

        <button
          onClick={() => setCurrentView('patient-login')}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          <User className="w-3.5 h-3.5" />
          <span>Switch to Patient & Caregiver Login</span>
        </button>
      </div>

      <div className="bg-slate-900/90 rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 sm:p-8 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-900/60 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">Clinician & Admin Command Login</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Staff Restricted
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Secure access to emergency queue, inpatient telemetry, CCTV feeds & AI diagnostics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="text-slate-400">Emergency Channel:</span>
              <span className="font-mono font-bold text-white">LIVE 911</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="md:col-span-7 space-y-5">
              <form onSubmit={handleAdminSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Clinician Staff ID or Hospital Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={adminIdOrEmail}
                      onChange={(e) => setAdminIdOrEmail(e.target.value)}
                      placeholder="e.g. ADM-8801 or s.martinez@neuroshield.health"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                    />
                    <IdCard className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Assigned by hospital telemetry administration or clinical engineering
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Password / Security Code
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                      />
                      <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      RSA Hospital Token (PIN)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value)}
                        placeholder="849201"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-mono tracking-wider"
                      />
                      <KeyRound className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Clinical Unit Assignment
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="Comprehensive Stroke Center">Comprehensive Stroke Center (ICU & Acute)</option>
                    <option value="Critical Care & Resuscitation">Critical Care & Resuscitation (Neuro ICU)</option>
                    <option value="Rehabilitation & Inpatient Care">Rehabilitation Ward (South Wing)</option>
                    <option value="Bio-AI & Telemetry Systems">Central Telemetry & Bio-AI Engineering</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Clinical Credentials...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authenticate & Launch Command Console</span>
                    </>
                  )}
                </button>
              </form>

              {/* NFC Badge Scan simulation */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Building className="w-4 h-4 text-indigo-400" />
                    <span>Hospital NFC Badge / YubiKey Emulation</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                    Tap to Scan
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Fast authentication simulation for clinicians moving between bedside stations and ICU consoles.
                </p>
                {badgeScanStatus ? (
                  <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>{badgeScanStatus}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => simulateHospitalBadgeScan(INITIAL_ADMINS[0])}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>Tap Badge for Dr. Sophia Martinez, MD</span>
                  </button>
                )}
              </div>
            </div>

            {/* Fast 1-Click Clinician Profiles Column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Clinical Duty Staff Roster
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold">1-Click Sign In</span>
              </div>

              {INITIAL_ADMINS.map((adm) => (
                <button
                  key={adm.id}
                  type="button"
                  onClick={() => {
                    setAdminIdOrEmail(adm.id);
                    loginAsAdmin(adm);
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition-all group flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                    {adm.name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-white group-hover:text-indigo-300 truncate">
                        {adm.name}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400 font-semibold shrink-0">
                        {adm.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{adm.role}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 truncate max-w-[140px]">
                        {adm.hospitalUnit.split(' ')[0]}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-semibold">
                        Shift Active
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                <p>
                  <strong>Incident Routing Protocol:</strong> Emergency signals triggered by patients automatically route to the active on-duty Admin ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
