import React, { useState } from 'react';
import { Eye, AlertTriangle, X, Minimize2, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { playEmergencySiren, playBlinkClick } from '../../services/soundEffects';

export const FloatingCameraPip: React.FC = () => {
  const { pipCameraActive, togglePipCamera, activePatient, activeAdmin, soundEnabled } = useAuth();
  const [ear, setEar] = useState(0.28);
  const [isBlinking, setIsBlinking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!pipCameraActive) return null;

  const handleQuickSos = async () => {
    if (soundEnabled) playEmergencySiren();
    const inc = await apiService.dispatchIncident({
      patientId: activePatient?.id || 'PT-4092',
      patientName: activePatient?.name || 'Eleanor Vance',
      type: 'MANUAL_SOS',
      severity: 'CRITICAL',
      location: activePatient?.room || 'Room 402B - South Wing',
      targetAdminId: activeAdmin?.id || 'ADM-8801',
      details: 'Manual SOS triggered from Minimized Camera PIP overlay.',
    });
    setStatusMsg(`Dispatched to Admin ${activeAdmin?.id || 'ADM-8801'}`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const simulatePipBlink = () => {
    if (soundEnabled) playBlinkClick();
    setIsBlinking(true);
    setEar(0.14);
    setTimeout(() => {
      setIsBlinking(false);
      setEar(0.28);
    }, 250);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-cyan-500/50 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">EAR PIP Monitor</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <button
          onClick={togglePipCamera}
          className="text-slate-400 hover:text-white p-0.5 rounded"
          title="Close PIP overlay"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mini Video / Telemetry Canvas */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="w-12 h-8 rounded-full border border-cyan-400 bg-slate-900 flex items-center justify-center">
            <div
              className={`w-5 h-5 rounded-full bg-cyan-400 transition-all ${
                isBlinking ? 'scale-y-[0.1] bg-rose-500' : 'scale-y-100'
              }`}
            ></div>
          </div>
          <div className="w-12 h-8 rounded-full border border-cyan-400 bg-slate-900 flex items-center justify-center">
            <div
              className={`w-5 h-5 rounded-full bg-cyan-400 transition-all ${
                isBlinking ? 'scale-y-[0.1] bg-rose-500' : 'scale-y-100'
              }`}
            ></div>
          </div>
        </div>

        <div className="absolute top-1.5 left-2 text-[10px] font-mono text-cyan-300 bg-black/60 px-1.5 py-0.5 rounded">
          EAR: {ear.toFixed(2)}
        </div>
        <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
          Routed: {activeAdmin?.id || 'ADM-8801'}
        </div>
      </div>

      {statusMsg && (
        <div className="bg-rose-950/90 text-rose-200 text-[11px] font-bold px-3 py-1 text-center border-b border-rose-800">
          {statusMsg}
        </div>
      )}

      {/* Action buttons */}
      <div className="p-2.5 bg-slate-900 grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={simulatePipBlink}
          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700"
        >
          Simulate Blink
        </button>
        <button
          onClick={handleQuickSos}
          className="py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow"
        >
          Quick SOS
        </button>
      </div>
    </div>
  );
};
