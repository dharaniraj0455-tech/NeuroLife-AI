import React, { useState } from 'react';
import {
  User,
  Eye,
  KeyRound,
  ShieldCheck,
  Volume2,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { INITIAL_PATIENTS } from '../../data/mockData';
import { Patient } from '../../types';

export const PatientLoginPage: React.FC = () => {
  const { loginAsPatient, setCurrentView } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign in state
  const [patientIdOrMrn, setPatientIdOrMrn] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [blinkAuthStatus, setBlinkAuthStatus] = useState<string | null>(null);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState(64);
  const [regGender, setRegGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [regRoom, setRegRoom] = useState('Room 402B - South Wing');
  const [regStrokeType, setRegStrokeType] = useState<'Ischemic' | 'Hemorrhagic' | 'TIA'>('Ischemic');
  const [regCaregiverName, setRegCaregiverName] = useState('');
  const [regCaregiverPhone, setRegCaregiverPhone] = useState('');
  const [regDoctor, setRegDoctor] = useState('Dr. Sophia Martinez, MD');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdOrMrn.trim()) {
      setErrorMsg('Please enter your Medical Record Number (MRN) or Patient ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await apiService.patientLogin({
        patientIdOrMrn: patientIdOrMrn.trim(),
        pinOrPassword: pin,
      });
      loginAsPatient(result.patient);
    } catch {
      // Fallback
      loginAsPatient(INITIAL_PATIENTS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMsg('Please enter the patient full legal name.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const newPatient = await apiService.registerPatient({
        name: regName.trim(),
        age: Number(regAge),
        gender: regGender,
        room: regRoom,
        strokeType: regStrokeType,
        primaryNeurologist: regDoctor,
        emergencyContact: {
          name: regCaregiverName.trim() || 'Designated Family Proxy',
          relation: 'Caregiver',
          phone: regCaregiverPhone.trim() || '+1 (555) 012-3456',
        },
      });
      loginAsPatient(newPatient);
    } catch {
      loginAsPatient(INITIAL_PATIENTS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const readAudioInstructions = () => {
    apiService.speakText(
      'Welcome to NeuroLife AI Patient Portal. Please enter your patient ID number or tap any of the demo patient profiles below to immediately access your rehabilitation drills and eye-blink emergency detector.'
    );
  };

  const simulateBlinkBiometricAuth = () => {
    setBlinkAuthStatus('Calibrating eye aspect ratio (EAR)...');
    setTimeout(() => {
      setBlinkAuthStatus('Detecting double blink cadence... [Blink 1/2]');
      setTimeout(() => {
        setBlinkAuthStatus('Biometric Eye-Blink Confirmed! Unlocking Eleanor Vance.');
        setTimeout(() => {
          loginAsPatient(INITIAL_PATIENTS[0]);
        }, 800);
      }, 900);
    }, 800);
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentView('portal-select')}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to Portal Gateway</span>
        </button>

        <button
          onClick={() => setCurrentView('admin-login')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-950/40 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Switch to Clinician & Admin Login</span>
        </button>
      </div>

      <div className="bg-slate-900/90 rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-6 sm:p-8 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-900/60 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">Patient Recovery Login</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Bedside Portal
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Access your personal stroke therapy drills, hydration tracker & EAR emergency monitoring
                </p>
              </div>
            </div>

            {/* Accessible Audio Screen-Reader Button */}
            <button
              onClick={readAudioInstructions}
              className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              title="Click to have audio instructions read aloud"
            >
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Read Aloud</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg('');
              }}
              className={`py-2 px-5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'signin'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Sign In with Patient ID
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`py-2 px-5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'register'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Register New Patient
            </button>
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

          {activeTab === 'signin' ? (
            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* Form Column */}
              <div className="md:col-span-7 space-y-5">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Medical Record Number (MRN) or Patient ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={patientIdOrMrn}
                        onChange={(e) => setPatientIdOrMrn(e.target.value)}
                        placeholder="e.g. PT-4092 or Eleanor Vance"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      />
                      <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Found on your hospital wristband or discharge folder
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Bedside 4-Digit Security PIN (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors tracking-widest font-mono"
                      />
                      <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Verifying Bedside Session...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In to Bedside Monitor</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Biometric Quick Blink Test */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>Biometric Eye-Blink Quick Login</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      AI EAR Feature
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Patients with limited limb mobility can authenticate via deliberate double-blink cadence.
                  </p>
                  {blinkAuthStatus ? (
                    <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-2 animate-pulse">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>{blinkAuthStatus}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={simulateBlinkBiometricAuth}
                      className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Simulate 2-Blink Biometric Verification</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Fast 1-Click Demo Profiles Column */}
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Instant Demo Patients
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold">1-Click Access</span>
                </div>

                {INITIAL_PATIENTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPatientIdOrMrn(p.id);
                      loginAsPatient(p);
                    }}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-white group-hover:text-cyan-300 truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold shrink-0">
                          {p.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{p.room}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {p.strokeType} Stroke
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {p.recoveryPhase.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Patient Age
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={110}
                    value={regAge}
                    onChange={(e) => setRegAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as 'Female' | 'Male' | 'Other')}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Hospital Room / Bed Unit
                  </label>
                  <input
                    type="text"
                    value={regRoom}
                    onChange={(e) => setRegRoom(e.target.value)}
                    placeholder="e.g. Room 402B - South Wing"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Stroke Classification
                  </label>
                  <select
                    value={regStrokeType}
                    onChange={(e) => setRegStrokeType(e.target.value as 'Ischemic' | 'Hemorrhagic' | 'TIA')}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="Ischemic">Ischemic Stroke (Blood clot / Thrombus)</option>
                    <option value="Hemorrhagic">Hemorrhagic Stroke (Intracranial bleeding)</option>
                    <option value="TIA">Transient Ischemic Attack (Mini-stroke)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Attending Vascular Neurologist
                  </label>
                  <input
                    type="text"
                    value={regDoctor}
                    onChange={(e) => setRegDoctor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Emergency Caregiver / Family Contact
                  </label>
                  <input
                    type="text"
                    value={regCaregiverName}
                    onChange={(e) => setRegCaregiverName(e.target.value)}
                    placeholder="e.g. Robert Vance (Son)"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Caregiver Phone Hotline
                  </label>
                  <input
                    type="tel"
                    value={regCaregiverPhone}
                    onChange={(e) => setRegCaregiverPhone(e.target.value)}
                    placeholder="+1 (555) 234-8910"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Registering Stroke Patient...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Registration & Open Bedside Monitor</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
