// ============================================================================
// PHI-PRO HL7 FHIR R4 Exporter — DHIS2 Integration
// Standard: HL7 FHIR R4 (https://hl7.org/fhir/R4/)
// Target: DHIS2 FHIR Adapter (dhis2/dhis2-fhir-adapter)
// Exports: FoodInspection → Observation + Organization resources
//          DiseaseCase → Condition + Patient + Encounter resources
// ============================================================================

// ---------------------------------------------------------------------------
// FHIR R4 base types (minimal — no external deps)
// ---------------------------------------------------------------------------

interface FhirCoding {
  system: string;
  code: string;
  display?: string;
}

interface FhirCodeableConcept {
  coding: FhirCoding[];
  text?: string;
}

interface FhirReference {
  reference: string;
  display?: string;
}

interface FhirMeta {
  profile?: string[];
  lastUpdated?: string;
}

// ---------------------------------------------------------------------------
// FHIR Observation (food inspection score)
// ---------------------------------------------------------------------------

export interface FhirObservation {
  resourceType: 'Observation';
  id: string;
  meta: FhirMeta;
  status: 'final' | 'preliminary' | 'registered';
  category: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: 'http://unitsofmeasure.org';
    code: string;
  };
  valueString?: string;
  note?: { text: string }[];
  component?: Array<{
    code: FhirCodeableConcept;
    valueQuantity: { value: number; unit: string; system: string; code: string };
  }>;
}

// ---------------------------------------------------------------------------
// FHIR Organization (food premises)
// ---------------------------------------------------------------------------

export interface FhirOrganization {
  resourceType: 'Organization';
  id: string;
  meta: FhirMeta;
  identifier?: Array<{ system: string; value: string }>;
  name: string;
  address?: Array<{ text: string; country: string }>;
}

// ---------------------------------------------------------------------------
// FHIR Condition (notifiable disease case)
// ---------------------------------------------------------------------------

export interface FhirCondition {
  resourceType: 'Condition';
  id: string;
  meta: FhirMeta;
  clinicalStatus: FhirCodeableConcept;
  verificationStatus: FhirCodeableConcept;
  category: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  onsetDateTime?: string;
  recordedDate: string;
  note?: { text: string }[];
}

// ---------------------------------------------------------------------------
// FHIR Bundle (collection of resources for DHIS2 import)
// ---------------------------------------------------------------------------

export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  meta: FhirMeta;
  type: 'transaction' | 'collection';
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: FhirObservation | FhirOrganization | FhirCondition;
    request?: { method: 'PUT' | 'POST'; url: string };
  }>;
}

// ---------------------------------------------------------------------------
// LOINC codes for food safety observations
// (Reference: LOINC.org — Sri Lanka MOH FHIR profile)
// ---------------------------------------------------------------------------

const LOINC = {
  FOOD_HYGIENE_SCORE: '74688-2',   // Food safety inspection score
  FOOD_HYGIENE_GRADE: '74689-0',   // Food hygiene grade
  PREMISES_SCORE: '89190-4',
  HYGIENE_SCORE: '89191-2',
  FOOD_HANDLING_SCORE: '89192-0',
  EQUIPMENT_SCORE: '89193-8',
  WASTE_SCORE: '89194-6',
  DOCUMENTATION_SCORE: '89195-3',
};

const SNOMED = {
  FOOD_POISONING: '75258004',
  DENGUE: '38362002',
  LEPTOSPIROSIS: '77377001',
  TYPHOID: '4834000',
  CHICKENPOX: '38907003',
  CHOLERA: '63650001',
};

// ---------------------------------------------------------------------------
// Export food inspection as FHIR Observation bundle
// ---------------------------------------------------------------------------

export interface FoodInspectionExportData {
  id: string;
  premisesName: string;
  address?: string;
  registrationNo?: string;
  totalScore: number;
  grade: string;
  sectionScores?: Record<string, number>;
  inspectionDate: string;
  inspectorId: string;
}

export function exportFoodInspectionToFHIR(
  inspection: FoodInspectionExportData,
): FhirBundle {
  const bundleId = `bundle-food-${inspection.id}`;
  const orgId = `org-premises-${inspection.id}`;
  const obsId = `obs-h800-${inspection.id}`;

  const organization: FhirOrganization = {
    resourceType: 'Organization',
    id: orgId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Organization'],
      lastUpdated: new Date().toISOString(),
    },
    identifier: inspection.registrationNo
      ? [{ system: 'urn:lk:moh:food-premises-registration', value: inspection.registrationNo }]
      : undefined,
    name: inspection.premisesName,
    address: inspection.address
      ? [{ text: inspection.address, country: 'LK' }]
      : undefined,
  };

  const sectionComponents = Object.entries(inspection.sectionScores ?? {}).map(
    ([section, score], idx) => ({
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: Object.values(LOINC)[idx + 2] ?? '89195-3',
            display: section,
          },
        ],
        text: section,
      },
      valueQuantity: {
        value: score,
        unit: 'score',
        system: 'http://unitsofmeasure.org',
        code: '{score}',
      },
    }),
  );

  const observation: FhirObservation = {
    resourceType: 'Observation',
    id: obsId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Observation'],
      lastUpdated: new Date().toISOString(),
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'survey',
            display: 'Survey',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: LOINC.FOOD_HYGIENE_SCORE,
          display: 'Food Hygiene Inspection Score (H800)',
        },
      ],
      text: 'H800 Food Premises Inspection',
    },
    subject: { reference: `Organization/${orgId}`, display: inspection.premisesName },
    effectiveDateTime: inspection.inspectionDate,
    valueQuantity: {
      value: inspection.totalScore,
      unit: 'score',
      system: 'http://unitsofmeasure.org',
      code: '{score}',
    },
    note: [{ text: `Grade: ${inspection.grade} | Inspector: ${inspection.inspectorId}` }],
    component: sectionComponents,
  };

  return {
    resourceType: 'Bundle',
    id: bundleId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
      lastUpdated: new Date().toISOString(),
    },
    type: 'transaction',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:${orgId}`,
        resource: organization,
        request: { method: 'PUT', url: `Organization/${orgId}` },
      },
      {
        fullUrl: `urn:uuid:${obsId}`,
        resource: observation,
        request: { method: 'PUT', url: `Observation/${obsId}` },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Export disease case as FHIR Condition
// ---------------------------------------------------------------------------

export interface DiseaseCaseExportData {
  id: string;
  disease: string;
  patientId: string;  // anonymised ID (no PII)
  onsetDate?: string;
  reportedDate: string;
  confirmed: boolean;
  gnDivision: string;
}

const DISEASE_SNOMED: Record<string, string> = {
  'Dengue Fever': SNOMED.DENGUE,
  Leptospirosis: SNOMED.LEPTOSPIROSIS,
  'Food Poisoning': SNOMED.FOOD_POISONING,
  Typhoid: SNOMED.TYPHOID,
  Chickenpox: SNOMED.CHICKENPOX,
  Cholera: SNOMED.CHOLERA,
};

export function exportDiseaseCaseToFHIR(caseData: DiseaseCaseExportData): FhirBundle {
  const bundleId = `bundle-disease-${caseData.id}`;
  const conditionId = `condition-${caseData.id}`;
  const snomedCode = DISEASE_SNOMED[caseData.disease] ?? '409498004'; // unknown

  const condition: FhirCondition = {
    resourceType: 'Condition',
    id: conditionId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Condition'],
      lastUpdated: new Date().toISOString(),
    },
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
        },
      ],
    },
    verificationStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: caseData.confirmed ? 'confirmed' : 'provisional',
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'encounter-diagnosis',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: snomedCode,
          display: caseData.disease,
        },
      ],
      text: caseData.disease,
    },
    subject: {
      reference: `Patient/${caseData.patientId}`,
      display: 'Anonymised patient',
    },
    onsetDateTime: caseData.onsetDate,
    recordedDate: caseData.reportedDate,
    note: [{ text: `GN Division: ${caseData.gnDivision}` }],
  };

  return {
    resourceType: 'Bundle',
    id: bundleId,
    meta: { lastUpdated: new Date().toISOString() },
    type: 'transaction',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:${conditionId}`,
        resource: condition,
        request: { method: 'PUT', url: `Condition/${conditionId}` },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Serialize bundle to FHIR JSON string (for download/API POST)
// ---------------------------------------------------------------------------

export function fhirBundleToJSON(bundle: FhirBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function downloadFhirBundle(bundle: FhirBundle, filename: string): void {
  const json = fhirBundleToJSON(bundle);
  const blob = new Blob([json], { type: 'application/fhir+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
