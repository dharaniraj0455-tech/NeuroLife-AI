export type UserRole = 'patient' | 'admin';

export interface Patient {
  id: string; // e.g. "PT-4092"
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  room: string;
  strokeType: 'Ischemic' | 'Hemorrhagic' | 'TIA';
  strokeDate: string;
  recoveryPhase: 'Phase I (Acute)' | 'Phase II (Subacute Rehab)' | 'Phase III (Community Re-integration)';
  primaryNeurologist: string;
  assignedAdminId: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  fallRiskScore: 'Low' | 'Moderate' | 'High';
  mobilityStatus: 'Bedbound' | 'Wheelchair Assisted' | 'Walker Ambulatory' | 'Independent';
  avatarUrl?: string;
  notes?: string;
}

export type AdminRole = 
  | 'Chief Vascular Neurologist'
  | 'Neurocritical Care Lead'
  | 'Head Stroke Care Coordinator'
  | 'Clinical Neuro-Nurse'
  | 'System Super-Admin';

export interface AdminUser {
  id: string; // e.g. "ADM-8801"
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  badgeNumber: string;
  hospitalUnit: string;
  activeShift: boolean;
  avatarUrl?: string;
  permissions: {
    canAcknowledgeIncidents: boolean;
    canDispatch911: boolean;
    canEditPatientRecords: boolean;
    canAccessCCTV: boolean;
    canRunAiDiagnostics: boolean;
  };
}

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentType = 
  | 'RAPID_BLINK_EAR'
  | 'PROLONGED_EYE_CLOSURE'
  | 'VOICE_SOS'
  | 'MANUAL_SOS'
  | 'FALL_ANOMALY'
  | 'ASPIRATION_RISK';

export type IncidentStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'DISPATCHED_911' | 'RESOLVED';

export interface EmergencyIncident {
  id: string;
  patientId: string;
  patientName: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: string;
  timestamp: string;
  status: IncidentStatus;
  targetAdminId: string;
  targetAdminName: string;
  targetAdminEmail?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  details?: string;
  vitalSnapshot?: {
    heartRate: number;
    spO2: number;
    systolicBP: number;
  };
}

export interface HydrationLog {
  targetMl: number;
  currentMl: number;
  aspirationWarningShown: boolean;
  logs: {
    id: string;
    timestamp: string;
    amountMl: number;
    beverage: string;
    chinTuckConfirmed: boolean;
  }[];
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  timing: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime';
  purpose: string;
  taken: boolean;
  takenAt?: string;
}

export interface RehabDrill {
  id: string;
  title: string;
  category: 'Motor Control' | 'Mirror Therapy' | 'Speech & Facial' | 'Cognitive Coordination';
  durationSeconds: number;
  description: string;
  instructions: string[];
  repetitionGoal: number;
  completedToday: boolean;
  bestScore?: number;
}

export interface CCTVFeed {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  port: number;
  status: 'ONLINE' | 'STANDBY' | 'MOTION_DETECTED' | 'ALERT';
  streamUrl?: string;
  resolution: string;
  fps: number;
  lastAnomaly?: string;
  patientRoom?: string;
}

export interface PubMedArticle {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  abstract: string;
  keywords: string[];
  url: string;
}
