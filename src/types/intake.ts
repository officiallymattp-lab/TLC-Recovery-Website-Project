export type ApplyingAs = 'myself' | 'assisting';

export type ResidenceChoice = '' | 'womens' | 'mens';

export interface IntakeFormData {
  applyingAs: ApplyingAs;
  residenceChoice: ResidenceChoice;
  assistingName: string;
  assistingRelationship: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  livingSituation: string;
  substances: string;
  sobrietyStatus: string;
  legalStatus: string;
  medicalNeeds: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  reasonForApplying: string;
  commitmentAccepted: boolean;
}

export const INITIAL_INTAKE_DATA: IntakeFormData = {
  applyingAs: 'myself',
  residenceChoice: '',
  assistingName: '',
  assistingRelationship: '',
  fullName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  livingSituation: '',
  substances: '',
  sobrietyStatus: '',
  legalStatus: '',
  medicalNeeds: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  reasonForApplying: '',
  commitmentAccepted: false,
};

export const RESIDENCE_OPTIONS: ReadonlyArray<{
  value: Exclude<ResidenceChoice, ''>;
  label: string;
  location: string;
  detail: string;
}> = [
  {
    value: 'womens',
    label: "Women's Recovery Housing (Somerville, AL)",
    location: 'Somerville, AL',
    detail: "TLC Women's Recovery House (9-month structured home) & TLC Grad House step-down.",
  },
  {
    value: 'mens',
    label: "Men's Recovery Housing — TLC Josiah House (Hartselle, AL)",
    location: 'Hartselle, AL',
    detail: 'Structured 12-step recovery home exclusively for men, founded in memory of Josiah.',
  },
];

export const LIVING_SITUATIONS = [
  'In Treatment / Rehab',
  'In Detox',
  'Living at Home / Family',
  'Unhoused / Unsafe Housing',
  'Correctional / Court Transition',
  'Transferring from Another Sober Living',
  'Other',
] as const;

export const LEGAL_STATUSES = [
  'No current legal obligations',
  'Probation or Parole',
  'Drug Court / Court-Ordered Transition',
  'Pending Court Dates',
  'Prefer to discuss privately with Crystal',
] as const;
