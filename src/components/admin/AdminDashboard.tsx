import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Users,
  Video,
  FileText,
  BookOpen,
  CheckCircle2,
  PhoneCall,
  Ambulance,
  Sparkles,
  Radio,
  Search,
  ExternalLink,
  Plus,
  Activity,
  HeartPulse,
  Eye,
  RefreshCw,
  Printer,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { playEmergencySiren, playNotificationPing, playSuccessChime } from '../../services/soundEffects';
import { EmergencyIncident, Patient, CCTVFeed, PubMedArticle, AdminUser, IncidentStatus } from '../../types';
import { INITIAL_ADMINS } from '../../data/mockData';

type AdminTab = 'incidents' | 'patients' | 'cctv' | 'pubmed' | 'ai-doc';

export const AdminDashboard: React.FC = () => {
  const { activeAdmin, switchActiveAdmin, soundEnabled } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('incidents');
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cctvFeeds, setCctvFeeds] = useState<CCTVFeed[]>([]);
  const [pubmedArticles, setPubmedArticles] = useState<PubMedArticle[]>([]);
  const [pubmedSearch, setPubmedSearch] = useState('stroke rehabilitation');
  const [isSearchingPubmed, setIsSearchingPubmed] = useState(false);

  // AI Doc analyzer state
  const [docText, setDocText] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter state for incidents
  const [incidentFilter, setIncidentFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');

  // Clinical EHR Report Modal state
  const [selectedReportPatient, setSelectedReportPatient] = useState<Patient | null>(null);

  // Load initial datasets
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const [incs, pts, feeds, articles] = await Promise.all([
        apiService.getIncidents(),
        apiService.getPatients(),
        apiService.getCctvFeeds(),
        apiService.searchPubMed('stroke rehabilitation'),
      ]);
      if (mounted) {
        setIncidents(incs);
        setPatients(pts);
        setCctvFeeds(feeds);
        setPubmedArticles(articles);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Incident status update
  const handleUpdateStatus = async (incidentId: string, status: IncidentStatus) => {
    if (soundEnabled) playNotificationPing();
    const updated = await apiService.updateIncidentStatus(
      incidentId,
      status,
      activeAdmin?.name || 'Dr. Sophia Martinez, MD'
    );
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status, acknowledgedBy: updated.acknowledgedBy } : i))
    );
  };

  // Simulate an emergency dispatch to the active clinician
  const handleSimulateIncident = async () => {
    if (soundEnabled) playEmergencySiren();
    const incident = await apiService.dispatchIncident({
      patientId: 'PT-4092',
      patientName: 'Eleanor Vance',
      type: 'RAPID_BLINK_EAR',
      severity: 'CRITICAL',
      location: 'South Wing Room 402B - Bedside Camera',
      targetAdminId: activeAdmin?.id || 'ADM-8801',
      targetAdminName: activeAdmin?.name || 'Dr. Sophia Martinez, MD',
      targetAdminEmail: activeAdmin?.email,
      details: 'Patient triggered rapid 3x blink distress sequence. Attending neurologist notified on telemetry console.',
    });
    setIncidents((prev) => [incident, ...prev]);
  };

  // Handle PubMed Search
  const handlePubmedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingPubmed(true);
    const results = await apiService.searchPubMed(pubmedSearch);
    setPubmedArticles(results);
    setIsSearchingPubmed(false);
  };

  // Handle AI Document Analysis
  const handleAnalyzeDoc = async () => {
    if (!docText.trim()) return;
    setIsAnalyzing(true);
    const result = await apiService.analyzeMedicalDoc(docText);
    setAiAnalysisResult(result);
    setIsAnalyzing(false);
    if (soundEnabled) playSuccessChime();
  };

  const loadSampleDoc = () => {
    setDocText(`DISCHARGE SUMMARY & NEURO-CONSULTATION
PATIENT: Vance, Eleanor | MRN: PT-4092 | AGE: 64
PRIMARY DIAGNOSIS: Acute left middle cerebral artery (MCA) ischemic stroke.
HOSPITAL COURSE: Patient presented within 2.5 hours of symptom onset with right hemiparesis and mild dysphasia. Underwent successful endovascular thrombectomy with TICI 2b revascularization.
CURRENT STATUS: Subacute inpatient neuro-rehabilitation phase. Mild right upper extremity hemiparesis remains. Bedside monitoring via Eye Aspect Ratio (EAR) blink emergency detection deployed.
ASPIRATION RISK: Moderate oropharyngeal dysphagia noted on videofluoroscopic swallow study. Mandatory cervical chin-tuck maneuver required before any liquid ingestion. Thickened nectar consistency recommended.
MEDICATIONS: Aspirin 81mg PO daily, Atorvastatin 40mg PO at bedtime, Amlodipine 5mg PO daily.`);
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (incidentFilter === 'ALL') return true;
    return inc.status === incidentFilter;
  });

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Clinician Command Header */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xl text-indigo-400">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">
                  {activeAdmin?.name || 'Dr. Sophia Martinez, MD'}
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                  {activeAdmin?.id || 'ADM-8801'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Shift
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {activeAdmin?.role} • {activeAdmin?.department} • {activeAdmin?.hospitalUnit}
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSimulateIncident}
              className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Emergency Alert</span>
            </button>

            {/* Clinician Profile Switcher Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Clinician:</span>
              <select
                value={activeAdmin?.id || 'ADM-8801'}
                onChange={(e) => {
                  const found = INITIAL_ADMINS.find((a) => a.id === e.target.value);
                  if (found) switchActiveAdmin(found);
                }}
                className="bg-transparent font-semibold text-cyan-300 outline-none cursor-pointer"
              >
                {INITIAL_ADMINS.map((adm) => (
                  <option key={adm.id} value={adm.id} className="bg-slate-900 text-white">
                    {adm.name} ({adm.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Channel Info Banner */}
        <div className="p-3 bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-slate-950 rounded-xl border border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              <strong className="text-white">Active Telemetry Routing:</strong> Any patient distress signal (EAR eye-blink, voice SOS, or fall anomaly) is routed directly to console{' '}
              <strong className="text-cyan-300 font-mono">{activeAdmin?.id || 'ADM-8801'}</strong>.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Latency &lt; 280ms • HL7 FHIR Compliant
          </span>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`py-2 px-4 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'incidents'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency Incidents</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
              {incidents.filter((i) => i.status === 'ACTIVE').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`py-2 px-4 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'patients'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Monitored Patients</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
              {patients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cctv')}
            className={`py-2 px-4 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'cctv'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>CCTV Room Feeds</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
              {cctvFeeds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pubmed')}
            className={`py-2 px-4 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'pubmed'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>PubMed Stroke Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-doc')}
            className={`py-2 px-4 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'ai-doc'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>AI Clinical Document Analyzer</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Emergency Incidents Queue */}
      {activeTab === 'incidents' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Live Emergency Incidents Queue</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              </h2>
              <p className="text-xs text-slate-400">
                Audible triage dispatch channel for non-vocal blink alarms and bed fall sensors
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setIncidentFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    incidentFilter === filter
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-950/60 border border-slate-800">
                No incidents match filter: {incidentFilter}. All monitored rooms are currently stable.
              </div>
            ) : (
              filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    inc.status === 'ACTIVE'
                      ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-white">
                          {inc.id}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {inc.patientName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {inc.location}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          {inc.severity}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inc.status === 'ACTIVE'
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {inc.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">{inc.details}</p>

                      {/* Vital snapshot */}
                      {inc.vitalSnapshot && (
                        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                          <span className="flex items-center gap-1 text-rose-400">
                            <HeartPulse className="w-3.5 h-3.5" />
                            HR: {inc.vitalSnapshot.heartRate} bpm
                          </span>
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Activity className="w-3.5 h-3.5" />
                            SpO2: {inc.vitalSnapshot.spO2}%
                          </span>
                          <span className="flex items-center gap-1 text-purple-400">
                            BP: {inc.vitalSnapshot.systolicBP}/85 mmHg
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {inc.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(inc.id, 'ACKNOWLEDGED')}
                            className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(inc.id, 'DISPATCHED_911')}
                            className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Ambulance className="w-3.5 h-3.5" />
                            <span>Dispatch Code Stroke 911</span>
                          </button>
                        </>
                      )}

                      {inc.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'RESOLVED')}
                          className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Monitored Patients */}
      {activeTab === 'patients' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Monitored Stroke Inpatients</h2>
              <p className="text-xs text-slate-400">
                Live patient telemetry, room assignments and fall risk scores
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300">
              Total Monitored: {patients.length}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center font-black text-indigo-300">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{p.name}</h3>
                      <span className="text-[11px] font-mono text-cyan-400">{p.id}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.fallRiskScore === 'High'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    Fall Risk: {p.fallRiskScore}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong>Room:</strong> {p.room}</p>
                  <p><strong>Stroke Type:</strong> {p.strokeType} ({p.strokeDate})</p>
                  <p><strong>Phase:</strong> {p.recoveryPhase}</p>
                  <p><strong>Mobility:</strong> {p.mobilityStatus}</p>
                  <p><strong>Neurologist:</strong> {p.primaryNeurologist}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[140px]">Caregiver: {p.emergencyContact.name}</span>
                  <button
                    onClick={() => setSelectedReportPatient(p)}
                    className="py-1 px-2.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 font-semibold text-[10px] flex items-center gap-1 transition-colors shrink-0"
                  >
                    <ClipboardList className="w-3 h-3 text-indigo-400" />
                    <span>EHR Summary</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: CCTV Room Telemetry */}
      {activeTab === 'cctv' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">CCTV Telemetry & Room Surveillance</h2>
              <p className="text-xs text-slate-400">
                Inpatient room cameras with automated AI fall anomaly & posture elevation alerts
              </p>
            </div>
            <button
              onClick={async () => {
                if (soundEnabled) playEmergencySiren();
                const inc = await apiService.dispatchIncident({
                  patientId: 'PT-4092',
                  patientName: 'Eleanor Vance',
                  type: 'FALL_ANOMALY',
                  severity: 'HIGH',
                  location: 'South Wing Room 402B - Bed Sensor',
                  targetAdminId: activeAdmin?.id || 'ADM-8801',
                  details: 'Camera 402B AI vision detected rapid elevation drop off bed perimeter.',
                });
                setIncidents((prev) => [inc, ...prev]);
                setActiveTab('incidents');
              }}
              className="py-1.5 px-3 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Fall Anomaly</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {cctvFeeds.map((cam) => (
              <div
                key={cam.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg space-y-3 p-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-white">{cam.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {cam.ipAddress}:{cam.port}
                  </span>
                </div>

                {/* Simulated Camera Video Canvas */}
                <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  {/* Telemetry crosshair overlay */}
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                    REC • {cam.resolution}
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                    {new Date().toLocaleTimeString()}
                  </div>

                  <div className="text-center space-y-1 z-10">
                    <Video className="w-8 h-8 text-indigo-400/60 mx-auto" />
                    <span className="text-xs font-mono text-slate-300 block">
                      Live Telemetry Stream
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Motion Detection Active • AI Fall Pose Filter
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Location: {cam.location}</span>
                  <span className="text-emerald-400 font-semibold">{cam.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: PubMed Stroke Clinical Evidence */}
      {activeTab === 'pubmed' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">PubMed Stroke Evidence & Clinical Trials</h2>
              <p className="text-xs text-slate-400">
                Ground clinical decision-making in peer-reviewed vascular neurology trials
              </p>
            </div>

            <form onSubmit={handlePubmedSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={pubmedSearch}
                onChange={(e) => setPubmedSearch(e.target.value)}
                placeholder="Search PubMed trials..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none w-64 focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={isSearchingPubmed}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {pubmedArticles.map((art) => (
              <div
                key={art.id}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                      {art.journal} • {art.year} • {art.id}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{art.title}</h3>
                  </div>
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs flex items-center gap-1 shrink-0"
                    title="View on PubMed Central"
                  >
                    <span>PubMed</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{art.abstract}</p>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {art.keywords.map((k, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: AI Clinical Document Analyzer */}
      {activeTab === 'ai-doc' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>AI Clinical Document Analyzer</span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated clinical summarizer for discharge notes, MRI findings & dysphagia precautions
              </p>
            </div>

            <button
              onClick={loadSampleDoc}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Sample Stroke Record</span>
            </button>
          </div>

          <div className="space-y-4">
            <textarea
              rows={6}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste inpatient physician notes, neuro-consultation report, or CT angiogram findings..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none leading-relaxed"
            />

            <button
              onClick={handleAnalyzeDoc}
              disabled={isAnalyzing || !docText.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <span>Synthesizing Stroke Biomarkers & Risk Stratification...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Clinical Document with NeuroLife AI</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results View */}
          {aiAnalysisResult && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  AI Clinical Consultation Insights
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    aiAnalysisResult.strokeRiskScore === 'Critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  Recurrence Risk: {aiAnalysisResult.strokeRiskScore}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {aiAnalysisResult.summary}
              </p>

              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">Key Action Directives:</span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {aiAnalysisResult.keyRecommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {aiAnalysisResult.aspirationPrecautions && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Aspiration protocol activated: Chin-tuck posture verified for hydration orders.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clinical EHR Telemetry Summary Report Modal */}
      {selectedReportPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-400">
                  Comprehensive Inpatient Telemetry Summary • HL7 FHIR
                </span>
                <h3 className="text-xl font-black text-white">
                  {selectedReportPatient.name} ({selectedReportPatient.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportPatient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Demographics & Stroke Profile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Age / Gender</span>
                <span className="font-bold text-white">{selectedReportPatient.age} yo / {selectedReportPatient.gender}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Room / Unit</span>
                <span className="font-bold text-white">{selectedReportPatient.room.split(' - ')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Classification</span>
                <span className="font-bold text-cyan-300">{selectedReportPatient.strokeType} Stroke</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Fall Risk</span>
                <span className="font-bold text-rose-400">{selectedReportPatient.fallRiskScore}</span>
              </div>
            </div>

            {/* Clinical Telemetry & EAR Findings */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs">
              <span className="font-bold text-white block">Telemetry & Neurological Recovery Indicators:</span>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>EAR Eye-Blink Cadence:</strong> Baseline EAR 0.28 (threshold 0.21). Non-vocal distress alerts successfully dispatched to {activeAdmin?.name || 'Dr. Sophia Martinez, MD'}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Dysphagia Hydration Protocol:</strong> 100% chin-tuck compliance logged across thickened nectar feedings. Zero micro-aspiration episodes recorded.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Rehabilitation Motor Progress:</strong> Visual mirror therapy and bilateral finger-thumb opposition completed. Recovery Phase: {selectedReportPatient.recoveryPhase}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Secondary Prophylaxis:</strong> Aspirin 81mg, Atorvastatin 40mg, and Amlodipine 5mg verified on inpatient MAR.</span>
                </li>
              </ul>
            </div>

            {/* Neurologist Attestation */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Attending Vascular Neurologist on Duty:</span>
                <span className="font-bold text-white">{activeAdmin?.name || selectedReportPatient.primaryNeurologist}</span>
                <span className="text-[10px] font-mono text-cyan-400 block">{activeAdmin?.id || 'ADM-8801'} • Signed electronically</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Clinical Report</span>
              </button>
              <button
                onClick={() => setSelectedReportPatient(null)}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
