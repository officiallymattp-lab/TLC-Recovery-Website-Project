import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  INITIAL_INTAKE_DATA,
  LIVING_SITUATIONS,
  LEGAL_STATUSES,
  RESIDENCE_OPTIONS,
  type ApplyingAs,
  type ResidenceChoice,
  type IntakeFormData,
} from '../types/intake';

interface IntakeApplicationProps {
  externalPathway: { value: ApplyingAs; nonce: number } | null;
  externalResidence: { value: Exclude<ResidenceChoice, ''>; nonce: number } | null;
}

const STEP_LABELS = [
  { step: 1, title: 'About & Home' },
  { step: 2, title: 'Right Now' },
  { step: 3, title: 'Care & Support' },
  { step: 4, title: 'In Your Words' },
] as const;

type FormErrors = Partial<Record<keyof IntakeFormData, string>>;

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

export function IntakeApplication({
  externalPathway,
  externalResidence,
}: IntakeApplicationProps) {
  const [formData, setFormData] = useState<IntakeFormData>(INITIAL_INTAKE_DATA);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [highestReachedStep, setHighestReachedStep] = useState<number>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (externalPathway) {
      setFormData((prev) => ({ ...prev, applyingAs: externalPathway.value }));
      setIsSubmitted(false);
      setCurrentStep(1);
    }
  }, [externalPathway]);

  useEffect(() => {
    if (externalResidence) {
      setFormData((prev) => ({ ...prev, residenceChoice: externalResidence.value }));
      setErrors((prev) => {
        if (!prev.residenceChoice) return prev;
        const next = { ...prev };
        delete next.residenceChoice;
        return next;
      });
      setIsSubmitted(false);
      setCurrentStep(1);
    }
  }, [externalResidence]);

  const updateField = <K extends keyof IntakeFormData>(
    key: K,
    value: IntakeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const nextErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.residenceChoice) {
        nextErrors.residenceChoice =
          "Please choose whether you are applying for Women's Recovery Housing (Somerville) or Men's Recovery Housing — TLC Josiah House (Hartselle).";
      }
      if (!formData.fullName.trim()) {
        nextErrors.fullName = 'Please enter the applicant’s full name.';
      }
      if (!formData.phone.trim() || countDigits(formData.phone) < 10) {
        nextErrors.phone = 'Please enter a 10-digit phone number where Crystal can reach you.';
      }
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        nextErrors.email = 'That email doesn’t look quite right—or you may leave it blank.';
      }
      if (!formData.dateOfBirth) {
        nextErrors.dateOfBirth = 'Please enter a date of birth.';
      } else {
        const age = calculateAge(formData.dateOfBirth);
        if (age === null || age < 18) {
          nextErrors.dateOfBirth =
            'Residency across TLC Recovery House and TLC Josiah House is for adults ages 18 and older.';
        } else if (age > 110) {
          nextErrors.dateOfBirth = 'Please check the birth year entered.';
        }
      }
    }

    if (step === 2) {
      if (!formData.livingSituation) {
        nextErrors.livingSituation = 'Please select what best describes where you are right now.';
      }
      if (!formData.substances.trim()) {
        nextErrors.substances =
          'Please share the primary substance(s) involved so we can understand your recovery needs.';
      }
    }

    if (step === 3) {
      if (!formData.legalStatus) {
        nextErrors.legalStatus = 'Please select your current legal or probation status.';
      }
      if (!formData.emergencyName.trim()) {
        nextErrors.emergencyName = 'Please provide an emergency contact name.';
      }
      if (!formData.emergencyRelationship.trim()) {
        nextErrors.emergencyRelationship = 'Please share their relationship to the applicant.';
      }
      if (!formData.emergencyPhone.trim() || countDigits(formData.emergencyPhone) < 10) {
        nextErrors.emergencyPhone = 'Please enter a 10-digit phone number for your emergency contact.';
      }
    }

    if (step === 4) {
      if (!formData.reasonForApplying.trim() || formData.reasonForApplying.trim().length < 10) {
        nextErrors.reasonForApplying =
          'Even a few sentences in your own words helps Crystal prepare for your conversation.';
      }
      if (!formData.commitmentAccepted) {
        nextErrors.commitmentAccepted =
          'Please check the acknowledgment box to confirm you are ready for a 12-step, substance-free recovery residence.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    const nextStep = Math.min(4, currentStep + 1);
    setCurrentStep(nextStep);
    setHighestReachedStep((prev) => Math.max(prev, nextStep));
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setErrors({});
      setCurrentStep(targetStep);
      return;
    }
    if (targetStep <= highestReachedStep && validateStep(currentStep)) {
      setCurrentStep(targetStep);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 850);
  };

  const handleReset = () => {
    setFormData(INITIAL_INTAKE_DATA);
    setErrors({});
    setCurrentStep(1);
    setHighestReachedStep(1);
    setIsSubmitted(false);
  };

  const applicantFirstName =
    formData.fullName.trim().split(/\s+/)[0] || 'Friend';

  const selectedResidenceOption = RESIDENCE_OPTIONS.find(
    (opt) => opt.value === formData.residenceChoice
  );

  return (
    <section
      id="apply"
      className="bg-[#F2ECE1] border-t border-[#E4DDD1] py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold tracking-wide text-[#B85D43]">
            Resident Intake Application
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#24201E]">
            Take the First Quiet Step Toward Safe Housing.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#57514D] leading-relaxed">
            Applying for our Women&rsquo;s Homes in Somerville or our Men&rsquo;s Josiah House in Hartselle takes just a few minutes. You don&rsquo;t need everything figured out—just honesty and a willingness to begin.
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
        <div className="mt-8 bg-[#FAF7F2] border border-[#E4DDD1] rounded-2xl p-6 sm:p-9 shadow-[0_8px_30px_rgba(36,32,30,0.05)]">
          {!isSubmitted ? (
            <>
              {/* Progress Bar & Clickable Step Navigation */}
              <div className="pb-6 border-b border-[#E4DDD1]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#57514D] mb-2.5">
                  <span className="tabular-nums">Step {currentStep} of 4</span>
                  <span className="tabular-nums text-[#2C4A3E]">
                    {currentStep * 25}% Complete
                  </span>
                </div>

                <div
                  className="w-full h-2 bg-[#E4DDD1] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={currentStep * 25}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-[#2C4A3E] transition-transform duration-200 origin-left"
                    style={{ transform: `scaleX(${currentStep / 4})` }}
                  />
                </div>

                {/* Clickable Back-Navigation Step Buttons */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
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
              <form onSubmit={handleSubmit} className="mt-7" noValidate>
                {/* STEP 1: ABOUT YOU & HOUSING CHOICE */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        About You &amp; Housing Choice
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        Select the appropriate residence and share the best way for Crystal to reach you personally.
                      </p>
                    </div>

                    {/* Applying As */}
                    <div>
                      <span className="block text-sm font-semibold text-[#24201E] mb-2">
                        Applying As
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => updateField('applyingAs', 'myself')}
                          aria-pressed={formData.applyingAs === 'myself'}
                          className={`text-left px-4 py-3.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                            formData.applyingAs === 'myself'
                              ? 'bg-[#E6EFEA] border-[#2C4A3E] text-[#24201E]'
                              : 'bg-[#FAF7F2] border-[#E4DDD1] text-[#57514D] hover:bg-[#F2ECE1]/60'
                          }`}
                        >
                          <span className="block text-sm font-semibold text-[#24201E]">
                            Myself
                          </span>
                          <span className="block text-xs text-[#57514D] mt-0.5">
                            I am seeking a safe sober living bed for myself.
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateField('applyingAs', 'assisting')}
                          aria-pressed={formData.applyingAs === 'assisting'}
                          className={`text-left px-4 py-3.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                            formData.applyingAs === 'assisting'
                              ? 'bg-[#E6EFEA] border-[#2C4A3E] text-[#24201E]'
                              : 'bg-[#FAF7F2] border-[#E4DDD1] text-[#57514D] hover:bg-[#F2ECE1]/60'
                          }`}
                        >
                          <span className="block text-sm font-semibold text-[#24201E]">
                            Assisting a loved one or client
                          </span>
                          <span className="block text-xs text-[#57514D] mt-0.5">
                            Family member, sponsor, caseworker, or probation officer.
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* REQUIRED Residence Selection */}
                    <fieldset>
                      <legend className="block text-sm font-semibold text-[#24201E] mb-2">
                        Which recovery home are you applying for? *
                      </legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                        {RESIDENCE_OPTIONS.map((option) => {
                          const isSelected = formData.residenceChoice === option.value;
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
                                name="residenceChoice"
                                value={option.value}
                                checked={isSelected}
                                onChange={() => updateField('residenceChoice', option.value)}
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
                      {errors.residenceChoice && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.residenceChoice}</span>
                        </p>
                      )}
                    </fieldset>

                    {formData.applyingAs === 'assisting' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F2ECE1]/60 p-4 rounded-xl border border-[#E4DDD1]">
                        <div>
                          <label htmlFor="assisting-name" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Your Name (Helper / Referral)
                          </label>
                          <input
                            id="assisting-name"
                            type="text"
                            value={formData.assistingName}
                            onChange={(e) => updateField('assistingName', e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>
                        <div>
                          <label htmlFor="assisting-role" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                            Your Role or Relationship
                          </label>
                          <input
                            id="assisting-role"
                            type="text"
                            value={formData.assistingRelationship}
                            onChange={(e) => updateField('assistingRelationship', e.target.value)}
                            placeholder="e.g. Parent, Spouse, Caseworker, Court Liaison"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label htmlFor="applicant-full-name" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Applicant Full Name *
                        </label>
                        <input
                          id="applicant-full-name"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => updateField('fullName', e.target.value)}
                          aria-invalid={Boolean(errors.fullName)}
                          placeholder="First and last name"
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                        {errors.fullName && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{errors.fullName}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="applicant-phone" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Best Phone Number *
                        </label>
                        <input
                          id="applicant-phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          aria-invalid={Boolean(errors.phone)}
                          placeholder="(256) 555-0199"
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                        {errors.phone && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{errors.phone}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="applicant-email" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Email <span className="font-normal text-[#57514D]">(Optional)</span>
                        </label>
                        <input
                          id="applicant-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          aria-invalid={Boolean(errors.email)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                        {errors.email && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="applicant-dob" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Date of Birth * <span className="font-normal text-[#57514D]">(Must be 18+)</span>
                        </label>
                        <input
                          id="applicant-dob"
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => updateField('dateOfBirth', e.target.value)}
                          aria-invalid={Boolean(errors.dateOfBirth)}
                          className="w-full sm:max-w-xs px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                        {errors.dateOfBirth && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{errors.dateOfBirth}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: WHERE YOU ARE RIGHT NOW */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        Where You Are Right Now
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        There is no judgment here—knowing where you are coming from helps us plan a safe transition.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="living-situation" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                        Current Living Situation *
                      </label>
                      <select
                        id="living-situation"
                        required
                        value={formData.livingSituation}
                        onChange={(e) => updateField('livingSituation', e.target.value)}
                        aria-invalid={Boolean(errors.livingSituation)}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                      >
                        <option value="">Select current living situation...</option>
                        {LIVING_SITUATIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {errors.livingSituation && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.livingSituation}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="primary-substances" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                        Primary Substance(s) of Choice *
                      </label>
                      <input
                        id="primary-substances"
                        type="text"
                        required
                        value={formData.substances}
                        onChange={(e) => updateField('substances', e.target.value)}
                        aria-invalid={Boolean(errors.substances)}
                        placeholder="e.g. Alcohol, opioids, methamphetamine, prescription medication"
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                      />
                      {errors.substances && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.substances}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="sobriety-status" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                        Sobriety / Clean Date or Status
                      </label>
                      <input
                        id="sobriety-status"
                        type="text"
                        value={formData.sobrietyStatus}
                        onChange={(e) => updateField('sobrietyStatus', e.target.value)}
                        placeholder="e.g. 30 days clean, finishing inpatient Friday, or seeking detox referral first"
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                      />
                      <p className="mt-1.5 text-xs text-[#57514D]">
                        Note: TLC Recovery House and TLC Josiah House are sober living homes, not medical detox facilities. If medical detox is needed first, Crystal can help talk through safe options.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 3: CARE, LEGAL & EMERGENCY SUPPORT */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        Care, Legal &amp; Emergency Support
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        We coordinate kindly with probation, courts, and families so nothing catches you off guard.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="legal-status" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                        Legal / Probation Status *
                      </label>
                      <select
                        id="legal-status"
                        required
                        value={formData.legalStatus}
                        onChange={(e) => updateField('legalStatus', e.target.value)}
                        aria-invalid={Boolean(errors.legalStatus)}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                      >
                        <option value="">Select legal / probation status...</option>
                        {LEGAL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {errors.legalStatus && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.legalStatus}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="medical-needs" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                        Medications &amp; Medical / Mental Health Needs
                      </label>
                      <textarea
                        id="medical-needs"
                        rows={3}
                        value={formData.medicalNeeds}
                        onChange={(e) => updateField('medicalNeeds', e.target.value)}
                        placeholder="List any prescribed medications, allergies, or health supports we should be aware of (leave blank if none)."
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                      />
                    </div>

                    <div className="pt-4 border-t border-[#E4DDD1]">
                      <p className="text-sm font-semibold text-[#24201E] mb-3">
                        Emergency Contact Information
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="emergency-name" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Contact Name *
                          </label>
                          <input
                            id="emergency-name"
                            type="text"
                            required
                            value={formData.emergencyName}
                            onChange={(e) => updateField('emergencyName', e.target.value)}
                            aria-invalid={Boolean(errors.emergencyName)}
                            placeholder="Full name"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.emergencyName && (
                            <p className="mt-1 text-xs text-[#9E4B33]">{errors.emergencyName}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="emergency-relationship" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Relationship *
                          </label>
                          <input
                            id="emergency-relationship"
                            type="text"
                            required
                            value={formData.emergencyRelationship}
                            onChange={(e) => updateField('emergencyRelationship', e.target.value)}
                            aria-invalid={Boolean(errors.emergencyRelationship)}
                            placeholder="e.g. Parent, Sibling, Friend"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.emergencyRelationship && (
                            <p className="mt-1 text-xs text-[#9E4B33]">
                              {errors.emergencyRelationship}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="emergency-phone" className="block text-xs font-semibold text-[#57514D] mb-1.5">
                            Contact Phone *
                          </label>
                          <input
                            id="emergency-phone"
                            type="tel"
                            required
                            value={formData.emergencyPhone}
                            onChange={(e) => updateField('emergencyPhone', e.target.value)}
                            aria-invalid={Boolean(errors.emergencyPhone)}
                            placeholder="(256) 555-0144"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                          />
                          {errors.emergencyPhone && (
                            <p className="mt-1 text-xs text-[#9E4B33]">{errors.emergencyPhone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: IN YOUR OWN WORDS */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#24201E]">
                        In Your Own Words
                      </h3>
                      <p className="mt-1 text-sm text-[#57514D]">
                        Speak from the heart—there are no &ldquo;perfect&rdquo; answers here.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="reason-applying" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                        Why are you seeking residency with TLC Recovery House? *
                      </label>
                      <textarea
                        id="reason-applying"
                        rows={5}
                        required
                        value={formData.reasonForApplying}
                        onChange={(e) => updateField('reasonForApplying', e.target.value)}
                        aria-invalid={Boolean(errors.reasonForApplying)}
                        placeholder="Share what you are hoping for in this next chapter, and anything else you want Crystal to know..."
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                      />
                      {errors.reasonForApplying && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.reasonForApplying}</span>
                        </p>
                      )}
                    </div>

                    <div className="bg-[#F2ECE1] border border-[#E4DDD1] rounded-xl p-4 sm:p-5">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.commitmentAccepted}
                          onChange={(e) => updateField('commitmentAccepted', e.target.checked)}
                          aria-invalid={Boolean(errors.commitmentAccepted)}
                          className="mt-1 w-5 h-5 rounded border-[#5B7B6D] text-[#2C4A3E] focus:ring-[#2C4A3E] shrink-0"
                        />
                        <span className="text-sm text-[#24201E] leading-relaxed">
                          <strong className="font-semibold">Honest Commitment Acknowledgment *:</strong>{' '}
                          I understand that TLC Recovery House&mdash;including our Women&rsquo;s Homes and Men&rsquo;s Josiah House&mdash;is a 12-step, substance-free recovery residence with daily meetings, drug screenings, curfews, and shared household responsibilities, and I am ready to show up honestly for myself and my house community.
                        </span>
                      </label>
                      {errors.commitmentAccepted && (
                        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-[#9E4B33]">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{errors.commitmentAccepted}</span>
                        </p>
                      )}
                    </div>
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
                      Fields marked with * help us review bed availability safely.
                    </div>
                  )}

                  {currentStep < 4 ? (
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

                {/* Privacy & Confidentiality Reassurance Note */}
                <div className="mt-5 flex items-start gap-2.5 text-xs text-[#57514D] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-[#5B7B6D] shrink-0 mt-0.5" aria-hidden="true" />
                  <p>
                    <strong className="font-semibold text-[#24201E]">Privacy &amp; Confidentiality:</strong>{' '}
                    Your application is treated with strict care and reviewed solely by Founder &amp; Director Crystal Steelman and TLC leadership for residency placement. We never share your personal story or contact details with outside parties without your consent.
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
                Asking for help takes real courage. Crystal Steelman will review what you shared and reach out personally at{' '}
                <strong className="text-[#24201E]">{formData.phone}</strong> to talk through current bed openings, answer your questions, and take the next step together.
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

              {/* Clearly Labeled Preview Mode Note */}
              <div className="mt-8 bg-[#F2ECE1] border border-[#E4DDD1] rounded-xl p-4 text-left">
                <p className="text-xs font-semibold text-[#2C4A3E]">
                  Interactive Preview Notice
                </p>
                <p className="mt-1 text-xs text-[#57514D] leading-relaxed">
                  This live preview demonstrates the 4-step confidential resident intake flow in your browser without transmitting data to an external server. For immediate bed inquiries today, please call Crystal directly 24/7 at{' '}
                  <a href="tel:+12564450553" className="font-semibold text-[#2C4A3E] underline">
                    (256) 445-0553
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
