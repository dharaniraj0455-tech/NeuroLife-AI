import React from 'react';
import {
  Layers,
  Eye,
  Radio,
  Shield,
  Activity,
  Cpu,
  Server,
  Network,
  CheckCircle2,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ArchitectureView: React.FC = () => {
  const { setCurrentView } = useAuth();

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Clinical Tele-Neurology Architecture
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            NeuroLife AI System Architecture & EAR Telemetry Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end specification from bedside facial landmark extraction to sub-second clinician dispatch
          </p>
        </div>

        <button
          onClick={() => setCurrentView('portal-select')}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition-colors"
        >
          ← Return to Portal Selection
        </button>
      </div>

      {/* 4 Architectural Layers */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Layer 1: Edge Biometric Computer Vision */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400">LAYER 01</span>
              <h3 className="text-base font-bold text-white">Edge Computer Vision (EAR Metric)</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Tracks 68 facial landmarks locally inside the client browser. Calculates the Soukupová & Čech Eye Aspect Ratio (EAR) at 30–60 FPS without transferring raw video feeds off-device, ensuring strict HIPAA privacy.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
            <p className="text-slate-400">// Mathematical Formulation:</p>
            <p>EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)</p>
            <p className="text-slate-400 mt-1">// Emergency Cadence Condition:</p>
            <p>if (blinks_in_window(&lt;1.5s) &gt;= 3) =&gt; DISPATCH_SOS</p>
          </div>
        </div>

        {/* Layer 2: Real-Time Event Dispatch Engine */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400">LAYER 02</span>
              <h3 className="text-base font-bold text-white">Telemetry & Target Admin Routing</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Distress events from patient bedside monitors are routed to the specific attending Vascular Neurologist on shift (e.g. <span className="text-cyan-300 font-mono">ADM-8801</span>). Incidents contain vital telemetry snapshots (SpO2, heart rate, blood pressure).
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300 space-y-1">
            <p className="text-slate-400">// Dispatch Routing Payload:</p>
            <p>&#123; patientId: "PT-4092", targetAdminId: "ADM-8801",</p>
            <p>&nbsp;&nbsp;severity: "CRITICAL", type: "RAPID_BLINK_EAR",</p>
            <p>&nbsp;&nbsp;latencyMs: 182, vitals: &#123; hr: 104, spo2: 95 &#125; &#125;</p>
          </div>
        </div>

        {/* Layer 3: Daily Rehabilitation & Dysphagia Safety */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400">LAYER 03</span>
              <h3 className="text-base font-bold text-white">Neuroplasticity & Aspiration Guard</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Stroke recovery routines integrate visual mirror box therapy to stimulate mirror neurons in premotor cortex areas. The hydration engine enforces cervical chin-tuck postures to shield airways from dysphagic aspiration pneumonia.
          </p>

          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li>Mirror box bilateral upper extremity re-mapping</li>
            <li>Mandatory 90° posture & chin-tuck verification per drink log</li>
            <li>Secondary stroke prophylaxis medication checklist</li>
          </ul>
        </div>

        {/* Layer 4: AI Clinical Document & Evidence Grounding */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-purple-500/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400">LAYER 04</span>
              <h3 className="text-base font-bold text-white">AI Clinical Synthesis & PubMed Grounding</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Vascular neurologists query peer-reviewed PubMed randomized clinical trials (thrombectomy windows, mirror therapy efficacy) and run NLP clinical summaries on inpatient consult notes and CT angiogram imaging reports.
          </p>

          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li>DAWN and DEFUSE-3 late window thrombectomy protocol grounding</li>
            <li>Automated extraction of dysphagia warnings from physician notes</li>
            <li>Evidence-based stroke recurrence risk score stratification</li>
          </ul>
        </div>
      </div>

      {/* Network & High Availability Guarantee */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>Offline & Static Host Resilience Architecture (Netlify & AI Studio Safe)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The application implements a <strong>Dual-Tier Hybrid State Architecture</strong>: All network calls to <code className="text-cyan-300">/api/*</code> pass through an intelligent local fallback pipeline backed by browser IndexedDB and LocalStorage. If an API is offline or hosted on a static server like Netlify, zero crashes or unhandled promise errors occur, guaranteeing continuous clinical reliability.
        </p>
      </div>
    </div>
  );
};
