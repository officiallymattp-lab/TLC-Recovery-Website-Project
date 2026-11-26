import { useState } from 'react';
import { Phone, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

const SUPPORT_TIERS = [
  {
    id: 'essentials',
    label: "Sponsor a Resident's Fresh Start",
    amount: '$75',
    detail:
      'Covers bedding, hygiene essentials, and welcome groceries for a woman or man arriving directly from detox, rehab, or unsafe housing.',
  },
  {
    id: 'family-day',
    label: 'Sustain Monthly Family Days',
    amount: '$150',
    detail:
      'Covers food and gathering supplies so residents across our Somerville and Hartselle homes can share a joyful, sober meal with their families.',
  },
  {
    id: 'expansion',
    label: 'Land, Buildings & Josiah House',
    amount: '$500',
    detail:
      'Directly advances our 501(c)(3) capital goal to purchase additional land and buildings and grow TLC Josiah House for more North Alabama beds.',
  },
  {
    id: 'custom',
    label: 'Monthly or Custom Gift',
    amount: 'Any Amount',
    detail: 'Partner monthly or arrange in-kind household donations and property support.',
  },
];

export function DonationExpansion() {
  const [selectedTier, setSelectedTier] = useState<string>('expansion');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);
  const [pledgeError, setPledgeError] = useState('');

  const activeTier = SUPPORT_TIERS.find((t) => t.id === selectedTier) ?? SUPPORT_TIERS[2];

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      setPledgeError('Please share your name so Crystal knows who to thank and follow up with.');
      return;
    }
    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      setPledgeError('Please enter a valid email address so we can send 501(c)(3) donation details.');
      return;
    }
    setPledgeError('');
    setPledgeSubmitted(true);
  };

  return (
    <section id="support" className="bg-[#2C4A3E] text-[#FAF7F2] py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Mission & Expansion Vision */}
          <div className="lg:col-span-6">
            <p className="text-sm font-semibold tracking-wide text-[#C98A3A]">
              501(c)(3) Non-Profit Expansion
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#FAF7F2]">
              Help Us Open More Doors for Women &amp; Men Across North Alabama.
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#E6EFEA]">
              Every woman or man who calls at 2 a.m. deserves a safe bed waiting for them. As a registered 501(c)(3) nonprofit, community generosity fuels everything we do beyond rent—helping us expand our sanctuaries and never turn someone away empty-handed.
            </p>

            <div className="mt-8 space-y-5 border-t border-[#FAF7F2]/15 pt-7">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#FAF7F2]">
                  01. Purchase Additional Land &amp; Buildings
                </h3>
                <p className="mt-1 text-sm sm:text-base text-[#E6EFEA]/90 leading-relaxed">
                  Expanding capacity in Somerville, Hartselle, and North Alabama so more women and men have a steady, peer-led home in recovery.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#FAF7F2]">
                  02. Sponsor a Resident&rsquo;s Fresh Start
                </h3>
                <p className="mt-1 text-sm sm:text-base text-[#E6EFEA]/90 leading-relaxed">
                  Many residents arrive from detox, treatment, or unsafe housing with only the clothes they are wearing. Sponsors cover initial move-in needs, bedding, toiletries, and first-week essentials.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#FAF7F2]">
                  03. Sustain Monthly Family Days &amp; Josiah House Growth
                </h3>
                <p className="mt-1 text-sm sm:text-base text-[#E6EFEA]/90 leading-relaxed">
                  Strengthening our men&rsquo;s home in Hartselle while keeping monthly family meals and our Annual Anniversary Recovery Rally free and welcoming for everyone.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Giving & Sponsorship Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#FAF7F2] text-[#24201E] rounded-2xl p-6 sm:p-8 border border-[#E4DDD1] shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
              {!pledgeSubmitted ? (
                <>
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#5B7B6D]">
                    <HeartHandshake className="w-4 h-4 text-[#B85D43]" aria-hidden="true" />
                    <span>Tax-Deductible 501(c)(3) Support</span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-[#24201E]">
                    Choose How You&rsquo;d Like to Stand With TLC
                  </h3>

                  {/* Support Focus Buttons */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Donation focus area">
                    {SUPPORT_TIERS.map((tier) => {
                      const isSelected = tier.id === selectedTier;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedTier(tier.id)}
                          aria-pressed={isSelected}
                          className={`text-left p-3.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                            isSelected
                              ? 'bg-[#E6EFEA] border-[#2C4A3E] text-[#24201E]'
                              : 'bg-[#F2ECE1]/60 border-[#E4DDD1] text-[#57514D] hover:bg-[#F2ECE1]'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-semibold text-[#24201E]">
                              {tier.label}
                            </span>
                            <span className="font-serif text-base font-semibold tabular-nums text-[#B85D43] shrink-0">
                              {tier.amount}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-sm text-[#57514D] leading-relaxed bg-[#F2ECE1]/70 rounded-lg p-3.5 border border-[#E4DDD1]">
                    {activeTier.detail}
                  </p>

                  <form onSubmit={handlePledgeSubmit} className="mt-5 space-y-4" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="donor-name" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Your Name *
                        </label>
                        <input
                          id="donor-name"
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder="Full name or organization"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                      </div>
                      <div>
                        <label htmlFor="donor-email" className="block text-sm font-semibold text-[#24201E] mb-1.5">
                          Email for Gift Details *
                        </label>
                        <input
                          id="donor-email"
                          type="email"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E4DDD1] text-[#24201E] placeholder:text-[#57514D]/60 focus:outline-none focus:border-[#2C4A3E] focus:ring-2 focus:ring-[#2C4A3E]/20"
                        />
                      </div>
                    </div>

                    {pledgeError && (
                      <p role="alert" className="text-sm font-medium text-[#9E4B33]">
                        {pledgeError}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        type="submit"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#B85D43] hover:bg-[#9E4B33] text-[#FAF7F2] text-sm sm:text-base font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B85D43]"
                      >
                        <span>Request Giving Details</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>

                      <a
                        href="tel:+12564450553"
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#2C4A3E]/30 text-[#2C4A3E] hover:bg-[#E6EFEA] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                      >
                        <Phone className="w-4 h-4" aria-hidden="true" />
                        <span>Call (256) 445-0553</span>
                      </a>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-4">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C4A3E]">
                    <CheckCircle2 className="w-5 h-5 text-[#2C4A3E]" aria-hidden="true" />
                    <span>Thank You for Standing With TLC</span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-[#24201E]">
                    We appreciate your heart, {donorName.trim().split(' ')[0]}.
                  </h3>
                  <p className="mt-3 text-base text-[#57514D] leading-relaxed">
                    Your interest in supporting <strong className="text-[#24201E]">{activeTier.label} ({activeTier.amount})</strong> has been noted in this preview. To complete a tax-deductible 501(c)(3) gift, drop off household items in Somerville, or discuss land/building sponsorship directly, please call Crystal Steelman at{' '}
                    <a href="tel:+12564450553" className="font-semibold text-[#2C4A3E] underline decoration-[#C98A3A] underline-offset-4">
                      (256) 445-0553
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPledgeSubmitted(false);
                      setDonorName('');
                      setDonorEmail('');
                    }}
                    className="mt-6 inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-[#E4DDD1] text-sm font-semibold text-[#24201E] hover:bg-[#F2ECE1] transition-colors"
                  >
                    Explore another way to give
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
