import { useState, useEffect, useRef } from 'react';
import {
  Lock,
  BellRing,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Phone,
  RotateCcw,
  ShieldCheck,
  Home,
  Plus,
  Trash2,
  Info,
  FlaskConical,
  Bot,
} from 'lucide-react';
import {
  createInitialIntakeData,
  createEmptyMedication,
  getTodayIsoDate,
  RESIDENCE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  US_STATES,
  type ApplyingAs,
  type ResidenceChoice,
  type YesNo,
  type IntakeFormData,
  type MedicationEntry,
} from '../types/intake';
import { DatePicker } from './DatePicker';

interface IntakeApplicationProps {
  externalPathway: { value: ApplyingAs; nonce: number } | null;
  externalResidence: { value: Exclude<ResidenceChoice, ''>; nonce: number } | null;
}

const STEP_LABELS = [
  { step: 1, title: 'Identity & Home' },
  { step: 2, title: 'Recovery History' },
  { step: 3, title: 'Work & Costs' },
  { step: 4, title: 'Care & Contacts' },
  { step: 5, title: 'Agreements & Sign' },
] as const;

type FormErrors = Partial<Record<string, string>>;

function countDigits(value: string): number {
  return value.replace(/\D/g, '').length;
}

function calculateAge(dobString: string): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString + 'T00:00:00');
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

interface YesNoButtonsProps {
  name: string;
  value: YesNo;
  onChange: (val: Exclude<YesNo, ''>) => void;
  yesLabel?: string;
  noLabel?: string;
}

function YesNoButtons({
  name,
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}: YesNoButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-xs" role="radiogroup" aria-label={name}>
      <button
        type="button"
        onClick={() => onChange('yes')}
        aria-pressed={value === 'yes'}
        className={`px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
          value === 'yes'
            ? 'bg-[#2C4A3E] border-[#2C4A3E] text-[#FAF7F2]'
            : 'bg-white border-[#E4DDD1] text-[#24201E] hover:bg-[#F2ECE1]'
        }`}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('no')}
        aria-pressed={value === 'no'}
        className={`px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
          value === 'no'
            ? 'bg-[#2C4A3E] border-[#2C4A3E] text-[#FAF7F2]'
            : 'bg-white border-[#E4DDD1] text-[#24201E] hover:bg-[#F2ECE1]'
        }`}
      >
        {noLabel}
      </button>
    </div>
  );
}

const INTAKE_ENDPOINT_URL =
  (import.meta.env.VITE_INTAKE_WEBHOOK_URL as string | undefined)?.trim() || '';

function isTestModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('test') === 'true' || window.location.search.includes('test=true');
}

function createSampleTestApplication(simulateBot: boolean): IntakeFormData {
  return {
    website_url: simulateBot ? 'https://automated-bot-check.example.com' : '',

    housing_program: 'womens',
    applying_as: 'myself',
    assisting_name: '',
    assisting_relationship: '',
    first_name: 'Jordan',
    middle_name: 'Marie',
    last_name: 'Taylor',
    date_of_birth: '1992-06-15',
    marital_status: 'Never Married',
    phone_primary: '(256) 555-0194',
    phone_work_alt: '(256) 555-0128',
    email: 'jordan.taylor.test@example.com',
    street_address: '412 Oak Ridge Lane',
    city: 'Decatur',
    state: 'AL',
    zip_code: '35601',
    is_treatment_facility: false,
    move_in_type: 'immediately',
    requested_move_in_date: '',
    future_move_in_reason: '',

    is_alcoholic: 'yes',
    last_drink_date: '2026-10-18',
    is_addicted_to_drugs: 'yes',
    last_drug_use_date: '2026-10-20',
    substances_used: 'Alcohol, Prescription Opioids',
    wants_to_stop: 'yes',
    first_meeting_date: '2026-10-24',
    weekly_meetings_count: '5',
    has_prior_treatment: 'yes',
    treatment_provider_name: 'North Alabama Recovery Center',
    treatment_provider_phone: '(256) 555-0177',
    treatment_counselor_name: 'Hannah Brooks, LPC',

    is_employed: 'no',
    employer_name: '',
    willing_to_get_job: 'yes',
    job_plans: 'Full-time food service, retail, or warehouse work in Morgan County',
    has_non_job_income: 'no',
    non_job_income_source: '',
    current_monthly_income: '0',
    expected_next_month_income: '1800',

    not_sex_offender_confirmed: true,
    has_legal_issues: 'no',
    legal_issues_details: '',
    on_supervision: 'no',
    supervision_officer_name: '',
    supervision_officer_phone: '',
    has_valid_id_and_ssn_card: 'yes',
    has_medical_doctor: 'yes',
    doctor_name: 'Dr. Sarah Mitchell',
    doctor_phone: '(256) 555-0162',
    takes_prescription_meds: 'yes',
    medications: [
      {
        id: 'test-med-1',
        med_name: 'Sertraline',
        med_dosage: '50mg',
        med_instructions: 'Once daily in the morning for anxiety',
      },
      {
        id: 'test-med-2',
        med_name: 'Lisinopril',
        med_dosage: '10mg',
        med_instructions: 'Once daily for blood pressure',
      },
    ],
    ec1_first_name: 'Rebecca',
    ec1_last_name: 'Taylor',
    ec1_relationship: 'Mother',
    ec1_phone: '(256) 555-0148',
    ec1_address: '815 Pinecrest Dr, Hartselle, AL 35640',
    ec2_first_name: 'David',
    ec2_last_name: 'Taylor',
    ec2_relationship: 'Brother',
    ec2_phone: '(256) 555-0183',
    ec2_address: '204 Cedar Ave, Decatur, AL 35601',

    reason_for_residency:
      'I am ready to break the cycle and build a steady, sober life surrounded by women who truly understand recovery. I want structure, daily 12-step meetings, and accountability so I can rebuild trust with my family.',
    landlord_tenant_waiver_accepted: true,
    twelve_step_attestation_accepted: true,
    electronic_signature: 'Jordan Marie Taylor',
    signature_date: getTodayIsoDate(),
  };
}

export function IntakeApplication({
  externalPathway,
  externalResidence,
}: IntakeApplicationProps) {
  const formCardRef = useRef<HTMLDivElement>(null);
  const [testMode] = useState<boolean>(() => isTestModeActive());
  const [formData, setFormData] = useState<IntakeFormData>(() => createInitialIntakeData());
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [highestReachedStep, setHighestReachedStep] = useState<number>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionOutcome, setSubmissionOutcome] = useState<
    'idle' | 'sent' | 'preview' | 'honeypot_blocked'
  >('idle');

  useEffect(() => {
    if (externalPathway) {
      setFormData((prev) => ({ ...prev, applying_as: externalPathway.value }));
      setIsSubmitted(false);
      setCurrentStep(1);
    }
  }, [externalPathway]);

  useEffect(() => {
    if (externalResidence) {
      setFormData((prev) => ({ ...prev, housing_program: externalResidence.value }));
      setErrors((prev) => {
        if (!prev.housing_program) return prev;
        const next = { ...prev };
        delete next.housing_program;
        return next;
      });
      setIsSubmitted(false);
      setCurrentStep(1);
    }
  }, [externalResidence]);

  const scrollFormIntoView = () => {
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateField = <K extends keyof IntakeFormData>(
    key: K,
    value: IntakeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    clearError(String(key));
  };

  const updateMedication = (
    index: number,
    field: keyof Omit<MedicationEntry, 'id'>,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      );
      return { ...prev, medications: updated };
    });
    clearError(`med_${index}_${field}`);
  };

  const addMedicationRow = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, createEmptyMedication()],
    }));
  };

  const removeMedicationRow = (index: number) => {
    setFormData((prev) => {
      if (prev.medications.length <= 1) return prev;
      return {
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index),
      };
    });
  };

  const validateStep = (step: number): boolean => {
    const nextErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.housing_program) {
        nextErrors.housing_program =
          "Please select Women's Recovery Housing (Somerville, AL) or Men's Recovery Housing — TLC Josiah House (Hartselle, AL).";
      }
      if (!formData.first_name.trim()) {
        nextErrors.first_name = 'Please enter the applicant’s first name.';
      }
      if (!formData.last_name.trim()) {
        nextErrors.last_name = 'Please enter the applicant’s last name.';
      }
      if (!formData.date_of_birth) {
        nextErrors.date_of_birth = 'Please select or enter a valid Date of Birth (MM/DD/YYYY).';
      } else {
        const age = calculateAge(formData.date_of_birth);
        if (age === null || age < 18) {
          nextErrors.date_of_birth =
            'Residency across TLC Recovery House and TLC Josiah House is for adults ages 18 and older.';
        } else if (age > 110) {
          nextErrors.date_of_birth = 'Please check the birth year entered.';
        }
      }
      if (!formData.marital_status) {
        nextErrors.marital_status = 'Please select marital status.';
      }
      if (!formData.phone_primary.trim() || countDigits(formData.phone_primary) < 10) {
        nextErrors.phone_primary = 'Please enter a 10-digit primary phone number.';
      }
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        nextErrors.email = 'That email doesn’t look quite right—or you may leave it blank.';
      }
      if (!formData.street_address.trim()) {
        nextErrors.street_address = 'Please enter your current street address (or facility address).';
      }
      if (!formData.city.trim()) {
        nextErrors.city = 'Please enter a city.';
      }
      if (!formData.state.trim()) {
        nextErrors.state = 'Please select a state.';
      }
      if (!formData.zip_code.trim() || countDigits(formData.zip_code) < 5) {
        nextErrors.zip_code = 'Please enter a 5-digit ZIP code.';
      }
      if (!formData.move_in_type) {
        nextErrors.move_in_type = 'Please let us know whether you are seeking to move in immediately or on a future date.';
      }
      if (formData.move_in_type === 'future') {
        if (!formData.requested_move_in_date) {
          nextErrors.requested_move_in_date = 'Please select your requested move-in date.';
        }
        if (!formData.future_move_in_reason.trim()) {
          nextErrors.future_move_in_reason = 'Please share a brief reason for your future move-in date.';
        }
      }
    }

    if (step === 2) {
      if (!formData.is_alcoholic) {
        nextErrors.is_alcoholic = 'Please select Yes or No.';
      }
      if (!formData.is_addicted_to_drugs) {
        nextErrors.is_addicted_to_drugs = 'Please select Yes or No.';
      }
      if (!formData.substances_used.trim()) {
        nextErrors.substances_used =
          'Please list the substance(s) used addictively (or write "Alcohol only" if applicable).';
      }
      if (!formData.wants_to_stop) {
        nextErrors.wants_to_stop = 'Please select Yes or No.';
      }
      if (!formData.has_prior_treatment) {
        nextErrors.has_prior_treatment = 'Please select Yes or No.';
      }
    }

    if (step === 3) {
      if (!formData.is_employed) {
        nextErrors.is_employed = 'Please select Yes or No.';
      }
      if (formData.is_employed === 'yes' && !formData.employer_name.trim()) {
        nextErrors.employer_name = 'Please enter your current employer name.';
      }
      if (formData.is_employed === 'no' && !formData.willing_to_get_job) {
        nextErrors.willing_to_get_job = 'Please select Yes or No.';
      }
      if (!formData.has_non_job_income) {
        nextErrors.has_non_job_income = 'Please select Yes or No.';
      }
      if (formData.has_non_job_income === 'yes' && !formData.non_job_income_source.trim()) {
        nextErrors.non_job_income_source = 'Please specify the non-job income source (e.g., SSI, SSDI, SNAP).';
      }
      if (formData.current_monthly_income === '' || Number(formData.current_monthly_income) < 0) {
        nextErrors.current_monthly_income = 'Please enter your current monthly income (enter 0 if none).';
      }
      if (
        formData.expected_next_month_income === '' ||
        Number(formData.expected_next_month_income) < 0
      ) {
        nextErrors.expected_next_month_income =
          'Please enter your expected next month’s income (enter 0 if unsure or none).';
      }
    }

    if (step === 4) {
      if (!formData.not_sex_offender_confirmed) {
        nextErrors.not_sex_offender_confirmed =
          'This eligibility confirmation is required before proceeding.';
      }
      if (!formData.has_legal_issues) {
        nextErrors.has_legal_issues = 'Please select Yes or No.';
      }
      if (!formData.on_supervision) {
        nextErrors.on_supervision = 'Please select Yes or No.';
      }
      if (formData.on_supervision === 'yes') {
        if (!formData.supervision_officer_name.trim()) {
          nextErrors.supervision_officer_name = 'Please enter your Probation, Parole, or CRO officer’s name.';
        }
        if (
          !formData.supervision_officer_phone.trim() ||
          countDigits(formData.supervision_officer_phone) < 10
        ) {
          nextErrors.supervision_officer_phone = 'Please enter a 10-digit phone number for your officer.';
        }
      }
      if (!formData.has_valid_id_and_ssn_card) {
        nextErrors.has_valid_id_and_ssn_card = 'Please select Yes or No.';
      }
      if (!formData.has_medical_doctor) {
        nextErrors.has_medical_doctor = 'Please select Yes or No.';
      }
      if (formData.has_medical_doctor === 'yes') {
        if (!formData.doctor_name.trim()) {
          nextErrors.doctor_name = 'Please enter your doctor’s name.';
        }
        if (!formData.doctor_phone.trim() || countDigits(formData.doctor_phone) < 10) {
          nextErrors.doctor_phone = 'Please enter a 10-digit phone number for your doctor.';
        }
      }
      if (!formData.takes_prescription_meds) {
        nextErrors.takes_prescription_meds = 'Please select Yes or No.';
      }
      if (formData.takes_prescription_meds === 'yes') {
        formData.medications.forEach((med, idx) => {
          if (!med.med_name.trim()) {
            nextErrors[`med_${idx}_med_name`] = 'Required';
          }
          if (!med.med_dosage.trim()) {
            nextErrors[`med_${idx}_med_dosage`] = 'Required';
          }
          if (!med.med_instructions.trim()) {
            nextErrors[`med_${idx}_med_instructions`] = 'Required';
          }
        });
      }
      if (!formData.ec1_first_name.trim()) {
        nextErrors.ec1_first_name = 'Required';
      }
      if (!formData.ec1_last_name.trim()) {
        nextErrors.ec1_last_name = 'Required';
      }
      if (!formData.ec1_relationship.trim()) {
        nextErrors.ec1_relationship = 'Required';
      }
      if (!formData.ec1_phone.trim() || countDigits(formData.ec1_phone) < 10) {
        nextErrors.ec1_phone = 'Enter 10-digit phone';
      }
      if (!formData.ec1_address.trim()) {
        nextErrors.ec1_address = 'Please enter an address for Emergency Contact 1.';
      }
    }

    if (step === 5) {
      if (!formData.reason_for_residency.trim() || formData.reason_for_residency.trim().length < 10) {
        nextErrors.reason_for_residency =
          'Please share a few sentences in your own words about why you are seeking residency.';
      }
      if (!formData.landlord_tenant_waiver_accepted) {
        nextErrors.landlord_tenant_waiver_accepted =
          'Please review and acknowledge the recovery residence terms above.';
      }
      if (!formData.twelve_step_attestation_accepted) {
        nextErrors.twelve_step_attestation_accepted =
          'Please review and check the 12-step recovery attestation above.';
      }
      if (!formData.electronic_signature.trim() || formData.electronic_signature.trim().length < 3) {
        nextErrors.electronic_signature = 'Please type your full legal name as your electronic signature.';
      }
      if (!formData.signature_date) {
        nextErrors.signature_date = 'Please confirm today’s signature date.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    const nextStep = Math.min(5, currentStep + 1);
    setCurrentStep(nextStep);
    setHighestReachedStep((prev) => Math.max(prev, nextStep));
    scrollFormIntoView();
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    scrollFormIntoView();
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setErrors({});
      setCurrentStep(targetStep);
      scrollFormIntoView();
      return;
    }
    if (targetStep <= highestReachedStep && validateStep(currentStep)) {
      setCurrentStep(targetStep);
      scrollFormIntoView();
    }
  };

  const handleFillTestApplication = () => {
    setFormData(createSampleTestApplication(false));
    setErrors({});
    setSubmitError('');
    setSubmissionOutcome('idle');
    setIsSubmitted(false);
    setHighestReachedStep(5);
  };

  const handleSimulateBot = () => {
    setFormData(createSampleTestApplication(true));
    setErrors({});
    setSubmitError('');
    setSubmissionOutcome('idle');
    setIsSubmitted(false);
    setHighestReachedStep(5);
    setCurrentStep(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Invisible Anti-Spam Honeypot Check:
    // If website_url is populated (bot detected), abort immediately with zero network/API calls
    // and display the normal Confirmation Screen so bots believe submission succeeded.
    if (formData.website_url.trim().length > 0) {
      setIsSubmitting(false);
      setSubmissionOutcome('honeypot_blocked');
      setIsSubmitted(true);
      scrollFormIntoView();
      return;
    }

    if (!validateStep(5)) return;

    // Build clean, individualized JSON payload ready for backend PDF export & WayMarkOS import
    const structuredPayload = {
      ...formData,
      website_url: formData.website_url,
      medications:
        formData.takes_prescription_meds === 'yes'
          ? formData.medications.map(({ med_name, med_dosage, med_instructions }) => ({
              med_name: med_name.trim(),
              med_dosage: med_dosage.trim(),
              med_instructions: med_instructions.trim(),
            }))
          : [],
      submitted_at: new Date().toISOString(),
    };

    setIsSubmitting(true);

    if (INTAKE_ENDPOINT_URL) {
      try {
        const response = await fetch(INTAKE_ENDPOINT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(structuredPayload),
        });
        if (!response.ok) {
          throw new Error(`Submission returned status ${response.status}`);
        }
        setIsSubmitting(false);
        setSubmissionOutcome('sent');
        setIsSubmitted(true);
        scrollFormIntoView();
      } catch {
        setIsSubmitting(false);
        setSubmitError(
          'We could not reach the application server right now. Please try again or call Crystal directly at (256) 445-0553.'
        );
      }
      return;
    }

    // Static preview mode (no VITE_INTAKE_WEBHOOK_URL configured yet)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionOutcome('preview');
      setIsSubmitted(true);
      scrollFormIntoView();
    }, 850);
  };

  const handleReset = () => {
    setFormData(createInitialIntakeData());
    setErrors({});
    setSubmitError('');
    setSubmissionOutcome('idle');
    setCurrentStep(1);
    setHighestReachedStep(1);
    setIsSubmitted(false);
    scrollFormIntoView();
  };

  const applicantFirstName = formData.first_name.trim() || 'Friend';

  const selectedResidenceOption = RESIDENCE_OPTIONS.find(
    (opt) => opt.value === formData.housing_program
  );

  const errorCount = Object.keys(errors).length;

  return (
    <section
      id="apply"
      className="bg-[#F2ECE1] border-t border-[#E4DDD1] py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold tracking-wide text-[#B85D43]">
            Official Resident Intake Application
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#24201E]">
            Take the First Quiet Step Toward Safe Housing.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#57514D] leading-relaxed">
            Applying for our Women&rsquo;s Homes in Somerville or our Men&rsquo;s Josiah House in Hartselle takes just a few minutes. Answer honestly and at your own pace.
          </p>
        </div>

        {/* Calm 3-Step Reassurance Strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E4DDD1] rounded-xl px-4 py-3.5">
            <Lock className="w-5 h-5 text-[#2C4A3E] shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-[#24201E]">
              1. Saved confidentially
            </span>
          </div>
          <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E4DDD1] rounded-xl px-4 py-3.5">
            <BellRing className="w-5 h-5 text-[#B85D43] shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-[#24201E]">
              2. Crystal notified instantly
            </span>
          </div>
          <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E4DDD1] rounded-xl px-4 py-3.5">
            <PhoneCall className="w-5 h-5 text-[#5B7B6D] shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-[#24201E]">
              3. Personal call to discuss beds
            </span>
          </div>
        </div>

        {/* Application Card */}
        <div
          ref={formCardRef}
          className="mt-8 bg-[#FAF7F2] border border-[#E4DDD1] rounded-2xl p-6 sm:p-9 shadow-[0_8px_30px_rgba(36,32,30,0.05)] scroll-mt-28"
        >
          {!isSubmitted ? (
            <>
              {/* Hidden Developer Test Mode Bar (ONLY visible when ?test=true is in URL) */}
              {testMode && (
                <div className="mb-6 bg-[#F2ECE1] border border-[#C98A3A]/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#2C4A3E] flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-[#B85D43]" aria-hidden="true" />
                      <span>Developer Test Mode (?test=true)</span>
                    </p>
                    <p className="text-xs text-[#57514D] mt-0.5">
                      Honeypot status:{' '}
                      <strong className="text-[#24201E]">
                        {formData.website_url.trim().length > 0
                          ? 'Populated (Bot Simulation Active)'
                          : 'Empty (Human Path)'}
                      </strong>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFillTestApplication}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2C4A3E] hover:bg-[#223a30] text-[#FAF7F2] text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Fill Test Application</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateBot}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#B85D43]/40 bg-white hover:bg-[#B85D43]/10 text-[#9E4B33] text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Simulate Bot (Fill Honeypot)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Bar & 5-Step Clickable Navigation */}
              <div className="pb-6 border-b border-[#E4DDD1]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#57514D] mb-2.5">
                  <span className="tabular-nums">Step {currentStep} of 5</span>
                  <span className="tabular-nums text-[#2C4A3E]">
                    {currentStep * 20}% Complete
                  </span>
                </div>

                <div
                  className="w-full h-2 bg-[#E4DDD1] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={currentStep * 20}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-[#2C4A3E] transition-transform duration-200 origin-left"
                    style={{ transform: `scaleX(${currentStep / 5})` }}
                  />
                </div>

                {/* Clickable Back-Navigation Step Buttons */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STEP_LABELS.map((item) => {
                    const isActive = item.step === currentStep;
                    const isCompleted = item.step < currentStep;
                    const canClick =
                      item.step < currentStep ||
                      (item.step <= highestReachedStep && item.step !== currentStep);

                    return (
                      <button
                        key={item.step}
                        type="button"
                        onClick={() => handleJumpToStep(item.step)}
                        disabled={!canClick && !isActive}
                        className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                          isActive
                            ? 'bg-[#2C4A3E] border-[#2C4A3E] text-[#FAF7F2]'
                            : isCompleted
                              ? 'bg-[#E6EFEA] border-[#5B7B6D]/30 text-[#2C4A3E] hover:bg-[#d7e6de] cursor-pointer'
                              : canClick
                                ? 'bg-[#F2ECE1] border-[#E4DDD1] text-[#24201E] hover:bg-[#e9e0d0] cursor-pointer'
                                : 'bg-[#FAF7F2] border-[#E4DDD1] text-[#57514D]/60 cursor-default'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        ) : (
                          <span className="tabular-nums shrink-0">{item.step}.</span>
                        )}
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="mt-7 relative" noValidate>
                {/* Invisible Anti-Spam Honeypot (never display:none; inaccessible to humans/screen readers/autofill) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                    opacity: 0,
                    pointerEvents: 'none',
                  }}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <label htmlFor="website_url">Website</label>
                  <input
                    id="website_url"
                    name="website_url"
                    type="text"
                    value={formData.website_url}
                    onChange={(e) => updateField('website_url', e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* =========================================================
                    STEP 1: RESIDENCE, IDENTITY & PRESENT ADDRESS
                   ========================================================= */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        Step 1: Residence, Identity &amp; Present Address
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        Select the appropriate residence and enter the applicant&rsquo;s legal name, contact details, and current address.
                      </p>
                    </div>

                    {/* Housing Program */}
                    <fieldset>
                      <legend className="block text-sm font-semibold text-[#24201E] mb-2">
                        Which recovery home are you applying for? *
                      </legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                        {RESIDENCE_OPTIONS.map((option) => {
                          const isSelected = formData.housing_program === option.value;
                          return (
                            <label
                              key={option.value}
                              className={`cursor-pointer flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                                isSelected
                                  ? 'bg-[#E6EFEA] border-[#2C4A3E] ring-1 ring-[#2C4A3E]'
                                  : 'bg-white border-[#E4DDD1] hover:bg-[#F2ECE1]/60'
                              }`}
                            >
                              <input
                                type="radio"
                                name="housing_program"
                                value={option.value}
                                checked={isSelected}
                                onChange={() => updateField('housing_program', option.value)}
                                className="mt-1 w-4 h-4 text-[#2C4A3E] border-[#5B7B6D] focus:ring-[#2C4A3E] shrink-0"
                              />
                              <span>
                                <span className="block text-sm font-semibold text-[#24201E] leading-snug">
                                  {option.label}
                                </span>
                                <span className="block text-xs text-[#57514D] mt-1 leading-relaxed">
                                  {option.detail}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.housing_program && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.housing_program}</span>
                        </p>
                      )}
                    </fieldset>

                    {/* Applying As */}
                    <div>
                      <span className="block text-sm font-semibold text-[#24201E] mb-2">
                        Who is completing this application?
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => updateField('applying_as', 'myself')}
                          aria-pressed={formData.applying_as === 'myself'}
                          className={`text-left px-4 py-3.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                            formData.applying_as === 'myself'
                              ? 'bg-[#E6EFEA] border-[#2C4A3E] text-[#24201E]'
                              : 'bg-white border-[#E4DDD1] text-[#57514D] hover:bg-[#F2ECE1]/60'
                          }`}
                        >
                          <span className="block text-sm font-semibold text-[#24201E]">
                            I am applying for myself
                          </span>
                          <span className="block text-xs text-[#57514D] mt-0.5">
                            Seeking a safe sober living bed for myself.
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateField('applying_as', 'assisting')}
                          aria-pressed={formData.applying_as === 'assisting'}
                          className={`text-left px-4 py-3.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                            formData.applying_as === 'assisting'
                              ? 'bg-[#E6EFEA] border-[#2C4A3E] text-[#24201E]'
                              : 'bg-white border-[#E4DDD1] text-[#57514D] hover:bg-[#F2ECE1]/60'
                          }`}
                        >
                          <span className="block text-sm font-semibold text-[#24201E]">
                            Assisting a loved one / client
                          </span>
                          <span className="block text-xs text-[#57514D] mt-0.5">
                            Family member, sponsor, caseworker, or officer.
                          </span>
                        </button>
                      </div>
                    </div>

                    {formData.applying_as === 'assisting' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F2ECE1]/70 p-4 rounded-xl border border-[#E4DDD1]">
                        <div>
                          <label htmlFor="assisting_name" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Your Name (Helper / Referral)
                          </label>
                          <input
                            id="assisting_name"
                            name="assisting_name"
                            type="text"
                            value={formData.assisting_name}
                            onChange={(e) => updateField('assisting_name', e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>
                        <div>
                          <label htmlFor="assisting_relationship" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Your Relationship / Role
                          </label>
                          <input
                            id="assisting_relationship"
                            name="assisting_relationship"
                            type="text"
                            value={formData.assisting_relationship}
                            onChange={(e) => updateField('assisting_relationship', e.target.value)}
                            placeholder="e.g. Parent, Caseworker, Probation Officer"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* Individualized Name Fields */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-5">
                      <p className="text-sm font-semibold text-[#2C4A3E]">
                        Applicant Identity
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="first_name" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            First Name *
                          </label>
                          <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            required
                            value={formData.first_name}
                            onChange={(e) => updateField('first_name', e.target.value)}
                            aria-invalid={Boolean(errors.first_name)}
                            placeholder="First name"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.first_name && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.first_name}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="middle_name" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Middle Name <span className="font-normal text-[#57514D]">(Optional)</span>
                          </label>
                          <input
                            id="middle_name"
                            name="middle_name"
                            type="text"
                            value={formData.middle_name}
                            onChange={(e) => updateField('middle_name', e.target.value)}
                            placeholder="Middle name"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>

                        <div>
                          <label htmlFor="last_name" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Last Name *
                          </label>
                          <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            required
                            value={formData.last_name}
                            onChange={(e) => updateField('last_name', e.target.value)}
                            aria-invalid={Boolean(errors.last_name)}
                            placeholder="Last name"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.last_name && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.last_name}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date_of_birth" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Date of Birth * <span className="font-normal text-[#57514D]">(MM/DD/YYYY · 18+)</span>
                          </label>
                          <DatePicker
                            id="date_of_birth"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={(iso) => updateField('date_of_birth', iso)}
                            required
                            invalid={Boolean(errors.date_of_birth)}
                            defaultViewYear={1990}
                          />
                          {errors.date_of_birth && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.date_of_birth}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="marital_status" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Marital Status *
                          </label>
                          <select
                            id="marital_status"
                            name="marital_status"
                            required
                            value={formData.marital_status}
                            onChange={(e) =>
                              updateField(
                                'marital_status',
                                e.target.value as IntakeFormData['marital_status']
                              )
                            }
                            aria-invalid={Boolean(errors.marital_status)}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          >
                            <option value="">Select marital status...</option>
                            {MARITAL_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {errors.marital_status && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.marital_status}</p>
                          )}
                        </div>
                      </div>

                      {/* Separate Phone & Email Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="phone_primary" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Primary Phone *
                          </label>
                          <input
                            id="phone_primary"
                            name="phone_primary"
                            type="tel"
                            required
                            value={formData.phone_primary}
                            onChange={(e) => updateField('phone_primary', e.target.value)}
                            aria-invalid={Boolean(errors.phone_primary)}
                            placeholder="(256) 555-0199"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.phone_primary && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.phone_primary}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="phone_work_alt" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Work / Alt Phone <span className="font-normal text-[#57514D]">(Optional)</span>
                          </label>
                          <input
                            id="phone_work_alt"
                            name="phone_work_alt"
                            type="tel"
                            value={formData.phone_work_alt}
                            onChange={(e) => updateField('phone_work_alt', e.target.value)}
                            placeholder="(256) 555-0142"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Email <span className="font-normal text-[#57514D]">(Optional)</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.email && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Separate Present Address Fields */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <p className="text-sm font-semibold text-[#2C4A3E]">
                        Present Address
                      </p>

                      <div>
                        <label htmlFor="street_address" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Street Address *
                        </label>
                        <input
                          id="street_address"
                          name="street_address"
                          type="text"
                          required
                          value={formData.street_address}
                          onChange={(e) => updateField('street_address', e.target.value)}
                          aria-invalid={Boolean(errors.street_address)}
                          placeholder="Street address, apartment, or facility name"
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                        {errors.street_address && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.street_address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-6">
                          <label htmlFor="city" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            City *
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            aria-invalid={Boolean(errors.city)}
                            placeholder="City"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.city && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.city}</p>
                          )}
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="state" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            State *
                          </label>
                          <select
                            id="state"
                            name="state"
                            required
                            value={formData.state}
                            onChange={(e) => updateField('state', e.target.value)}
                            aria-invalid={Boolean(errors.state)}
                            className="w-full px-3.5 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          >
                            {US_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          {errors.state && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.state}</p>
                          )}
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="zip_code" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            ZIP Code *
                          </label>
                          <input
                            id="zip_code"
                            name="zip_code"
                            type="text"
                            inputMode="numeric"
                            required
                            value={formData.zip_code}
                            onChange={(e) => updateField('zip_code', e.target.value)}
                            aria-invalid={Boolean(errors.zip_code)}
                            placeholder="35670"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] tabular-nums focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.zip_code && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.zip_code}</p>
                          )}
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2.5 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          name="is_treatment_facility"
                          checked={formData.is_treatment_facility}
                          onChange={(e) => updateField('is_treatment_facility', e.target.checked)}
                          className="w-4 h-4 rounded border-[#5B7B6D] text-[#2C4A3E] focus:ring-[#2C4A3E]"
                        />
                        <span className="text-sm text-[#24201E]">
                          This current address is a treatment facility
                        </span>
                      </label>
                    </div>

                    {/* Move-In Timing */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <div>
                        <span className="block text-sm font-semibold text-[#24201E] mb-2">
                          When are you hoping to move in? *
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                          <button
                            type="button"
                            onClick={() => updateField('move_in_type', 'immediately')}
                            aria-pressed={formData.move_in_type === 'immediately'}
                            className={`px-4 py-3 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                              formData.move_in_type === 'immediately'
                                ? 'bg-[#2C4A3E] border-[#2C4A3E] text-[#FAF7F2]'
                                : 'bg-white border-[#E4DDD1] text-[#24201E] hover:bg-[#F2ECE1]'
                            }`}
                          >
                            Immediately
                          </button>
                          <button
                            type="button"
                            onClick={() => updateField('move_in_type', 'future')}
                            aria-pressed={formData.move_in_type === 'future'}
                            className={`px-4 py-3 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                              formData.move_in_type === 'future'
                                ? 'bg-[#2C4A3E] border-[#2C4A3E] text-[#FAF7F2]'
                                : 'bg-white border-[#E4DDD1] text-[#24201E] hover:bg-[#F2ECE1]'
                            }`}
                          >
                            Future Date
                          </button>
                        </div>
                        {errors.move_in_type && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.move_in_type}</p>
                        )}
                      </div>

                      {formData.move_in_type === 'future' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F2ECE1]/70 p-4 rounded-xl border border-[#E4DDD1]">
                          <div>
                            <label htmlFor="requested_move_in_date" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                              Requested Move-In Date *
                            </label>
                            <DatePicker
                              id="requested_move_in_date"
                              name="requested_move_in_date"
                              value={formData.requested_move_in_date}
                              onChange={(iso) => updateField('requested_move_in_date', iso)}
                              required
                              invalid={Boolean(errors.requested_move_in_date)}
                            />
                            {errors.requested_move_in_date && (
                              <p className="mt-1.5 text-xs text-[#9E4B33]">
                                {errors.requested_move_in_date}
                              </p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="future_move_in_reason" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                              Reason for Future Date *
                            </label>
                            <input
                              id="future_move_in_reason"
                              name="future_move_in_reason"
                              type="text"
                              required
                              value={formData.future_move_in_reason}
                              onChange={(e) => updateField('future_move_in_reason', e.target.value)}
                              aria-invalid={Boolean(errors.future_move_in_reason)}
                              placeholder="e.g. Completing inpatient treatment on that date"
                              className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                            />
                            {errors.future_move_in_reason && (
                              <p className="mt-1.5 text-xs text-[#9E4B33]">
                                {errors.future_move_in_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* =========================================================
                    STEP 2: RECOVERY & TREATMENT HISTORY
                   ========================================================= */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        Step 2: Recovery &amp; Treatment History
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        There is zero judgment here. Honest answers help Crystal plan a safe, supportive transition into the house.
                      </p>
                    </div>

                    {/* Alcoholic + Last Drink Date */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-[#24201E]">
                        Are you an alcoholic? *
                      </label>
                      <YesNoButtons
                        name="is_alcoholic"
                        value={formData.is_alcoholic}
                        onChange={(val) => updateField('is_alcoholic', val)}
                      />
                      {errors.is_alcoholic && (
                        <p className="text-xs text-[#9E4B33]">{errors.is_alcoholic}</p>
                      )}

                      {formData.is_alcoholic === 'yes' && (
                        <div className="max-w-xs pt-1">
                          <label htmlFor="last_drink_date" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Date of Last Drink (MM/DD/YYYY)
                          </label>
                          <DatePicker
                            id="last_drink_date"
                            name="last_drink_date"
                            value={formData.last_drink_date}
                            onChange={(iso) => updateField('last_drink_date', iso)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Drug Addiction + Last Drug Use Date */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-3">
                      <label className="block text-sm font-semibold text-[#24201E]">
                        Are you addicted to drugs? *
                      </label>
                      <YesNoButtons
                        name="is_addicted_to_drugs"
                        value={formData.is_addicted_to_drugs}
                        onChange={(val) => updateField('is_addicted_to_drugs', val)}
                      />
                      {errors.is_addicted_to_drugs && (
                        <p className="text-xs text-[#9E4B33]">{errors.is_addicted_to_drugs}</p>
                      )}

                      {formData.is_addicted_to_drugs === 'yes' && (
                        <div className="max-w-xs pt-1">
                          <label htmlFor="last_drug_use_date" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Date of Last Drug Use (MM/DD/YYYY)
                          </label>
                          <DatePicker
                            id="last_drug_use_date"
                            name="last_drug_use_date"
                            value={formData.last_drug_use_date}
                            onChange={(iso) => updateField('last_drug_use_date', iso)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Substances Used */}
                    <div className="pt-4 border-t border-[#E4DDD1]">
                      <label htmlFor="substances_used" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                        Substances Used Addictively *
                      </label>
                      <input
                        id="substances_used"
                        name="substances_used"
                        type="text"
                        required
                        value={formData.substances_used}
                        onChange={(e) => updateField('substances_used', e.target.value)}
                        aria-invalid={Boolean(errors.substances_used)}
                        placeholder="e.g., Alcohol, Methamphetamine, Opioids"
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                      />
                      {errors.substances_used && (
                        <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.substances_used}</p>
                      )}
                    </div>

                    {/* Wants to stop */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-2">
                      <label className="block text-sm font-semibold text-[#24201E]">
                        Do you want to stop drinking alcohol and using addictive drugs? *
                      </label>
                      <YesNoButtons
                        name="wants_to_stop"
                        value={formData.wants_to_stop}
                        onChange={(val) => updateField('wants_to_stop', val)}
                      />
                      {errors.wants_to_stop && (
                        <p className="text-xs text-[#9E4B33]">{errors.wants_to_stop}</p>
                      )}
                    </div>

                    {/* AA / NA Meeting History */}
                    <div className="pt-4 border-t border-[#E4DDD1] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_meeting_date" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          When did you attend your first AA or NA meeting? <span className="font-normal text-[#57514D]">(Optional)</span>
                        </label>
                        <DatePicker
                          id="first_meeting_date"
                          name="first_meeting_date"
                          value={formData.first_meeting_date}
                          onChange={(iso) => updateField('first_meeting_date', iso)}
                        />
                      </div>

                      <div>
                        <label htmlFor="weekly_meetings_count" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          How many AA/NA meetings do you currently attend each week?
                        </label>
                        <input
                          id="weekly_meetings_count"
                          name="weekly_meetings_count"
                          type="number"
                          min={0}
                          max={30}
                          value={formData.weekly_meetings_count}
                          onChange={(e) => updateField('weekly_meetings_count', e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] tabular-nums focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                      </div>
                    </div>

                    {/* Prior Treatment History */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#24201E] mb-2">
                          Have you ever been to a treatment facility for alcoholism and/or drug addiction? *
                        </label>
                        <YesNoButtons
                          name="has_prior_treatment"
                          value={formData.has_prior_treatment}
                          onChange={(val) => updateField('has_prior_treatment', val)}
                        />
                        {errors.has_prior_treatment && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.has_prior_treatment}</p>
                        )}
                      </div>

                      {formData.has_prior_treatment === 'yes' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F2ECE1]/70 p-4 rounded-xl border border-[#E4DDD1]">
                          <div>
                            <label htmlFor="treatment_provider_name" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                              Treatment Provider Name
                            </label>
                            <input
                              id="treatment_provider_name"
                              name="treatment_provider_name"
                              type="text"
                              value={formData.treatment_provider_name}
                              onChange={(e) => updateField('treatment_provider_name', e.target.value)}
                              placeholder="Facility name"
                              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                            />
                          </div>

                          <div>
                            <label htmlFor="treatment_provider_phone" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                              Treatment Provider Phone
                            </label>
                            <input
                              id="treatment_provider_phone"
                              name="treatment_provider_phone"
                              type="tel"
                              value={formData.treatment_provider_phone}
                              onChange={(e) => updateField('treatment_provider_phone', e.target.value)}
                              placeholder="(256) 555-0100"
                              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                            />
                          </div>

                          <div>
                            <label htmlFor="treatment_counselor_name" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                              Counselor Name
                            </label>
                            <input
                              id="treatment_counselor_name"
                              name="treatment_counselor_name"
                              type="text"
                              value={formData.treatment_counselor_name}
                              onChange={(e) => updateField('treatment_counselor_name', e.target.value)}
                              placeholder="Counselor full name"
                              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* =========================================================
                    STEP 3: EMPLOYMENT, INCOME & PROGRAM COSTS
                   ========================================================= */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        Step 3: Employment, Income &amp; Program Costs
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        We share program fees openly up front so there are never surprises.
                      </p>
                    </div>

                    {/* Calm Program Costs Summary Card */}
                    <div className="bg-[#E6EFEA]/75 border border-[#5B7B6D]/30 rounded-xl p-5 space-y-2">
                      <p className="text-xs font-semibold tracking-wide text-[#2C4A3E]">
                        Transparent Program Rates
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-[#24201E] leading-relaxed">
                        $250 non-refundable entry fee upon arrival; $250/week rent ($175/week for Disability clients), due every Friday.
                      </p>
                      <p className="text-sm italic text-[#2C4A3E]">
                        &ldquo;Our priority is recovery; please discuss any financial difficulties with staff.&rdquo;
                      </p>
                    </div>

                    {/* Employment Status */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#24201E] mb-2">
                          Are you currently employed? *
                        </label>
                        <YesNoButtons
                          name="is_employed"
                          value={formData.is_employed}
                          onChange={(val) => updateField('is_employed', val)}
                        />
                        {errors.is_employed && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.is_employed}</p>
                        )}
                      </div>

                      {formData.is_employed === 'yes' && (
                        <div>
                          <label htmlFor="employer_name" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Current Employer Name *
                          </label>
                          <input
                            id="employer_name"
                            name="employer_name"
                            type="text"
                            required
                            value={formData.employer_name}
                            onChange={(e) => updateField('employer_name', e.target.value)}
                            aria-invalid={Boolean(errors.employer_name)}
                            placeholder="Company or employer name"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.employer_name && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.employer_name}</p>
                          )}
                        </div>
                      )}

                      {formData.is_employed === 'no' && (
                        <div className="space-y-4 bg-[#F2ECE1]/70 p-4 rounded-xl border border-[#E4DDD1]">
                          <div>
                            <label className="block text-sm font-semibold text-[#24201E] mb-2">
                              Are you willing and able to get a job? *
                            </label>
                            <YesNoButtons
                              name="willing_to_get_job"
                              value={formData.willing_to_get_job}
                              onChange={(val) => updateField('willing_to_get_job', val)}
                            />
                            {errors.willing_to_get_job && (
                              <p className="mt-1.5 text-xs text-[#9E4B33]">
                                {errors.willing_to_get_job}
                              </p>
                            )}
                          </div>

                          {formData.willing_to_get_job === 'yes' && (
                            <div>
                              <label htmlFor="job_plans" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                                Job Plans or Type of Work Sought
                              </label>
                              <input
                                id="job_plans"
                                name="job_plans"
                                type="text"
                                value={formData.job_plans}
                                onChange={(e) => updateField('job_plans', e.target.value)}
                                placeholder="e.g., Restaurant, warehouse, retail, trades, open to anything"
                                className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Non-Job Income */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#24201E] mb-2">
                          Are you receiving welfare, disability, or other non-job income? *
                        </label>
                        <YesNoButtons
                          name="has_non_job_income"
                          value={formData.has_non_job_income}
                          onChange={(val) => updateField('has_non_job_income', val)}
                        />
                        {errors.has_non_job_income && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.has_non_job_income}</p>
                        )}
                      </div>

                      {formData.has_non_job_income === 'yes' && (
                        <div>
                          <label htmlFor="non_job_income_source" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Non-Job Income Source *
                          </label>
                          <input
                            id="non_job_income_source"
                            name="non_job_income_source"
                            type="text"
                            required
                            value={formData.non_job_income_source}
                            onChange={(e) => updateField('non_job_income_source', e.target.value)}
                            aria-invalid={Boolean(errors.non_job_income_source)}
                            placeholder="e.g., SSI, SSDI, SNAP, Child Support"
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.non_job_income_source && (
                            <p className="mt-1.5 text-xs text-[#9E4B33]">
                              {errors.non_job_income_source}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Monthly Income Numbers */}
                    <div className="pt-4 border-t border-[#E4DDD1] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="current_monthly_income" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Current Monthly Income ($) *
                        </label>
                        <div className="relative">
                          <span
                            aria-hidden="true"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#57514D]"
                          >
                            $
                          </span>
                          <input
                            id="current_monthly_income"
                            name="current_monthly_income"
                            type="number"
                            min={0}
                            step="any"
                            required
                            value={formData.current_monthly_income}
                            onChange={(e) => updateField('current_monthly_income', e.target.value)}
                            aria-invalid={Boolean(errors.current_monthly_income)}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] tabular-nums focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>
                        {errors.current_monthly_income && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">
                            {errors.current_monthly_income}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="expected_next_month_income" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Expected Next Month&rsquo;s Income ($) *
                        </label>
                        <div className="relative">
                          <span
                            aria-hidden="true"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#57514D]"
                          >
                            $
                          </span>
                          <input
                            id="expected_next_month_income"
                            name="expected_next_month_income"
                            type="number"
                            min={0}
                            step="any"
                            required
                            value={formData.expected_next_month_income}
                            onChange={(e) =>
                              updateField('expected_next_month_income', e.target.value)
                            }
                            aria-invalid={Boolean(errors.expected_next_month_income)}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] tabular-nums focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>
                        {errors.expected_next_month_income && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">
                            {errors.expected_next_month_income}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================
                    STEP 4: MEDICAL, MEDICATIONS, LEGAL & EMERGENCY CONTACTS
                   ========================================================= */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        Step 4: Medical, Medications, Legal &amp; Emergency Contacts
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        Helps us keep every resident safe, coordinate with supervision officers if applicable, and know who to call in an emergency.
                      </p>
                    </div>

                    {/* Mandatory Eligibility Confirmation */}
                    <div className="bg-[#F2ECE1] border border-[#E4DDD1] rounded-xl p-4 sm:p-5">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="not_sex_offender_confirmed"
                          checked={formData.not_sex_offender_confirmed}
                          onChange={(e) =>
                            updateField('not_sex_offender_confirmed', e.target.checked)
                          }
                          aria-invalid={Boolean(errors.not_sex_offender_confirmed)}
                          className="mt-1 w-5 h-5 rounded border-[#5B7B6D] text-[#2C4A3E] focus:ring-[#2C4A3E] shrink-0"
                        />
                        <span className="text-sm text-[#24201E] leading-relaxed">
                          <strong className="font-semibold">Residency Eligibility Confirmation *:</strong>{' '}
                          I confirm that I am NOT a registered sex offender (TLC Recovery House cannot accept sex offenders).
                        </span>
                      </label>
                      {errors.not_sex_offender_confirmed && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.not_sex_offender_confirmed}</span>
                        </p>
                      )}
                    </div>

                    {/* Legal Issues */}
                    <div className="pt-2 space-y-3">
                      <label className="block text-sm font-semibold text-[#24201E]">
                        Do you have any current legal issues or pending court dates? *
                      </label>
                      <YesNoButtons
                        name="has_legal_issues"
                        value={formData.has_legal_issues}
                        onChange={(val) => updateField('has_legal_issues', val)}
                      />
                      {errors.has_legal_issues && (
                        <p className="text-xs text-[#9E4B33]">{errors.has_legal_issues}</p>
                      )}

                      {formData.has_legal_issues === 'yes' && (
                        <div>
                          <label htmlFor="legal_issues_details" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Briefly describe pending charges, court dates, or requirements
                          </label>
                          <textarea
                            id="legal_issues_details"
                            name="legal_issues_details"
                            rows={2}
                            value={formData.legal_issues_details}
                            onChange={(e) => updateField('legal_issues_details', e.target.value)}
                            placeholder="County, upcoming court date, or brief notes"
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>
                      )}
                    </div>

                    {/* Probation / Parole / CRO */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#24201E] mb-2">
                          Are you on Probation, Parole, or CRO? *
                        </label>
                        <YesNoButtons
                          name="on_supervision"
                          value={formData.on_supervision}
                          onChange={(val) => updateField('on_supervision', val)}
                        />
                        {errors.on_supervision && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.on_supervision}</p>
                        )}
                      </div>

                      {formData.on_supervision === 'yes' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F2ECE1]/70 p-4 rounded-xl border border-[#E4DDD1]">
                          <div>
                            <label htmlFor="supervision_officer_name" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                              Supervision Officer Name *
                            </label>
                            <input
                              id="supervision_officer_name"
                              name="supervision_officer_name"
                              type="text"
                              required
                              value={formData.supervision_officer_name}
                              onChange={(e) =>
                                updateField('supervision_officer_name', e.target.value)
                              }
                              aria-invalid={Boolean(errors.supervision_officer_name)}
                              placeholder="Officer full name"
                              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                            />
                            {errors.supervision_officer_name && (
                              <p className="mt-1 text-xs text-[#9E4B33]">
                                {errors.supervision_officer_name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="supervision_officer_phone" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                              Supervision Officer Phone *
                            </label>
                            <input
                              id="supervision_officer_phone"
                              name="supervision_officer_phone"
                              type="tel"
                              required
                              value={formData.supervision_officer_phone}
                              onChange={(e) =>
                                updateField('supervision_officer_phone', e.target.value)
                              }
                              aria-invalid={Boolean(errors.supervision_officer_phone)}
                              placeholder="(256) 555-0180"
                              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                            />
                            {errors.supervision_officer_phone && (
                              <p className="mt-1 text-xs text-[#9E4B33]">
                                {errors.supervision_officer_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security-Safe ID Check */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-3">
                      <label className="block text-sm font-semibold text-[#24201E]">
                        Do you have a valid Driver&rsquo;s License / Photo ID and Social Security Card available for in-person verification? *
                      </label>
                      <YesNoButtons
                        name="has_valid_id_and_ssn_card"
                        value={formData.has_valid_id_and_ssn_card}
                        onChange={(val) => updateField('has_valid_id_and_ssn_card', val)}
                      />
                      {errors.has_valid_id_and_ssn_card && (
                        <p className="text-xs text-[#9E4B33]">{errors.has_valid_id_and_ssn_card}</p>
                      )}
                      <div className="flex items-start gap-2 text-xs text-[#2C4A3E] bg-[#E6EFEA]/70 border border-[#5B7B6D]/25 rounded-lg p-3">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#2C4A3E]" aria-hidden="true" />
                        <span>
                          For your protection, never enter your SSN or Driver&rsquo;s License number online; staff verify documents privately at intake.
                        </span>
                      </div>
                    </div>

                    {/* Medical Doctor */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#24201E] mb-2">
                          Do you currently have a medical doctor? *
                        </label>
                        <YesNoButtons
                          name="has_medical_doctor"
                          value={formData.has_medical_doctor}
                          onChange={(val) => updateField('has_medical_doctor', val)}
                        />
                        {errors.has_medical_doctor && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.has_medical_doctor}</p>
                        )}
                      </div>

                      {formData.has_medical_doctor === 'yes' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F2ECE1]/70 p-4 rounded-xl border border-[#E4DDD1]">
                          <div>
                            <label htmlFor="doctor_name" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                              Doctor&rsquo;s Name *
                            </label>
                            <input
                              id="doctor_name"
                              name="doctor_name"
                              type="text"
                              required
                              value={formData.doctor_name}
                              onChange={(e) => updateField('doctor_name', e.target.value)}
                              aria-invalid={Boolean(errors.doctor_name)}
                              placeholder="Dr. Full Name"
                              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                            />
                            {errors.doctor_name && (
                              <p className="mt-1 text-xs text-[#9E4B33]">{errors.doctor_name}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="doctor_phone" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                              Doctor&rsquo;s Phone *
                            </label>
                            <input
                              id="doctor_phone"
                              name="doctor_phone"
                              type="tel"
                              required
                              value={formData.doctor_phone}
                              onChange={(e) => updateField('doctor_phone', e.target.value)}
                              aria-invalid={Boolean(errors.doctor_phone)}
                              placeholder="(256) 555-0122"
                              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                            />
                            {errors.doctor_phone && (
                              <p className="mt-1 text-xs text-[#9E4B33]">{errors.doctor_phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dynamic Prescription Medications List */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#24201E] mb-2">
                          Do you take any prescription medications? *
                        </label>
                        <YesNoButtons
                          name="takes_prescription_meds"
                          value={formData.takes_prescription_meds}
                          onChange={(val) => updateField('takes_prescription_meds', val)}
                        />
                        {errors.takes_prescription_meds && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">
                            {errors.takes_prescription_meds}
                          </p>
                        )}
                      </div>

                      {formData.takes_prescription_meds === 'yes' && (
                        <div className="space-y-3">
                          {formData.medications.map((med, idx) => (
                            <div
                              key={med.id}
                              className="bg-[#F2ECE1]/70 border border-[#E4DDD1] rounded-xl p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-[#2C4A3E] tabular-nums">
                                  Medication #{idx + 1}
                                </span>
                                {formData.medications.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeMedicationRow(idx)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#9E4B33] hover:underline"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor={`med_name_${idx}`}
                                    className="block text-xs font-semibold text-[#24201E] mb-1"
                                  >
                                    Medication Name *
                                  </label>
                                  <input
                                    id={`med_name_${idx}`}
                                    type="text"
                                    required
                                    value={med.med_name}
                                    onChange={(e) =>
                                      updateMedication(idx, 'med_name', e.target.value)
                                    }
                                    aria-invalid={Boolean(errors[`med_${idx}_med_name`])}
                                    placeholder="e.g., Lisinopril"
                                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-sm text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                                  />
                                  {errors[`med_${idx}_med_name`] && (
                                    <p className="mt-1 text-xs text-[#9E4B33]">
                                      {errors[`med_${idx}_med_name`]}
                                    </p>
                                  )}
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor={`med_dosage_${idx}`}
                                    className="block text-xs font-semibold text-[#24201E] mb-1"
                                  >
                                    Dosage *
                                  </label>
                                  <input
                                    id={`med_dosage_${idx}`}
                                    type="text"
                                    required
                                    value={med.med_dosage}
                                    onChange={(e) =>
                                      updateMedication(idx, 'med_dosage', e.target.value)
                                    }
                                    aria-invalid={Boolean(errors[`med_${idx}_med_dosage`])}
                                    placeholder="e.g., 10mg"
                                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-sm text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                                  />
                                  {errors[`med_${idx}_med_dosage`] && (
                                    <p className="mt-1 text-xs text-[#9E4B33]">
                                      {errors[`med_${idx}_med_dosage`]}
                                    </p>
                                  )}
                                </div>

                                <div className="sm:col-span-5">
                                  <label
                                    htmlFor={`med_instructions_${idx}`}
                                    className="block text-xs font-semibold text-[#24201E] mb-1"
                                  >
                                    Instructions &amp; Reason Prescribed *
                                  </label>
                                  <input
                                    id={`med_instructions_${idx}`}
                                    type="text"
                                    required
                                    value={med.med_instructions}
                                    onChange={(e) =>
                                      updateMedication(idx, 'med_instructions', e.target.value)
                                    }
                                    aria-invalid={Boolean(errors[`med_${idx}_med_instructions`])}
                                    placeholder="e.g., Once daily for blood pressure"
                                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-sm text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                                  />
                                  {errors[`med_${idx}_med_instructions`] && (
                                    <p className="mt-1 text-xs text-[#9E4B33]">
                                      {errors[`med_${idx}_med_instructions`]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addMedicationRow}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#2C4A3E]/30 bg-white hover:bg-[#E6EFEA] text-xs sm:text-sm font-semibold text-[#2C4A3E] transition-colors"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                            <span>Add Another Medication</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Emergency Contact 1 (Required) */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <p className="text-sm font-semibold text-[#2C4A3E]">
                        Emergency Contact 1 (Required)
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="ec1_first_name" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                            First Name *
                          </label>
                          <input
                            id="ec1_first_name"
                            name="ec1_first_name"
                            type="text"
                            required
                            value={formData.ec1_first_name}
                            onChange={(e) => updateField('ec1_first_name', e.target.value)}
                            aria-invalid={Boolean(errors.ec1_first_name)}
                            placeholder="First name"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.ec1_first_name && (
                            <p className="mt-1 text-xs text-[#9E4B33]">{errors.ec1_first_name}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="ec1_last_name" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                            Last Name *
                          </label>
                          <input
                            id="ec1_last_name"
                            name="ec1_last_name"
                            type="text"
                            required
                            value={formData.ec1_last_name}
                            onChange={(e) => updateField('ec1_last_name', e.target.value)}
                            aria-invalid={Boolean(errors.ec1_last_name)}
                            placeholder="Last name"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.ec1_last_name && (
                            <p className="mt-1 text-xs text-[#9E4B33]">{errors.ec1_last_name}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="ec1_relationship" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                            Relationship *
                          </label>
                          <input
                            id="ec1_relationship"
                            name="ec1_relationship"
                            type="text"
                            required
                            value={formData.ec1_relationship}
                            onChange={(e) => updateField('ec1_relationship', e.target.value)}
                            aria-invalid={Boolean(errors.ec1_relationship)}
                            placeholder="e.g., Mother, Brother, Sponsor"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.ec1_relationship && (
                            <p className="mt-1 text-xs text-[#9E4B33]">{errors.ec1_relationship}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="ec1_phone" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            id="ec1_phone"
                            name="ec1_phone"
                            type="tel"
                            required
                            value={formData.ec1_phone}
                            onChange={(e) => updateField('ec1_phone', e.target.value)}
                            aria-invalid={Boolean(errors.ec1_phone)}
                            placeholder="(256) 555-0144"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.ec1_phone && (
                            <p className="mt-1 text-xs text-[#9E4B33]">{errors.ec1_phone}</p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="ec1_address" className="block text-xs font-semibold text-[#24201E] mb-1.5">
                            Mailing Address *
                          </label>
                          <input
                            id="ec1_address"
                            name="ec1_address"
                            type="text"
                            required
                            value={formData.ec1_address}
                            onChange={(e) => updateField('ec1_address', e.target.value)}
                            aria-invalid={Boolean(errors.ec1_address)}
                            placeholder="Street, City, State, ZIP"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.ec1_address && (
                            <p className="mt-1 text-xs text-[#9E4B33]">{errors.ec1_address}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact 2 (Optional) */}
                    <div className="pt-4 border-t border-[#E4DDD1] space-y-4">
                      <p className="text-sm font-semibold text-[#57514D]">
                        Emergency Contact 2 <span className="font-normal">(Optional)</span>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="ec2_first_name" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            First Name
                          </label>
                          <input
                            id="ec2_first_name"
                            name="ec2_first_name"
                            type="text"
                            value={formData.ec2_first_name}
                            onChange={(e) => updateField('ec2_first_name', e.target.value)}
                            placeholder="First name"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>

                        <div>
                          <label htmlFor="ec2_last_name" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Last Name
                          </label>
                          <input
                            id="ec2_last_name"
                            name="ec2_last_name"
                            type="text"
                            value={formData.ec2_last_name}
                            onChange={(e) => updateField('ec2_last_name', e.target.value)}
                            placeholder="Last name"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>

                        <div>
                          <label htmlFor="ec2_relationship" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Relationship
                          </label>
                          <input
                            id="ec2_relationship"
                            name="ec2_relationship"
                            type="text"
                            value={formData.ec2_relationship}
                            onChange={(e) => updateField('ec2_relationship', e.target.value)}
                            placeholder="e.g., Sister, Father, Friend"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>

                        <div>
                          <label htmlFor="ec2_phone" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Phone Number
                          </label>
                          <input
                            id="ec2_phone"
                            name="ec2_phone"
                            type="tel"
                            value={formData.ec2_phone}
                            onChange={(e) => updateField('ec2_phone', e.target.value)}
                            placeholder="(256) 555-0192"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="ec2_address" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Mailing Address
                          </label>
                          <input
                            id="ec2_address"
                            name="ec2_address"
                            type="text"
                            value={formData.ec2_address}
                            onChange={(e) => updateField('ec2_address', e.target.value)}
                            placeholder="Street, City, State, ZIP"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================
                    STEP 5: HEART, AGREEMENTS & ELECTRONIC SIGNATURE
                   ========================================================= */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        Step 5: Heart, Agreements &amp; Electronic Signature
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        Speak from the heart and confirm your commitment to a 12-step, substance-free recovery home.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="reason_for_residency" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                        Why are you seeking residency at TLC Recovery House? *
                      </label>
                      <textarea
                        id="reason_for_residency"
                        name="reason_for_residency"
                        rows={5}
                        required
                        value={formData.reason_for_residency}
                        onChange={(e) => updateField('reason_for_residency', e.target.value)}
                        aria-invalid={Boolean(errors.reason_for_residency)}
                        placeholder="Share what you are hoping for in this next chapter, and anything else you want Crystal to know..."
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                      />
                      {errors.reason_for_residency && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.reason_for_residency}</span>
                        </p>
                      )}
                    </div>

                    {/* Agreement 1: Landlord-Tenant Waiver */}
                    <div className="bg-[#F2ECE1] border border-[#E4DDD1] rounded-xl p-4 sm:p-5">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="landlord_tenant_waiver_accepted"
                          checked={formData.landlord_tenant_waiver_accepted}
                          onChange={(e) =>
                            updateField('landlord_tenant_waiver_accepted', e.target.checked)
                          }
                          aria-invalid={Boolean(errors.landlord_tenant_waiver_accepted)}
                          className="mt-1 w-5 h-5 rounded border-[#5B7B6D] text-[#2C4A3E] focus:ring-[#2C4A3E] shrink-0"
                        />
                        <span className="text-sm text-[#24201E] leading-relaxed">
                          <strong className="font-semibold">Recovery Residence Terms *:</strong>{' '}
                          I realize that TLC Recovery House (A) prohibits all residents from using any alcohol or illegal drugs, (B) may expel any resident who violates rules. In accepting these terms, I exclude myself from the normal due process afforded by local landlord-tenant laws.
                        </span>
                      </label>
                      {errors.landlord_tenant_waiver_accepted && (
                        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.landlord_tenant_waiver_accepted}</span>
                        </p>
                      )}
                    </div>

                    {/* Agreement 2: 12-Step Attestation */}
                    <div className="bg-[#F2ECE1] border border-[#E4DDD1] rounded-xl p-4 sm:p-5">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="twelve_step_attestation_accepted"
                          checked={formData.twelve_step_attestation_accepted}
                          onChange={(e) =>
                            updateField('twelve_step_attestation_accepted', e.target.checked)
                          }
                          aria-invalid={Boolean(errors.twelve_step_attestation_accepted)}
                          className="mt-1 w-5 h-5 rounded border-[#5B7B6D] text-[#2C4A3E] focus:ring-[#2C4A3E] shrink-0"
                        />
                        <span className="text-sm text-[#24201E] leading-relaxed">
                          <strong className="font-semibold">12-Step Recovery Attestation *:</strong>{' '}
                          I have read and understand all of the material on this application form and answered each question honestly. I want to achieve recovery from alcoholism and drug addiction. I am willing to work an active 12-step program by getting a sponsor, going to NA/AA/CR meetings, and working the steps of recovery. I agree to follow the guidelines set forth by TLC Recovery House.
                        </span>
                      </label>
                      {errors.twelve_step_attestation_accepted && (
                        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.twelve_step_attestation_accepted}</span>
                        </p>
                      )}
                    </div>

                    {/* Electronic Signature & Date */}
                    <div className="pt-4 border-t border-[#E4DDD1] grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-7">
                        <label htmlFor="electronic_signature" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Electronic Signature (Type Full Legal Name) *
                        </label>
                        <input
                          id="electronic_signature"
                          name="electronic_signature"
                          type="text"
                          required
                          value={formData.electronic_signature}
                          onChange={(e) => updateField('electronic_signature', e.target.value)}
                          aria-invalid={Boolean(errors.electronic_signature)}
                          placeholder="Full legal name"
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] font-serif italic text-lg text-[#24201E] placeholder:font-sans placeholder:not-italic placeholder:text-sm placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                        {errors.electronic_signature && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">
                            {errors.electronic_signature}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-5">
                        <label htmlFor="signature_date" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Signature Date *
                        </label>
                        <DatePicker
                          id="signature_date"
                          name="signature_date"
                          value={formData.signature_date}
                          onChange={(iso) => updateField('signature_date', iso)}
                          required
                          invalid={Boolean(errors.signature_date)}
                        />
                        {errors.signature_date && (
                          <p className="mt-1.5 text-xs text-[#9E4B33]">{errors.signature_date}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Gentle Step Error Summary */}
                {errorCount > 0 && (
                  <div
                    role="alert"
                    className="mt-6 flex items-center gap-2.5 text-sm font-medium text-[#9E4B33] bg-[#B85D43]/10 border border-[#B85D43]/30 rounded-xl px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      Please complete the highlighted {errorCount === 1 ? 'field' : `${errorCount} fields`} above before continuing.
                    </span>
                  </div>
                )}

                {submitError && (
                  <div
                    role="alert"
                    className="mt-4 flex items-center gap-2.5 text-sm font-medium text-[#9E4B33] bg-[#B85D43]/10 border border-[#B85D43]/30 rounded-xl px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Navigation Controls */}
                <div className="mt-8 pt-6 border-t border-[#E4DDD1] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#E4DDD1] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#24201E] text-sm font-semibold transition-colors whitespace-nowrap"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div className="text-xs text-[#57514D]">
                      Fields marked with * are needed so Crystal can review bed availability safely.
                    </div>
                  )}

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#2C4A3E] hover:bg-[#223a30] text-[#FAF7F2] text-sm sm:text-base font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2C4A3E]"
                    >
                      <span>Continue to Step {currentStep + 1}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#B85D43] hover:bg-[#9E4B33] disabled:opacity-75 text-[#FAF7F2] text-sm sm:text-base font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B85D43]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          <span>Sending Confidentially...</span>
                        </>
                      ) : (
                        <>
                          <span>Send My Application Confidentially</span>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Dark-Forest Privacy & Confidentiality Reassurance Note */}
                <div className="mt-6 bg-[#2C4A3E] text-[#FAF7F2] rounded-xl p-4 sm:p-5 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#C98A3A] shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs sm:text-sm text-[#E6EFEA] leading-relaxed">
                    <strong className="font-semibold text-[#FAF7F2]">Privacy &amp; Confidentiality:</strong>{' '}
                    Your application is treated with strict care and reviewed solely by Founder &amp; Director Crystal Steelman and TLC leadership for residency placement. We never collect Social Security or Driver&rsquo;s License numbers online, and we never share your personal story with outside parties without your consent.
                  </p>
                </div>
              </form>
            </>
          ) : (
            /* Warm, Encouraging Confirmation Screen */
            <div className="py-6 sm:py-8 text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#E6EFEA] text-[#2C4A3E] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" aria-hidden="true" />
              </div>

              <h3 className="mt-5 font-serif text-3xl font-semibold text-[#24201E]">
                Thank You, {applicantFirstName}. We&rsquo;re Glad You Reached Out.
              </h3>

              {selectedResidenceOption && (
                <div className="mt-5 bg-[#E6EFEA]/70 border border-[#5B7B6D]/30 rounded-xl px-4 py-3.5 text-left flex items-start gap-3">
                  <Home className="w-5 h-5 text-[#2C4A3E] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-[#5B7B6D]">
                      Residence Requested
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-[#24201E] mt-0.5">
                      {selectedResidenceOption.label}
                    </p>
                  </div>
                </div>
              )}

              <p className="mt-4 text-base text-[#57514D] leading-relaxed">
                Asking for help takes real courage. Crystal Steelman will review your application and reach out personally
                {formData.phone_primary ? (
                  <>
                    {' '}at <strong className="text-[#24201E]">{formData.phone_primary}</strong>
                  </>
                ) : null}{' '}
                to talk through current bed openings, answer your questions, and take the next step together.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="tel:+12564450553"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#B85D43] hover:bg-[#9E4B33] text-[#FAF7F2] text-sm sm:text-base font-semibold transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>Call Crystal Now: (256) 445-0553</span>
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg border border-[#E4DDD1] bg-[#F2ECE1] hover:bg-[#e6decb] text-[#24201E] text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Submit Another Application</span>
                </button>
              </div>

              {/* Test-Mode-Only Diagnostic Summary */}
              {testMode && (
                <div className="mt-6 bg-[#E6EFEA] border border-[#2C4A3E]/30 rounded-xl p-4 text-left">
                  <p className="text-xs font-semibold text-[#2C4A3E]">
                    Developer Test Result (?test=true)
                  </p>
                  <p className="mt-1 text-xs text-[#24201E] leading-relaxed">
                    {submissionOutcome === 'honeypot_blocked' ? (
                      <>
                        <strong>Bot Silently Blocked:</strong> The hidden{' '}
                        <code className="font-mono">website_url</code> honeypot was populated, so
                        submission aborted immediately with <strong>0 network requests</strong> and
                        no email triggered.
                      </>
                    ) : submissionOutcome === 'sent' ? (
                      <>
                        <strong>Live Payload Sent:</strong> Clean JSON payload (with empty{' '}
                        <code className="font-mono">website_url</code>) was POSTed to{' '}
                        <code className="font-mono">{INTAKE_ENDPOINT_URL}</code>.
                      </>
                    ) : (
                      <>
                        <strong>Human Path Validated (Preview Mode):</strong> All 5 steps passed
                        with an empty <code className="font-mono">website_url</code> honeypot. No
                        PDF/email was sent because{' '}
                        <code className="font-mono">VITE_INTAKE_WEBHOOK_URL</code> is not
                        configured yet.
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Clearly Labeled Preview Mode Note (shown when no live webhook URL is configured) */}
              {!INTAKE_ENDPOINT_URL && (
                <div className="mt-8 bg-[#F2ECE1] border border-[#E4DDD1] rounded-xl p-4 text-left">
                  <p className="text-xs font-semibold text-[#2C4A3E]">
                    Interactive Preview Notice
                  </p>
                  <p className="mt-1 text-xs text-[#57514D] leading-relaxed">
                    This live preview demonstrates the 5-step official resident intake flow in your browser without transmitting data to an external server. For immediate bed inquiries today, please call Crystal directly 24/7 at{' '}
                    <a href="tel:+12564450553" className="font-semibold text-[#2C4A3E] underline">
                      (256) 445-0553
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
