import React from 'react';
import {
  User,
  Shield,
  Eye,
  HeartPulse,
  Activity,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Stethoscope,
  Video,
  FileText,
  Clock,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_PATIENTS, INITIAL_ADMINS } from '../data/mockData';

export const PortalSelection: React.FC = () => {
  const { setCurrentView, loginAsPatient, loginAsAdmin } = useAuth();

  return (
    <div className="py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>NeuroLife AI Healthcare Suite • Clinical Version 2.4</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Stroke Rehabilitation &{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Continuous Emergency Monitoring
          </span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Integrated tele-neurology platform uniting patient-side Eye Aspect Ratio (EAR) blink emergency detection with physician-led ICU command consoles.
        </p>
      </div>

      {/* Main Choice Cards: Patient vs Admin */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Patient Portal Card */}
        <div className="relative group bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 hover:border-cyan-500/60 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between">
          <div className="absolute -top-3 right-6 bg-cyan-500 text-slate-950 font-extrabold text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
            Patient & Caregiver
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-105 transition-transform">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Patient Portal
                </h2>
                <p className="text-xs text-slate-400">
                  Bedside Rehabilitation, Blink Distress & Daily Care
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Designed specifically for recovering stroke patients with large accessibility controls, automated eye-blink emergency signaling, and guided neuro-rehabilitation drills.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Real-Time EAR Eye-Blink Monitor:</strong> 3x rapid blinks trigger instant clinician distress alert.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Daily Stroke Hydration:</strong> Mandatory chin-tuck swallowing alerts to prevent aspiration pneumonia.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>Evidence-Based Mirror Therapy:</strong> Bilateral motor drills & facial symmetry retraining.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Voice SOS Listener:</strong> Hands-free acoustic detection for "Emergency" or "Help".
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-3">
            <button
              onClick={() => setCurrentView('patient-login')}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Patient Sign In / Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => loginAsPatient(INITIAL_PATIENTS[0])}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>1-Click Demo Patient: Eleanor Vance (Room 402B)</span>
            </button>
          </div>
        </div>

        {/* Clinician & Admin Card */}
        <div className="relative group bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 hover:border-indigo-500/60 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between">
          <div className="absolute -top-3 right-6 bg-indigo-500 text-white font-extrabold text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
            Clinicians & Admins
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-105 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Admin Command Center
                </h2>
                <p className="text-xs text-slate-400">
                  Neurology Telemetry, Emergency Queue & Room Surveillance
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Designed for Vascular Neurologists, ICU Charge Nurses, and Telemetry Administrators to dispatch emergencies, oversee room cameras, and review AI stroke literature.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Live Emergency Queue:</strong> Instant audible alerts for eye-blink distress and fall anomalies.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  <strong>CCTV Room Telemetry:</strong> Multi-camera surveillance feeds across inpatient South Wing & ICU.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong>AI Clinical Document Analyzer:</strong> Summarizes CT scans, discharge notes & aspiration precautions.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>PubMed Stroke Evidence:</strong> Live and curated clinical trials for thrombectomy and mirror recovery.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-3">
            <button
              onClick={() => setCurrentView('admin-login')}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              <span>Clinician & Admin Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => loginAsAdmin(INITIAL_ADMINS[0])}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>1-Click Demo Admin: Dr. Sophia Martinez, MD (Chief Neurologist)</span>
            </button>
          </div>
        </div>
      </div>

      {/* FAST Warning Signs Educational Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-lg">
              FAST
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Recognize Sudden Stroke Recurrence Signs
              </h3>
              <p className="text-xs text-slate-300">
                Every minute saves 1.9 million brain neurons during acute stroke.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Emergency Hotline: 911 / Code Stroke
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-rose-400 font-extrabold text-sm block">F — Face</span>
            <p className="text-slate-400 mt-1">Ask the patient to smile. Does one side of the face droop?</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-rose-400 font-extrabold text-sm block">A — Arms</span>
            <p className="text-slate-400 mt-1">Ask them to raise both arms. Does one arm drift downward?</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-rose-400 font-extrabold text-sm block">S — Speech</span>
            <p className="text-slate-400 mt-1">Is their speech slurred, strange, or unable to repeat simple phrases?</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-rose-400 font-extrabold text-sm block">T — Time</span>
            <p className="text-slate-400 mt-1">Immediately trigger NeuroLife EAR Distress SOS or dial emergency.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
