export type ApplyingAs = 'myself' | 'assisting';

export type ResidenceChoice = '' | 'womens' | 'mens';
export type HousingProgram = ResidenceChoice;
export type YesNo = '' | 'yes' | 'no';
export type MoveInType = '' | 'immediately' | 'future';
export type MaritalStatus = '' | 'Never Married' | 'Married' | 'Separated' | 'Divorced';

export interface MedicationEntry {
  id: string;
  med_name: string;
  med_dosage: string;
  med_instructions: string;
}

export interface IntakeFormData {
  // Anti-spam honeypot
  website_url: string;

  // Step 1: Residence, Identity & Present Address
  housing_program: HousingProgram;
  applying_as: ApplyingAs;
  assisting_name: string;
  assisting_relationship: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  marital_status: MaritalStatus;
  phone_primary: string;
  phone_work_alt: string;
  email: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  is_treatment_facility: boolean;
  move_in_type: MoveInType;
  requested_move_in_date: string;
  future_move_in_reason: string;

  // Step 2: Recovery & Treatment History
  is_alcoholic: YesNo;
  last_drink_date: string;
  is_addicted_to_drugs: YesNo;
  last_drug_use_date: string;
  substances_used: string;
  wants_to_stop: YesNo;
  first_meeting_date: string;
  weekly_meetings_count: string;
  has_prior_treatment: YesNo;
  treatment_provider_name: string;
  treatment_provider_phone: string;
  treatment_counselor_name: string;

  // Step 3: Employment, Income & Program Costs
  is_employed: YesNo;
  employer_name: string;
  willing_to_get_job: YesNo;
  job_plans: string;
  has_non_job_income: YesNo;
  non_job_income_source: string;
  current_monthly_income: string;
  expected_next_month_income: string;

  // Step 4: Medical, Medications, Legal & Emergency Contacts
  not_sex_offender_confirmed: boolean;
  has_legal_issues: YesNo;
  legal_issues_details: string;
  on_supervision: YesNo;
  supervision_officer_name: string;
  supervision_officer_phone: string;
  has_valid_id_and_ssn_card: YesNo;
  has_medical_doctor: YesNo;
  doctor_name: string;
  doctor_phone: string;
  takes_prescription_meds: YesNo;
  medications: MedicationEntry[];
  ec1_first_name: string;
  ec1_last_name: string;
  ec1_relationship: string;
  ec1_phone: string;
  ec1_address: string;
  ec2_first_name: string;
  ec2_last_name: string;
  ec2_relationship: string;
  ec2_phone: string;
  ec2_address: string;

  // Step 5: Heart, Agreements & Electronic Signature
  reason_for_residency: string;
  landlord_tenant_waiver_accepted: boolean;
  twelve_step_attestation_accepted: boolean;
  electronic_signature: string;
  signature_date: string;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyMedication(): MedicationEntry {
  return {
    id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    med_name: '',
    med_dosage: '',
    med_instructions: '',
  };
}

export function createInitialIntakeData(): IntakeFormData {
  return {
    website_url: '',

    housing_program: '',
    applying_as: 'myself',
    assisting_name: '',
    assisting_relationship: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    marital_status: '',
    phone_primary: '',
    phone_work_alt: '',
    email: '',
    street_address: '',
    city: '',
    state: 'AL',
    zip_code: '',
    is_treatment_facility: false,
    move_in_type: '',
    requested_move_in_date: '',
    future_move_in_reason: '',

    is_alcoholic: '',
    last_drink_date: '',
    is_addicted_to_drugs: '',
    last_drug_use_date: '',
    substances_used: '',
    wants_to_stop: '',
    first_meeting_date: '',
    weekly_meetings_count: '',
    has_prior_treatment: '',
    treatment_provider_name: '',
    treatment_provider_phone: '',
    treatment_counselor_name: '',

    is_employed: '',
    employer_name: '',
    willing_to_get_job: '',
    job_plans: '',
    has_non_job_income: '',
    non_job_income_source: '',
    current_monthly_income: '',
    expected_next_month_income: '',

    not_sex_offender_confirmed: false,
    has_legal_issues: '',
    legal_issues_details: '',
    on_supervision: '',
    supervision_officer_name: '',
    supervision_officer_phone: '',
    has_valid_id_and_ssn_card: '',
    has_medical_doctor: '',
    doctor_name: '',
    doctor_phone: '',
    takes_prescription_meds: '',
    medications: [createEmptyMedication()],
    ec1_first_name: '',
    ec1_last_name: '',
    ec1_relationship: '',
    ec1_phone: '',
    ec1_address: '',
    ec2_first_name: '',
    ec2_last_name: '',
    ec2_relationship: '',
    ec2_phone: '',
    ec2_address: '',

    reason_for_residency: '',
    landlord_tenant_waiver_accepted: false,
    twelve_step_attestation_accepted: false,
    electronic_signature: '',
    signature_date: getTodayIsoDate(),
  };
}

export const RESIDENCE_OPTIONS: ReadonlyArray<{
  value: Exclude<HousingProgram, ''>;
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

export const MARITAL_STATUS_OPTIONS: ReadonlyArray<Exclude<MaritalStatus, ''>> = [
  'Never Married',
  'Married',
  'Separated',
  'Divorced',
];

export const US_STATES: ReadonlyArray<string> = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI',
  'WY',
];
