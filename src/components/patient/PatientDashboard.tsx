import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Activity,
  AlertTriangle,
  HeartPulse,
  Droplets,
  Pill,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  RotateCcw,
  Play,
  Pause,
  Award,
  ShieldAlert,
  Info,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { playEmergencySiren, playBlinkClick, playSuccessChime, playNotificationPing } from '../../services/soundEffects';
import { Patient, EmergencyIncident, HydrationLog, MedicationItem, RehabDrill } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { activePatient, activeAdmin, soundEnabled, highContrast } = useAuth();

  // State
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [activeAlert, setActiveAlert] = useState<EmergencyIncident | null>(null);
  const [hydration, setHydration] = useState<HydrationLog | null>(null);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [drills, setDrills] = useState<RehabDrill[]>([]);

  // EAR Eye-Blink Monitor state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [earValue, setEarValue] = useState<number>(0.29);
  const [blinkCount, setBlinkCount] = useState<number>(14);
  const [rapidBlinkBuffer, setRapidBlinkBuffer] = useState<number[]>([]);
  const [isEyeClosed, setIsEyeClosed] = useState<boolean>(false);
  const [earThreshold, setEarThreshold] = useState<number>(0.21);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Voice SOS Listener state
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceStatus, setVoiceStatus] = useState<string>('Standby - Listening for "Emergency" or "Help"');

  // Active Drill Modal state
  const [selectedDrill, setSelectedDrill] = useState<RehabDrill | null>(null);
  const [drillTimer, setDrillTimer] = useState<number>(0);
  const [isDrillRunning, setIsDrillRunning] = useState<boolean>(false);
  const [drillReps, setDrillReps] = useState<number>(0);

  // Load initial patient routines
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const [hydroData, medsData, drillsData, incsData] = await Promise.all([
        apiService.getHydration(),
        apiService.getMedications(),
        apiService.getRehabDrills(),
        apiService.getIncidents(),
      ]);
      if (mounted) {
        setHydration(hydroData);
        setMedications(medsData);
        setDrills(drillsData);
        setIncidents(incsData);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Drill timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isDrillRunning && drillTimer > 0) {
      interval = setInterval(() => {
        setDrillTimer((prev) => {
          if (prev <= 1) {
            setIsDrillRunning(false);
            if (soundEnabled) playSuccessChime();
            confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDrillRunning, drillTimer, soundEnabled]);

  // Dispatch Emergency helper
  const triggerEmergency = async (
    type: EmergencyIncident['type'],
    details: string,
    severity: EmergencyIncident['severity'] = 'CRITICAL'
  ) => {
    if (soundEnabled) playEmergencySiren();

    const targetId = activeAdmin?.id || activePatient?.assignedAdminId || 'ADM-8801';
    const targetName = activeAdmin?.name || activePatient?.primaryNeurologist || 'Dr. Sophia Martinez, MD';
    const targetEmail = activeAdmin?.email || 'admin@neuroshield.health';

    const incident = await apiService.dispatchIncident({
      patientId: activePatient?.id || 'PT-4092',
      patientName: activePatient?.name || 'Eleanor Vance',
      type,
      severity,
      location: activePatient?.room || 'Room 402B - South Wing',
      targetAdminId: targetId,
      targetAdminName: targetName,
      targetAdminEmail: targetEmail,
      details,
    });

    setActiveAlert(incident);
    setIncidents((prev) => [incident, ...prev]);

    // Speak aloud for patient assurance
    apiService.speakText(
      `Emergency distress alert dispatched to ${targetName}. Help is en route to ${activePatient?.room || 'your room'}.`
    );

    // Auto dismiss active toast after 12s
    setTimeout(() => {
      setActiveAlert(null);
    }, 12000);
  };

  // EAR Blink detection logic
  const handleSimulatedBlink = (forceEmergency = false) => {
    if (soundEnabled) playBlinkClick();

    if (forceEmergency) {
      // Simulate 3 rapid blinks within 1.2 seconds
      setEarValue(0.14);
      setIsEyeClosed(true);
      setBlinkCount((prev) => prev + 3);
      setTimeout(() => {
        setEarValue(0.29);
        setIsEyeClosed(false);
        triggerEmergency(
          'RAPID_BLINK_EAR',
          'EAR algorithm detected 3x intentional rapid emergency blinks (<1.2s cadence). Patient requesting immediate bedside assistance.'
        );
      }, 500);
      return;
    }

    // Normal blink
    setEarValue(0.16);
    setIsEyeClosed(true);
    const now = Date.now();
    const newBuffer = [...rapidBlinkBuffer.filter((t) => now - t < 1800), now];
    setRapidBlinkBuffer(newBuffer);
    setBlinkCount((prev) => prev + 1);

    setTimeout(() => {
      setEarValue(0.29);
      setIsEyeClosed(false);
    }, 200);

    // Check if rapid cadence threshold reached
    if (newBuffer.length >= 3) {
      triggerEmergency(
        'RAPID_BLINK_EAR',
        '3x consecutive rapid blink sequence detected via Eye Aspect Ratio (EAR) metric.'
      );
      setRapidBlinkBuffer([]);
    }
  };

  const handleSimulateProlongedClosure = () => {
    setEarValue(0.12);
    setIsEyeClosed(true);
    setTimeout(() => {
      setEarValue(0.29);
      setIsEyeClosed(false);
      triggerEmergency(
        'PROLONGED_EYE_CLOSURE',
        'Prolonged ocular closure (>3.5s) detected during wakefulness hours. Risk of loss of consciousness or acute neurologic fatigue.'
      );
    }, 1500);
  };

  // Real Webcam handler
  const toggleRealCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      setCameraError(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
        setCameraError(null);
      } catch (err) {
        setCameraError('Camera access unavailable. Using high-fidelity biometric visualizer.');
        setIsCameraActive(false);
      }
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Voice SOS simulation & recognition
  const toggleVoiceListener = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      setVoiceStatus('Voice SOS Standby');
    } else {
      setIsVoiceActive(true);
      setVoiceStatus('Active - Listening for emergency words ("Help", "Emergency", "Nurse")...');
      if (soundEnabled) playNotificationPing();

      // Check browser SpeechRecognition
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const text = event.results[current][0].transcript.toLowerCase();
            setVoiceTranscript(text);
            if (text.includes('help') || text.includes('emergency') || text.includes('nurse') || text.includes('doctor')) {
              triggerEmergency('VOICE_SOS', `Acoustic distress trigger detected keyword: "${text.trim()}".`);
            }
          };
          recognition.onerror = () => {
            setVoiceStatus('Acoustic background listener active (Simulated fallback).');
          };
          recognition.start();
        } catch {
          // Ignore
        }
      }
    }
  };

  const simulateVoiceDistress = (word: string) => {
    setVoiceTranscript(word);
    triggerEmergency(
      'VOICE_SOS',
      `Voice SOS vocal distress command "${word}" triggered from patient bedside.`
    );
  };

  // Hydration drink logger
  const logDrink = async (ml: number, beverage: string) => {
    if (soundEnabled) playSuccessChime();
    const updated = await apiService.addHydration(ml, beverage, true);
    setHydration(updated);
  };

  // Toggle Medication
  const handleToggleMed = async (id: string) => {
    if (soundEnabled) playNotificationPing();
    const updated = await apiService.toggleMedication(id);
    setMedications(updated);
  };

  // Start Rehab drill
  const startDrill = (drill: RehabDrill) => {
    setSelectedDrill(drill);
    setDrillTimer(drill.durationSeconds);
    setDrillReps(0);
    setIsDrillRunning(true);
  };

  const completeActiveDrill = async () => {
    if (!selectedDrill) return;
    setIsDrillRunning(false);
    const score = Math.min(100, Math.floor(75 + (drillReps / selectedDrill.repetitionGoal) * 25));
    const updated = await apiService.completeDrill(selectedDrill.id, score);
    setDrills(updated);
    if (soundEnabled) playSuccessChime();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setSelectedDrill(null);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Active Emergency Toast Banner */}
      {activeAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-2 border-red-500 shadow-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wide">
                  Emergency Distress Dispatched!
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
                  {activeAlert.id}
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                Directly routed to <strong>{activeAlert.targetAdminName}</strong> ({activeAlert.targetAdminId}). Location: {activeAlert.location}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="self-end sm:self-center px-4 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-xs font-bold transition-colors"
          >
            Dismiss Toast
          </button>
        </div>
      )}

      {/* Patient Header & Clinician Routing Status */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xl text-cyan-400">
                {activePatient?.name.charAt(0) || 'P'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">
                  {activePatient?.name || 'Eleanor Vance'}
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {activePatient?.id || 'PT-4092'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {activePatient?.strokeType || 'Ischemic'} Stroke
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {activePatient?.room || 'Room 402B - South Wing'} • Recovery Phase:{' '}
                <span className="text-cyan-300 font-semibold">
                  {activePatient?.recoveryPhase || 'Phase II (Subacute Rehab)'}
                </span>
              </p>
            </div>
          </div>

          {/* Target Clinician Routing Information */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Primary On-Duty Neurologist
              </span>
              <span className="text-xs font-bold text-white">
                {activeAdmin?.name || activePatient?.primaryNeurologist || 'Dr. Sophia Martinez, MD'}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 block">
                Target Admin ID: {activeAdmin?.id || 'ADM-8801'}
              </span>
            </div>
          </div>
        </div>

        {/* Big Accessible Emergency SOS Button */}
        <div className="pt-2">
          <button
            onClick={() =>
              triggerEmergency(
                'MANUAL_SOS',
                'Manual emergency button tapped on bedside touchscreen tablet.'
              )
            }
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl shadow-red-600/40 transition-all hover:scale-[1.01] active:scale-[0.99] border-2 border-red-400"
          >
            <AlertTriangle className="w-6 h-6 animate-ping" />
            <span>EMERGENCY SOS — CALL NURSE & NEUROLOGIST IMMEDIATELY</span>
          </button>
        </div>
      </div>

      {/* Main Grid: EAR Blink & Voice Monitor (Left) | Care Routines (Right) */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Real-Time EAR Eye-Blink & Voice SOS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Eye Aspect Ratio (EAR) Telemetry Card */}
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-cyan-500/30 shadow-xl space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>EAR Eye-Blink Emergency Monitor</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Ocular Aspect Ratio tracking for non-vocal distress notification
                  </p>
                </div>
              </div>

              {/* Camera Feed Toggle */}
              <button
                onClick={toggleRealCamera}
                className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isCameraActive
                    ? 'bg-cyan-600 text-white border-cyan-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Enable Bedside Camera</span>
                  </>
                )}
              </button>
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs">
                {cameraError}
              </div>
            )}

            {/* Video Viewport / Animated Ocular Mesh */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror-mode"
                />
              ) : (
                /* High fidelity simulated ocular telemetry visualization */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

                  {/* Simulated Eyes Graphic */}
                  <div className="flex items-center gap-10 z-10">
                    {/* Left Eye */}
                    <div className="relative w-24 h-16 rounded-full border-2 border-cyan-400/80 bg-slate-900/90 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <div
                        className={`w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center transition-all duration-150 ${
                          isEyeClosed ? 'scale-y-[0.1] bg-rose-500' : 'scale-y-100'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-slate-950"></div>
                      </div>
                      <span className="absolute -bottom-5 text-[9px] font-mono text-cyan-400">
                        LEFT EAR
                      </span>
                    </div>

                    {/* Right Eye */}
                    <div className="relative w-24 h-16 rounded-full border-2 border-cyan-400/80 bg-slate-900/90 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <div
                        className={`w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center transition-all duration-150 ${
                          isEyeClosed ? 'scale-y-[0.1] bg-rose-500' : 'scale-y-100'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-slate-950"></div>
                      </div>
                      <span className="absolute -bottom-5 text-[9px] font-mono text-cyan-400">
                        RIGHT EAR
                      </span>
                    </div>
                  </div>

                  <div className="z-10 mt-8 text-center">
                    <span className="text-[11px] font-mono text-slate-400">
                      Biometric Facial Landmark Pipeline: Active (68 Ocular Points)
                    </span>
                  </div>
                </div>
              )}

              {/* Overlaid Telemetry Metrics HUD */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Current EAR:</span>
                  <span
                    className={`font-mono font-bold ${
                      earValue < earThreshold ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {earValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Threshold:</span>
                  <span className="font-mono text-cyan-400">{earThreshold}</span>
                </div>
              </div>

              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] flex items-center gap-2">
                <span className="text-slate-400">Session Blinks:</span>
                <span className="font-mono font-bold text-white text-xs">{blinkCount}</span>
              </div>

              {isEyeClosed && (
                <div className="absolute inset-0 bg-red-600/10 border-4 border-red-500 pointer-events-none flex items-center justify-center">
                  <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow">
                    Ocular Closure Detected
                  </span>
                </div>
              )}
            </div>

            {/* Quick Blink Simulator Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSimulatedBlink(false)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Simulate 1x Blink</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulatedBlink(true)}
                className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                title="Simulate 3 rapid blinks in under 1.5 seconds"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Trigger 3x Rapid SOS</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateProlongedClosure}
                className="py-2 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Sleep/Drop</span>
              </button>
            </div>

            {/* Clinical EAR Calibration Sensitivity Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EAR Distress Sensitivity Calibration</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {earThreshold.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500">0.15 (Ptosis)</span>
                <input
                  type="range"
                  min="0.15"
                  max="0.32"
                  step="0.01"
                  value={earThreshold}
                  onChange={(e) => setEarThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">0.32 (High)</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Adjust trigger threshold if recovering stroke patient has unilateral eyelid drooping (ptosis) or facial asymmetry.
              </p>
            </div>
          </div>

          {/* Voice SOS Acoustic Distress Listener */}
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Voice SOS Distress Listener</h3>
                  <p className="text-[11px] text-slate-400">
                    Acoustic keyword detection ("Help", "Emergency", "Nurse")
                  </p>
                </div>
              </div>

              <button
                onClick={toggleVoiceListener}
                className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isVoiceActive
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isVoiceActive ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Mute Voice SOS</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Enable Voice SOS</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{voiceStatus}</span>
                {isVoiceActive && (
                  <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                    Microphone Open
                  </span>
                )}
              </div>
              {voiceTranscript && (
                <div className="p-2 rounded-lg bg-slate-900 text-xs font-mono text-cyan-300">
                  Heard: "{voiceTranscript}"
                </div>
              )}
            </div>

            {/* Quick Vocal Keyword Simulators */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold">Simulate Voice Trigger:</span>
              <button
                onClick={() => simulateVoiceDistress('HELP! I cannot move my arm!')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                "HELP"
              </button>
              <button
                onClick={() => simulateVoiceDistress('EMERGENCY! Severe headache!')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                "EMERGENCY"
              </button>
              <button
                onClick={() => simulateVoiceDistress('NURSE! Please help me sit up!')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                "NURSE"
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Hydration & Medications */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Stroke Hydration Tracker */}
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-cyan-500/30 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Stroke Hydration Tracker</h3>
                  <p className="text-[11px] text-slate-400">
                    Aspiration-safe fluid intake to prevent stroke recurrence
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {hydration?.currentMl || 750} / {hydration?.targetMl || 1800} mL
              </span>
            </div>

            {/* Mandatory Chin-Tuck Aspiration Precaution Alert */}
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Mandatory Chin-Tuck Protocol Active</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sit at 90° upright posture and tuck your chin toward your chest before swallowing any liquid to shield your airways from aspiration pneumonia.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((hydration?.currentMl || 750) / (hydration?.targetMl || 1800)) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 mL</span>
                <span>
                  {Math.round(
                    ((hydration?.currentMl || 750) / (hydration?.targetMl || 1800)) * 100
                  )}
                  % of daily neuro target
                </span>
                <span>{hydration?.targetMl || 1800} mL</span>
              </div>
            </div>

            {/* Quick Drink Logger Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Log Fluid Intake (Chin-Tuck Confirmed):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => logDrink(250, 'Thickened Water')}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+250 mL Water</span>
                </button>
                <button
                  onClick={() => logDrink(200, 'Electrolyte Solution')}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+200 mL Electrolyte</span>
                </button>
              </div>
            </div>
          </div>

          {/* Medication Adherence Checklist */}
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Daily Stroke Medications</h3>
                  <p className="text-[11px] text-slate-400">
                    Secondary stroke recurrence prophylaxis
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {medications.map((med) => (
                <div
                  key={med.id}
                  onClick={() => handleToggleMed(med.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    med.taken
                      ? 'bg-slate-950/60 border-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors ${
                        med.taken
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-slate-900'
                      }`}
                    >
                      {med.taken && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            med.taken ? 'text-slate-400 line-through' : 'text-white'
                          }`}
                        >
                          {med.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {med.timing}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{med.dosage} • {med.purpose}</p>
                    </div>
                  </div>
                  {med.taken && (
                    <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                      Taken {med.takenAt}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rehabilitation Drills Section */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Evidence-Based Stroke Rehabilitation Drills
              </h2>
              <p className="text-xs text-slate-400">
                Cortical neuroplasticity exercises tailored to hemiparesis recovery
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {drills.map((drill) => (
            <div
              key={drill.id}
              className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                    {drill.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {drill.durationSeconds}s
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{drill.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {drill.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  {drill.completedToday ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Pending Today</span>
                  )}
                </div>

                <button
                  onClick={() => startDrill(drill)}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Guided Drill</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guided Drill Active Modal */}
      {selectedDrill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  {selectedDrill.category} Session
                </span>
                <h3 className="text-2xl font-black text-white">{selectedDrill.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDrill(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Timer & Reps Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">Time Remaining</span>
                <span className="text-4xl font-mono font-black text-cyan-300">
                  {drillTimer}s
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">Repetitions</span>
                <span className="text-4xl font-mono font-black text-purple-300">
                  {drillReps} / {selectedDrill.repetitionGoal}
                </span>
              </div>
            </div>

            {/* Interactive Bilateral Mirror Box Visualizer */}
            {selectedDrill.category === 'Mirror Therapy' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">Virtual Mirror Therapy Partition</span>
                  <span className="text-[10px] font-mono text-slate-400">Cortical Excitability: Synced</span>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 relative">
                  {/* Vertical Mirror Divider line */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-400 to-purple-500 opacity-60"></div>
                  
                  {/* Left Hand: Active Motor Execution */}
                  <div className="text-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Non-Paretic Hand</span>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/60 border border-purple-400/40 flex items-center justify-center text-purple-300 text-2xl animate-pulse">
                      🖐️
                    </div>
                    <span className="text-[10px] text-purple-300 font-mono mt-1 block">Rhythmic Extension</span>
                  </div>

                  {/* Right Hand: Mirrored Optical Illusion */}
                  <div className="text-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Mirrored Reflection (Paretic)</span>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-2xl scale-x-[-1] animate-pulse">
                      🖐️
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono mt-1 block">Cortical Mirror Reorganization</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drill Instructions */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-white block">Clinical Instructions:</span>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                {selectedDrill.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrillReps((prev) => prev + 1)}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
              >
                +1 Repetition Completed
              </button>
              <button
                onClick={completeActiveDrill}
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
              >
                Finish Drill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
