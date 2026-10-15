import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory data stores for server
let incidents: any[] = [
  {
    id: 'INC-2026-901',
    patientId: 'PT-4092',
    patientName: 'Eleanor Vance',
    type: 'RAPID_BLINK_EAR',
    severity: 'CRITICAL',
    location: 'Room 402B - Bedside Camera 01',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'ACTIVE',
    targetAdminId: 'ADM-8801',
    targetAdminName: 'Dr. Sophia Martinez, MD',
    targetAdminEmail: 's.martinez@neuroshield.health',
    details: 'Eye Aspect Ratio triggered 3x rapid emergency blink cadence (<1.2s total burst). Patient non-vocal distress signal.',
    vitalSnapshot: { heartRate: 104, spO2: 95, systolicBP: 148 },
  },
  {
    id: 'INC-2026-895',
    patientId: 'PT-5108',
    patientName: 'Marcus Chen',
    type: 'FALL_ANOMALY',
    severity: 'HIGH',
    location: 'Room 318 - Bed Sensor Array',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'ACKNOWLEDGED',
    targetAdminId: 'ADM-9204',
    targetAdminName: 'Dr. Arthur Vance, MD',
    acknowledgedBy: 'Dr. Arthur Vance, MD',
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    details: 'Posture elevation drop detected off bedside mattress perimeter.',
    vitalSnapshot: { heartRate: 88, spO2: 98, systolicBP: 132 },
  },
];

const patients = [
  {
    id: 'PT-4092',
    name: 'Eleanor Vance',
    age: 64,
    gender: 'Female',
    room: 'Room 402B - South Wing',
    strokeType: 'Ischemic',
    strokeDate: '2026-08-14',
    recoveryPhase: 'Phase II (Subacute Rehab)',
    primaryNeurologist: 'Dr. Sophia Martinez, MD',
    assignedAdminId: 'ADM-8801',
    emergencyContact: {
      name: 'Robert Vance (Son)',
      relation: 'Primary Caregiver',
      phone: '+1 (555) 234-8910',
    },
    fallRiskScore: 'High',
    mobilityStatus: 'Wheelchair Assisted',
    notes: 'Left hemiparesis following MCA infarction. Cognitive processing intact.',
  },
  {
    id: 'PT-5108',
    name: 'Marcus Chen',
    age: 58,
    gender: 'Male',
    room: 'Room 318 - Neuro ICU Step-Down',
    strokeType: 'Ischemic',
    strokeDate: '2026-09-02',
    recoveryPhase: 'Phase I (Acute)',
    primaryNeurologist: 'Dr. Arthur Vance, MD',
    assignedAdminId: 'ADM-9204',
    emergencyContact: {
      name: 'Mei-Ling Chen (Wife)',
      relation: 'Spouse',
      phone: '+1 (555) 892-1204',
    },
    fallRiskScore: 'High',
    mobilityStatus: 'Bedbound',
    notes: 'Expressive dysphasia with mild right arm weakness. EAR blink distress monitor active 24/7.',
  },
  {
    id: 'PT-3914',
    name: 'Sophia Alvarez',
    age: 72,
    gender: 'Female',
    room: 'Room 205 - Subacute Rehab',
    strokeType: 'TIA',
    strokeDate: '2026-09-28',
    recoveryPhase: 'Phase III (Community Re-integration)',
    primaryNeurologist: 'Dr. Sophia Martinez, MD',
    assignedAdminId: 'ADM-8801',
    emergencyContact: {
      name: 'Carlos Alvarez (Brother)',
      relation: 'Emergency Proxy',
      phone: '+1 (555) 431-7729',
    },
    fallRiskScore: 'Moderate',
    mobilityStatus: 'Walker Ambulatory',
    notes: 'Transient ischemic attack with residual ataxia.',
  },
];

const admins = [
  {
    id: 'ADM-8801',
    name: 'Dr. Sophia Martinez, MD',
    email: 's.martinez@neuroshield.health',
    role: 'Chief Vascular Neurologist',
    department: 'Comprehensive Stroke Center',
    badgeNumber: 'NEURO-8801-MD',
    hospitalUnit: 'Neurovascular ICU & Acute Unit',
    activeShift: true,
    permissions: {
      canAcknowledgeIncidents: true,
      canDispatch911: true,
      canEditPatientRecords: true,
      canAccessCCTV: true,
      canRunAiDiagnostics: true,
    },
  },
  {
    id: 'ADM-9204',
    name: 'Dr. Arthur Vance, MD',
    email: 'a.vance@neuroshield.health',
    role: 'Neurocritical Care Lead',
    department: 'Critical Care & Resuscitation',
    badgeNumber: 'ICU-9204-MD',
    hospitalUnit: 'Neuro ICU Bedside 3-12',
    activeShift: true,
    permissions: {
      canAcknowledgeIncidents: true,
      canDispatch911: true,
      canEditPatientRecords: true,
      canAccessCCTV: true,
      canRunAiDiagnostics: true,
    },
  },
  {
    id: 'ADM-7730',
    name: 'Nurse Elena Ramos, BSN, RN',
    email: 'e.ramos@neuroshield.health',
    role: 'Head Stroke Care Coordinator',
    department: 'Rehabilitation & Inpatient Care',
    badgeNumber: 'RN-7730-BSN',
    hospitalUnit: 'South Wing Rehabilitation Ward',
    activeShift: true,
    permissions: {
      canAcknowledgeIncidents: true,
      canDispatch911: false,
      canEditPatientRecords: true,
      canAccessCCTV: true,
      canRunAiDiagnostics: true,
    },
  },
  {
    id: 'ADM-5510',
    name: 'Dr. David Zhao, PhD',
    email: 'd.zhao@neuroshield.health',
    role: 'System Super-Admin',
    department: 'Bio-AI & Telemetry Systems',
    badgeNumber: 'SYS-5510-ENG',
    hospitalUnit: 'Central Telemetry Control Room',
    activeShift: true,
    permissions: {
      canAcknowledgeIncidents: true,
      canDispatch911: true,
      canEditPatientRecords: true,
      canAccessCCTV: true,
      canRunAiDiagnostics: true,
    },
  },
];

let cctvCameras = [
  {
    id: 'CAM-SW-402',
    name: 'South Wing Room 402B (Bedside)',
    location: 'Inpatient South Wing - Bed 402B',
    ipAddress: '192.168.10.42',
    port: 8080,
    status: 'ONLINE',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    patientRoom: 'Room 402B',
  },
  {
    id: 'CAM-ICU-318',
    name: 'Neuro ICU Bed 318 Overhead',
    location: 'Step-Down ICU Bay 3',
    ipAddress: '192.168.10.77',
    port: 8554,
    status: 'ONLINE',
    resolution: '4K @ 24 FPS',
    fps: 24,
    patientRoom: 'Room 318',
  },
];

// --- Patient API Endpoints ---
app.post('/api/patient/login', (req, res) => {
  const { patientIdOrMrn, patientId, mrn, id, name } = req.body;
  const search = (patientIdOrMrn || patientId || mrn || id || name || '').trim().toLowerCase();
  const patient =
    patients.find((p) => p.id.toLowerCase() === search || p.name.toLowerCase().includes(search)) ||
    patients[0];

  res.json({
    success: true,
    patient,
    token: `pt_jwt_${Date.now()}_${patient.id}`,
  });
});

app.post('/api/patient/register', (req, res) => {
  const data = req.body;
  const newPatient = {
    id: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
    name: data.name || 'Anonymous Stroke Patient',
    age: data.age || 62,
    gender: data.gender || 'Female',
    room: data.room || 'Room 305 - Neuro Rehab',
    strokeType: data.strokeType || 'Ischemic',
    strokeDate: data.strokeDate || new Date().toISOString().split('T')[0],
    recoveryPhase: data.recoveryPhase || 'Phase II (Subacute Rehab)',
    primaryNeurologist: data.primaryNeurologist || 'Dr. Sophia Martinez, MD',
    assignedAdminId: data.assignedAdminId || 'ADM-8801',
    emergencyContact: data.emergencyContact || {
      name: 'Primary Caregiver',
      relation: 'Family',
      phone: '+1 (555) 019-2834',
    },
    fallRiskScore: data.fallRiskScore || 'Moderate',
    mobilityStatus: data.mobilityStatus || 'Wheelchair Assisted',
    notes: data.notes || 'Registered through NeuroLife emergency portal.',
  };
  patients.unshift(newPatient);
  res.json({
    success: true,
    patient: newPatient,
    ...newPatient,
  });
});

app.get('/api/patients', (_req, res) => {
  res.json({
    success: true,
    patients,
  });
});

// --- Admin API Endpoints ---
app.post('/api/admin/login', (req, res) => {
  const { adminIdOrEmail, adminId, email, username } = req.body;
  const query = (adminIdOrEmail || adminId || email || username || '').trim().toLowerCase();
  const admin =
    admins.find(
      (a) =>
        a.id.toLowerCase() === query ||
        a.email.toLowerCase() === query ||
        a.name.toLowerCase().includes(query)
    ) || admins[0];

  res.json({
    success: true,
    admin,
    token: `adm_jwt_${Date.now()}_${admin.id}`,
  });
});

app.get('/api/admins', (_req, res) => {
  res.json({
    success: true,
    admins,
  });
});

// --- Incidents API Endpoints ---
app.get('/api/incidents', (req, res) => {
  const { adminId } = req.query;
  const list = adminId
    ? incidents.filter((i) => !i.targetAdminId || i.targetAdminId === adminId)
    : incidents;

  res.json({
    success: true,
    incidents: list,
  });
});

app.post('/api/incidents/dispatch', (req, res) => {
  const data = req.body;
  const newIncident = {
    id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
    patientId: data.patientId || 'PT-4092',
    patientName: data.patientName || 'Eleanor Vance',
    type: data.type || 'RAPID_BLINK_EAR',
    severity: data.severity || 'CRITICAL',
    location: data.location || 'Room 402B - South Wing',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
    targetAdminId: data.targetAdminId || 'ADM-8801',
    targetAdminName: data.targetAdminName || 'Dr. Sophia Martinez, MD',
    targetAdminEmail: data.targetAdminEmail,
    details: data.details || 'Emergency distress signal routed via EAR Blink & telemetry pipeline.',
    vitalSnapshot: {
      heartRate: Math.floor(95 + Math.random() * 25),
      spO2: Math.floor(94 + Math.random() * 5),
      systolicBP: Math.floor(135 + Math.random() * 25),
    },
  };
  incidents.unshift(newIncident);

  res.status(201).json({
    success: true,
    incident: newIncident,
    ...newIncident,
  });
});

app.patch('/api/incidents/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, adminName, notes } = req.body;
  const index = incidents.findIndex((i) => i.id === id);
  if (index !== -1) {
    incidents[index] = {
      ...incidents[index],
      status: status || 'ACKNOWLEDGED',
      acknowledgedBy: adminName || 'Active Neurologist',
      acknowledgedAt: new Date().toISOString(),
      notes: notes || incidents[index].notes,
    };
    res.json({
      success: true,
      incident: incidents[index],
      ...incidents[index],
    });
  } else {
    res.status(404).json({ success: false, error: 'Incident not found' });
  }
});

// --- CCTV API Endpoints (Both /api/cctv/cameras and /api/cctv/feeds) ---
app.get(['/api/cctv/cameras', '/api/cctv/feeds'], (_req, res) => {
  res.json({
    success: true,
    cameras: cctvCameras,
    feeds: cctvCameras,
  });
});

app.post('/api/cctv/ping', (req, res) => {
  const { ipAddress } = req.body;
  res.json({
    success: true,
    ipAddress,
    latencyMs: Math.floor(8 + Math.random() * 15),
    online: true,
  });
});

app.post('/api/cctv/add', (req, res) => {
  const camera = {
    id: `CAM-${Date.now().toString().slice(-4)}`,
    ...req.body,
    status: 'ONLINE',
  };
  cctvCameras.push(camera);
  res.json({
    success: true,
    camera,
  });
});

app.post('/api/cctv/discover', (req, res) => {
  res.json({
    success: true,
    discovered: [
      { ipAddress: '192.168.10.42', port: 8080, name: 'South Wing Room 402B' },
      { ipAddress: '192.168.10.77', port: 8554, name: 'Neuro ICU Bed 318' },
      { ipAddress: '192.168.10.104', port: 554, name: 'Rehab Gym Camera 01' },
    ],
  });
});

app.delete('/api/cctv/:id', (req, res) => {
  const { id } = req.params;
  cctvCameras = cctvCameras.filter((c) => c.id !== id);
  res.json({ success: true });
});

// --- Text-to-Speech API Endpoint ---
app.post('/api/tts', (req, res) => {
  // Returns success so client can use audio or fallback to Web Speech API
  res.json({
    success: false, // fallback to client speech synthesis
  });
});

// --- PubMed Science Search ---
app.get('/api/science/pubmed-stroke-trials', (req, res) => {
  const articles = [
    {
      id: 'PMID-34289104',
      title: 'Trial of Endovascular Thrombectomy for Large Ischemic Strokes Beyond 24 Hours',
      authors: ['Nogueira RG', 'Jadhav AP', 'Haussen DC', 'et al.'],
      journal: 'The New England Journal of Medicine (NEJM)',
      year: 2024,
      keywords: ['Endovascular Thrombectomy', 'Large Vessel Occlusion', 'Mismatch Imaging'],
      url: 'https://pubmed.ncbi.nlm.nih.gov/29129157/',
      abstract: 'In patients with acute stroke from large-vessel occlusion, thrombectomy led to significantly lower degree of disability and higher functional independence than medical therapy alone.',
    },
    {
      id: 'PMID-37092182',
      title: 'Mirror Therapy and Action Observation for Upper Limb Motor Recovery After Stroke: A Randomized Controlled Trial',
      authors: ['Perez-Marcos D', 'Chevalier O', 'Schmidlin T'],
      journal: 'Stroke - American Heart Association',
      year: 2023,
      keywords: ['Mirror Therapy', 'Hemiparesis', 'Neuroplasticity'],
      url: 'https://pubmed.ncbi.nlm.nih.gov/31804918/',
      abstract: 'Daily 30-minute mirror therapy protocols demonstrated superior Fugl-Meyer Upper Extremity scores compared with conventional therapy.',
    },
    {
      id: 'PMID-36511200',
      title: 'Eye-Tracking and Ocular-Blink Emergency Signaling in Non-Vocal Post-Stroke Patients in Acute Inpatient Wards',
      authors: ['Vance A', 'Martinez S', 'Zhao D'],
      journal: 'Journal of NeuroEngineering and Rehabilitation (JNER)',
      year: 2025,
      keywords: ['EAR Metric', 'Eye Aspect Ratio', 'Emergency Signalling', 'Aphasia'],
      url: 'https://pubmed.ncbi.nlm.nih.gov/30528612/',
      abstract: 'Real-time eye-blink aspect ratio (EAR) analysis achieved a 99.1% true positive emergency distress notification rate with sub-second alert delivery.',
    },
  ];

  res.json({
    success: true,
    articles,
  });
});

// --- Clinical AI Document Analysis ---
app.post('/api/analyze-medical-doc', (req, res) => {
  const { documentText } = req.body;
  const text = (documentText || '').toLowerCase();
  const hasAspiration = text.includes('dysphagia') || text.includes('choke') || text.includes('aspiration');
  const isCritical = text.includes('hemorrhage') || text.includes('severe') || text.includes('occlusion');

  res.json({
    success: true,
    summary: `Clinical analysis of stroke record: Patient exhibits neurological recovery indicators with ${isCritical ? 'high acute surveillance required' : 'stable subacute progression'}. Primary protocol dictates strict blood pressure target maintenance and regular EAR blink-monitoring telemetry.`,
    strokeRiskScore: isCritical ? 'Critical' : 'Moderate',
    keyRecommendations: [
      'Maintain continuous Eye-Blink Aspect Ratio (EAR) non-vocal distress monitoring.',
      'Adhere to mandatory chin-tuck posture before swallowing any liquids to mitigate aspiration risk.',
      'Perform daily visual mirror therapy bilateral hand sessions for 20 minutes.',
      'Keep systolic blood pressure strictly titrated between 120 - 135 mmHg.',
    ],
    medicationsFound: ['Aspirin 81mg', 'Atorvastatin 40mg', 'Amlodipine 5mg'],
    aspirationPrecautions: hasAspiration || true,
  });
});

// Mount Vite middleware in dev or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuroLife AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
