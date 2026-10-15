import {
  Patient,
  AdminUser,
  EmergencyIncident,
  HydrationLog,
  MedicationItem,
  RehabDrill,
  CCTVFeed,
  PubMedArticle,
  IncidentStatus,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_ADMINS,
  INITIAL_INCIDENTS,
  INITIAL_MEDICATIONS,
  INITIAL_REHAB_DRILLS,
  INITIAL_CCTV_FEEDS,
  CURATED_PUBMED_TRIALS,
} from '../data/mockData';

// LocalStorage Persistence Keys
const STORAGE_KEYS = {
  PATIENTS: 'neurolife_patients_v2',
  ADMINS: 'neurolife_admins_v2',
  INCIDENTS: 'neurolife_incidents_v2',
  MEDICATIONS: 'neurolife_meds_v2',
  DRILLS: 'neurolife_drills_v2',
  CCTV: 'neurolife_cctv_v2',
  HYDRATION: 'neurolife_hydration_v2',
  ACTIVE_PATIENT: 'neurolife_active_patient_v2',
  ACTIVE_ADMIN: 'neurolife_active_admin_v2',
};

// Local storage helpers
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode
  }
}

// Initialize local datasets if empty
export function initLocalData() {
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    setLocalItem(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
    setLocalItem(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
    setLocalItem(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) {
    setLocalItem(STORAGE_KEYS.MEDICATIONS, INITIAL_MEDICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DRILLS)) {
    setLocalItem(STORAGE_KEYS.DRILLS, INITIAL_REHAB_DRILLS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CCTV)) {
    setLocalItem(STORAGE_KEYS.CCTV, INITIAL_CCTV_FEEDS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.HYDRATION)) {
    setLocalItem(STORAGE_KEYS.HYDRATION, {
      targetMl: 1800,
      currentMl: 750,
      aspirationWarningShown: true,
      logs: [
        {
          id: 'log-1',
          timestamp: '08:30 AM',
          amountMl: 250,
          beverage: 'Electrolyte Hydration (Thickened Nectar)',
          chinTuckConfirmed: true,
        },
        {
          id: 'log-2',
          timestamp: '11:15 AM',
          amountMl: 250,
          beverage: 'Mineral Water (Sip with Straw Cup)',
          chinTuckConfirmed: true,
        },
        {
          id: 'log-3',
          timestamp: '01:45 PM',
          amountMl: 250,
          beverage: 'Oral Nutritional Hydration Formula',
          chinTuckConfirmed: true,
        },
      ],
    } as HydrationLog);
  }
}

// Run initial local data check
if (typeof window !== 'undefined') {
  initLocalData();
}

// Network-resilient wrapper for API endpoints with local fallback
async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  fallbackGenerator: () => T | Promise<T>
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
  } catch (err) {
    console.warn(`[NeuroLife API] Network request to ${url} failed or offline. Using resilient local store.`, err);
  }

  // Graceful fallback to guarantee zero crash
  return await fallbackGenerator();
}

export const apiService = {
  // --- Patient Auth & Management ---
  async patientLogin(credentials: { patientIdOrMrn?: string; patientId?: string; mrn?: string; pinOrPassword?: string }): Promise<{
    patient: Patient;
    token: string;
  }> {
    const searchVal = credentials.patientIdOrMrn || credentials.patientId || credentials.mrn || '';
    const res = await safeFetch<any>(
      '/api/patient/login',
      {
        method: 'POST',
        body: JSON.stringify({ patientIdOrMrn: searchVal, ...credentials }),
      },
      () => {
        const patients = getLocalItem<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
        const search = searchVal.trim().toLowerCase();
        
        let found = patients.find(
          (p) =>
            p.id.toLowerCase() === search ||
            p.name.toLowerCase().includes(search)
        );

        if (!found) {
          found = patients[0] || INITIAL_PATIENTS[0];
        }

        setLocalItem(STORAGE_KEYS.ACTIVE_PATIENT, found);
        return {
          patient: found,
          token: `pt_jwt_${Date.now()}_${found.id}`,
        };
      }
    );

    const patient = res?.patient || (res?.id ? res : INITIAL_PATIENTS[0]);
    const token = res?.token || `pt_jwt_${Date.now()}_${patient.id}`;
    setLocalItem(STORAGE_KEYS.ACTIVE_PATIENT, patient);
    return { patient, token };
  },

  async registerPatient(newPatient: Partial<Patient>): Promise<Patient> {
    const res = await safeFetch<any>(
      '/api/patient/register',
      {
        method: 'POST',
        body: JSON.stringify(newPatient),
      },
      () => {
        const patients = getLocalItem<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
        const newId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
        const patient: Patient = {
          id: newId,
          name: newPatient.name || 'Anonymous Stroke Patient',
          age: newPatient.age || 62,
          gender: newPatient.gender || 'Female',
          room: newPatient.room || 'Room 305 - Neuro Rehab',
          strokeType: newPatient.strokeType || 'Ischemic',
          strokeDate: newPatient.strokeDate || new Date().toISOString().split('T')[0],
          recoveryPhase: newPatient.recoveryPhase || 'Phase II (Subacute Rehab)',
          primaryNeurologist: newPatient.primaryNeurologist || 'Dr. Sophia Martinez, MD',
          assignedAdminId: newPatient.assignedAdminId || 'ADM-8801',
          emergencyContact: newPatient.emergencyContact || {
            name: 'Primary Caregiver',
            relation: 'Family',
            phone: '+1 (555) 019-2834',
          },
          fallRiskScore: newPatient.fallRiskScore || 'Moderate',
          mobilityStatus: newPatient.mobilityStatus || 'Wheelchair Assisted',
          notes: newPatient.notes || 'Registered through NeuroLife emergency portal.',
        };

        const updated = [patient, ...patients];
        setLocalItem(STORAGE_KEYS.PATIENTS, updated);
        setLocalItem(STORAGE_KEYS.ACTIVE_PATIENT, patient);
        return patient;
      }
    );

    const registered = res?.patient || (res?.id ? res : INITIAL_PATIENTS[0]);
    setLocalItem(STORAGE_KEYS.ACTIVE_PATIENT, registered);
    return registered;
  },

  async getPatients(): Promise<Patient[]> {
    const res = await safeFetch<any>(
      '/api/patients',
      { method: 'GET' },
      () => getLocalItem<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS)
    );
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.patients)) return res.patients;
    return getLocalItem<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  },

  // --- Admin Auth & Management ---
  async adminLogin(credentials: { adminIdOrEmail?: string; adminId?: string; email?: string; password?: string }): Promise<{
    admin: AdminUser;
    token: string;
  }> {
    const queryVal = credentials.adminIdOrEmail || credentials.adminId || credentials.email || '';
    const res = await safeFetch<any>(
      '/api/admin/login',
      {
        method: 'POST',
        body: JSON.stringify({ adminIdOrEmail: queryVal, adminId: credentials.adminId, email: credentials.email, ...credentials }),
      },
      () => {
        const admins = getLocalItem<AdminUser[]>(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
        const query = queryVal.trim().toLowerCase();

        let found = admins.find(
          (a) =>
            a.id.toLowerCase() === query ||
            a.email.toLowerCase() === query ||
            a.name.toLowerCase().includes(query)
        );

        if (!found) {
          found = admins[0] || INITIAL_ADMINS[0];
        }

        setLocalItem(STORAGE_KEYS.ACTIVE_ADMIN, found);
        return {
          admin: found,
          token: `adm_jwt_${Date.now()}_${found.id}`,
        };
      }
    );

    const admin = res?.admin || (res?.id ? res : INITIAL_ADMINS[0]);
    const token = res?.token || `adm_jwt_${Date.now()}_${admin.id}`;
    setLocalItem(STORAGE_KEYS.ACTIVE_ADMIN, admin);
    return { admin, token };
  },

  async getAdmins(): Promise<AdminUser[]> {
    const res = await safeFetch<any>(
      '/api/admins',
      { method: 'GET' },
      () => getLocalItem<AdminUser[]>(STORAGE_KEYS.ADMINS, INITIAL_ADMINS)
    );
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.admins)) return res.admins;
    return getLocalItem<AdminUser[]>(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
  },

  // --- Incidents & Emergency Dispatch ---
  async dispatchIncident(data: {
    patientId: string;
    patientName: string;
    type: EmergencyIncident['type'];
    severity: EmergencyIncident['severity'];
    location: string;
    targetAdminId: string;
    targetAdminName?: string;
    targetAdminEmail?: string;
    details?: string;
  }): Promise<EmergencyIncident> {
    const res = await safeFetch<any>(
      '/api/incidents/dispatch',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        const incidents = getLocalItem<EmergencyIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
        const newIncident: EmergencyIncident = {
          id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
          patientId: data.patientId,
          patientName: data.patientName,
          type: data.type,
          severity: data.severity,
          location: data.location,
          timestamp: new Date().toISOString(),
          status: 'ACTIVE',
          targetAdminId: data.targetAdminId,
          targetAdminName: data.targetAdminName || 'Active Duty Neurologist',
          targetAdminEmail: data.targetAdminEmail,
          details: data.details || 'Emergency distress signal routed via EAR Blink & telemetry pipeline.',
          vitalSnapshot: {
            heartRate: Math.floor(95 + Math.random() * 25),
            spO2: Math.floor(94 + Math.random() * 5),
            systolicBP: Math.floor(135 + Math.random() * 25),
          },
        };

        const updated = [newIncident, ...incidents];
        setLocalItem(STORAGE_KEYS.INCIDENTS, updated);
        return newIncident;
      }
    );

    const incident: EmergencyIncident = res?.incident || (res?.id ? res : INITIAL_INCIDENTS[0]);
    // Sync with local store
    const incidents = getLocalItem<EmergencyIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    if (!incidents.some((i) => i.id === incident.id)) {
      setLocalItem(STORAGE_KEYS.INCIDENTS, [incident, ...incidents]);
    }
    return incident;
  },

  async getIncidents(): Promise<EmergencyIncident[]> {
    const res = await safeFetch<any>(
      '/api/incidents',
      { method: 'GET' },
      () => getLocalItem<EmergencyIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS)
    );
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.incidents)) return res.incidents;
    return getLocalItem<EmergencyIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
  },

  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    adminName: string
  ): Promise<EmergencyIncident> {
    const res = await safeFetch<any>(
      `/api/incidents/${incidentId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, adminName }),
      },
      () => {
        const incidents = getLocalItem<EmergencyIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
        const updated = incidents.map((inc) => {
          if (inc.id === incidentId) {
            return {
              ...inc,
              status,
              acknowledgedBy: adminName,
              acknowledgedAt: new Date().toISOString(),
            };
          }
          return inc;
        });
        setLocalItem(STORAGE_KEYS.INCIDENTS, updated);
        const found = updated.find((i) => i.id === incidentId);
        return found || incidents[0];
      }
    );

    const updatedIncident = res?.incident || (res?.id ? res : null);
    if (updatedIncident) {
      const incidents = getLocalItem<EmergencyIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
      setLocalItem(
        STORAGE_KEYS.INCIDENTS,
        incidents.map((i) => (i.id === incidentId ? { ...i, status, acknowledgedBy: adminName } : i))
      );
      return updatedIncident;
    }
    const incidents = getLocalItem<EmergencyIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    return incidents.find((i) => i.id === incidentId) || incidents[0];
  },

  // --- Hydration & Daily Care Routines ---
  async getHydration(): Promise<HydrationLog> {
    return getLocalItem<HydrationLog>(STORAGE_KEYS.HYDRATION, {
      targetMl: 1800,
      currentMl: 750,
      aspirationWarningShown: true,
      logs: [],
    });
  },

  async addHydration(amountMl: number, beverage: string, chinTuckConfirmed: boolean): Promise<HydrationLog> {
    const current = await this.getHydration();
    const newLog = {
      id: `hydro-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amountMl,
      beverage,
      chinTuckConfirmed,
    };

    const updated: HydrationLog = {
      ...current,
      currentMl: current.currentMl + amountMl,
      logs: [newLog, ...current.logs],
    };

    setLocalItem(STORAGE_KEYS.HYDRATION, updated);
    return updated;
  },

  // --- Medications ---
  async getMedications(): Promise<MedicationItem[]> {
    return getLocalItem<MedicationItem[]>(STORAGE_KEYS.MEDICATIONS, INITIAL_MEDICATIONS);
  },

  async toggleMedication(id: string): Promise<MedicationItem[]> {
    const meds = await this.getMedications();
    const updated = meds.map((m) =>
      m.id === id
        ? {
            ...m,
            taken: !m.taken,
            takenAt: !m.taken ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          }
        : m
    );
    setLocalItem(STORAGE_KEYS.MEDICATIONS, updated);
    return updated;
  },

  // --- Rehabilitation Drills ---
  async getRehabDrills(): Promise<RehabDrill[]> {
    return getLocalItem<RehabDrill[]>(STORAGE_KEYS.DRILLS, INITIAL_REHAB_DRILLS);
  },

  async completeDrill(drillId: string, score: number): Promise<RehabDrill[]> {
    const drills = await this.getRehabDrills();
    const updated = drills.map((d) =>
      d.id === drillId
        ? {
            ...d,
            completedToday: true,
            bestScore: Math.max(score, d.bestScore || 0),
          }
        : d
    );
    setLocalItem(STORAGE_KEYS.DRILLS, updated);
    return updated;
  },

  // --- CCTV Feeds ---
  async getCctvFeeds(): Promise<CCTVFeed[]> {
    const res = await safeFetch<any>(
      '/api/cctv/feeds',
      { method: 'GET' },
      () => getLocalItem<CCTVFeed[]>(STORAGE_KEYS.CCTV, INITIAL_CCTV_FEEDS)
    );
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.cameras)) return res.cameras;
    if (res && Array.isArray(res.feeds)) return res.feeds;
    return getLocalItem<CCTVFeed[]>(STORAGE_KEYS.CCTV, INITIAL_CCTV_FEEDS);
  },

  async addCctvFeed(feed: Omit<CCTVFeed, 'id'>): Promise<CCTVFeed> {
    const feeds = await this.getCctvFeeds();
    const newFeed: CCTVFeed = {
      ...feed,
      id: `CAM-${Date.now().toString().slice(-4)}`,
    };
    const updated = [...feeds, newFeed];
    setLocalItem(STORAGE_KEYS.CCTV, updated);
    return newFeed;
  },

  // --- PubMed Stroke Research Evidence ---
  async searchPubMed(term: string): Promise<PubMedArticle[]> {
    const res = await safeFetch<any>(
      `/api/science/pubmed-stroke-trials?term=${encodeURIComponent(term)}`,
      { method: 'GET' },
      () => {
        if (!term.trim()) return CURATED_PUBMED_TRIALS;
        const q = term.toLowerCase();
        const filtered = CURATED_PUBMED_TRIALS.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.abstract.toLowerCase().includes(q) ||
            a.keywords.some((k) => k.toLowerCase().includes(q))
        );
        return filtered.length > 0 ? filtered : CURATED_PUBMED_TRIALS;
      }
    );

    const list: PubMedArticle[] = Array.isArray(res)
      ? res
      : res && Array.isArray(res.articles)
      ? res.articles
      : CURATED_PUBMED_TRIALS;

    if (!term.trim()) return list;
    const q = term.toLowerCase();
    const filtered = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.abstract.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.toLowerCase().includes(q))
    );
    return filtered.length > 0 ? filtered : list;
  },

  // --- AI Clinical Document Analysis ---
  async analyzeMedicalDoc(text: string): Promise<{
    summary: string;
    strokeRiskScore: 'Low' | 'Moderate' | 'High' | 'Critical';
    keyRecommendations: string[];
    medicationsFound: string[];
    aspirationPrecautions: boolean;
  }> {
    return safeFetch(
      '/api/analyze-medical-doc',
      {
        method: 'POST',
        body: JSON.stringify({ documentText: text }),
      },
      () => {
        const lower = text.toLowerCase();
        const hasAspiration = lower.includes('dysphagia') || lower.includes('choke') || lower.includes('aspiration') || lower.includes('swallow');
        const isCritical = lower.includes('hemorrhage') || lower.includes('severe') || lower.includes('occlusion') || lower.includes('acute');

        return {
          summary: `Clinical analysis of stroke record: Patient exhibits neurological recovery indicators with ${isCritical ? 'high acute surveillance required' : 'stable subacute progression'}. Primary protocol dictates strict blood pressure target maintenance and regular EAR blink-monitoring telemetry.`,
          strokeRiskScore: isCritical ? 'Critical' : lower.includes('moderate') ? 'High' : 'Moderate',
          keyRecommendations: [
            'Maintain continuous Eye-Blink Aspect Ratio (EAR) non-vocal distress monitoring.',
            'Adhere to mandatory chin-tuck posture before swallowing any liquids to mitigate aspiration risk.',
            'Perform daily visual mirror therapy bilateral hand sessions for 20 minutes.',
            'Keep systolic blood pressure strictly titrated between 120 - 135 mmHg.',
          ],
          medicationsFound: ['Aspirin 81mg', 'Atorvastatin 40mg', 'Amlodipine 5mg'],
          aspirationPrecautions: hasAspiration || true,
        };
      }
    );
  },

  // --- Accessibility Text-to-Speech (Zero External Dependency) ---
  speakText(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  },
};
