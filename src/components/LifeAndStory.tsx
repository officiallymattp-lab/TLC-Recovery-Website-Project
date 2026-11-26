import { ShieldCheck, Clock, Heart, CalendarDays, MapPin, ArrowRight, Camera } from 'lucide-react';
import type { ResidenceChoice } from '../types/intake';

interface LifeAndStoryProps {
  onSelectResidence: (residence: Exclude<ResidenceChoice, ''>) => void;
  onOpenPhotos: () => void;
}

const HOMES = [
  {
    id: 'womens-house',
    residenceValue: 'womens' as const,
    name: "TLC Women's Recovery House",
    audience: 'Exclusively for Women',
    location: 'Somerville, AL',
    established: 'Est. July 1, 2021',
    description:
      'Our founding 9-month structured 12-step recovery home exclusively for women—built on peer mentorship, daily meetings, state-certified life skills, and steady rebuilding.',
    ctaLabel: "Apply for Women's Housing",
    accentBorder: 'border-[#E4DDD1]',
  },
  {
    id: 'grad-house',
    residenceValue: 'womens' as const,
    name: 'TLC Grad House',
    audience: 'Exclusively for Women Graduates',
    location: 'Somerville, AL',
    established: 'Est. Sept 21, 2025',
    description:
      'Step-down transitional housing exclusively for women who graduate from our 9-month program—providing ongoing sober fellowship while building savings and full independence.',
    ctaLabel: "Inquire About Women's Program",
    accentBorder: 'border-[#E4DDD1]',
  },
  {
    id: 'josiah-house',
    residenceValue: 'mens' as const,
    name: 'TLC Josiah House',
    audience: 'Exclusively for Men',
    location: 'Hartselle, AL',
    established: 'Est. Oct 31, 2026',
    description:
      "Structured 12-step recovery home exclusively for men, founded and managed as part of Crystal's network in loving memory of her late son, Josiah—bringing the same accountability and heart to men in recovery.",
    ctaLabel: "Apply for Men's Housing",
    accentBorder: 'border-[#5B7B6D]/40',
  },
];

const DAILY_RHYTHM = [
  {
    period: 'AM',
    label: 'Morning Grounding & Chores',
    summary:
      'Quiet morning reflection, shared breakfast, daily house responsibilities, and preparation for work, appointments, or life-skills sessions.',
  },
  {
    period: 'PM',
    label: 'Work, Life Skills & Recovery Practice',
    summary:
      'Gainful employment, step-work with your sponsor, and state-certified classes with Phyllis Klaiber via The Link (Healthy Boundaries, Parenting, and Anger Management).',
  },
  {
    period: 'EVE',
    label: '12-Step Meetings & House Fellowship',
    summary:
      'Daily NA, AA, CA, or RU meetings, shared evening meals, honest check-ins with housemates and peer leaders, and restful quiet hours.',
  },
];

export function LifeAndStory({ onSelectResidence, onOpenPhotos }: LifeAndStoryProps) {
  return (
    <div className="bg-[#FAF7F2]">
      {/* Dedicated Our Homes Showcase */}
      <section id="our-homes" className="pt-16 pb-14 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 border-b border-[#E4DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide text-[#B85D43]">
                Our Homes Across North Alabama
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#24201E]">
                Dedicated Sober Living Sanctuaries for Both Women and Men.
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#57514D]">
                Each TLC home is gender-specific, peer-led, and anchored in the same 12-step accountability—offering women dedicated residences in Somerville and men a dedicated sanctuary at TLC Josiah House in Hartselle.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenPhotos}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#2C4A3E]/30 bg-[#FAF7F2] hover:bg-[#E6EFEA] text-[#2C4A3E] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 self-start lg:self-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E]"
            >
              <Camera className="w-4 h-4 text-[#5B7B6D]" aria-hidden="true" />
              <span>Tour Our Homes &amp; Photos</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {HOMES.map((home, idx) => (
              <article
                key={home.id}
                className={`bg-[#F2ECE1] border ${home.accentBorder} rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_14px_rgba(36,32,30,0.03)]`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E4DDD1]">
                    <span className="font-serif text-xl font-semibold tabular-nums text-[#C98A3A]">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#5B7B6D] tabular-nums">
                      {home.established}
                    </span>
                  </div>

                  <p className="mt-4 text-xs font-semibold tracking-wide text-[#B85D43]">
                    {home.audience}
                  </p>

                  <h3 className="mt-1.5 font-serif text-2xl font-semibold text-[#24201E] leading-snug">
                    {home.name}
                  </h3>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#2C4A3E]">
                    <MapPin className="w-4 h-4 text-[#5B7B6D] shrink-0" aria-hidden="true" />
                    <span>{home.location}</span>
                  </p>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#57514D]">
                    {home.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#E4DDD1]">
                  <button
                    type="button"
                    onClick={() => onSelectResidence(home.residenceValue)}
                    className="group w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-[#FAF7F2] border border-[#E4DDD1] hover:border-[#2C4A3E] hover:bg-[#E6EFEA]/60 text-sm font-semibold text-[#24201E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E]"
                  >
                    <span className="whitespace-nowrap truncate">{home.ctaLabel}</span>
                    <ArrowRight
                      className="w-4 h-4 text-[#2C4A3E] group-hover:translate-x-0.5 transition-transform shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Life & Community Section */}
      <section id="life-at-tlc" className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: A Day at TLC */}
            <div className="lg:col-span-6">
              <p className="text-sm font-semibold tracking-wide text-[#5B7B6D]">
                Life &amp; Community
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#24201E]">
                Structure That Protects Your Peace. Joy That Makes Recovery Stick.
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#57514D]">
                Early recovery needs predictable rhythms—not chaos, and not isolation. Every day across our women&rsquo;s and men&rsquo;s homes balances accountability, meaningful work, and real human warmth.
              </p>

              {/* AM / PM / EVE Timeline */}
              <div className="mt-8 border-t border-[#E4DDD1]">
                {DAILY_RHYTHM.map((slot) => (
                  <div
                    key={slot.period}
                    className="py-6 border-b border-[#E4DDD1] grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-5 items-start"
                  >
                    <div className="sm:col-span-2">
                      <span className="inline-block font-serif text-xl font-semibold tabular-nums text-[#B85D43]">
                        {slot.period}
                      </span>
                    </div>
                    <div className="sm:col-span-10">
                      <h3 className="font-serif text-xl font-semibold text-[#24201E]">
                        {slot.label}
                      </h3>
                      <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-[#57514D]">
                        {slot.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safeguard Highlights */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#E6EFEA]/70 border border-[#5B7B6D]/25 rounded-xl p-5">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#2C4A3E] shrink-0" aria-hidden="true" />
                    <h3 className="font-serif text-lg font-semibold text-[#24201E]">
                      100% Substance-Free Homes
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-[#57514D] leading-relaxed">
                    Random screenings and zero-tolerance safety standards protect every resident&rsquo;s sobriety across Somerville and Hartselle.
                  </p>
                </div>

                <div className="bg-[#F2ECE1] border border-[#E4DDD1] rounded-xl p-5">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-[#B85D43] shrink-0" aria-hidden="true" />
                    <h3 className="font-serif text-lg font-semibold text-[#24201E]">
                      Clear Curfews &amp; Sign-Outs
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-[#57514D] leading-relaxed">
                    Transparent sign-in/sign-out expectations and curfews keep everyone accountable and families reassured.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Community Days Spotlight + Legacy Note */}
            <div className="lg:col-span-6 space-y-6">
              {/* Deep Forest Card: Community & Family Days */}
              <div className="bg-[#2C4A3E] text-[#FAF7F2] rounded-2xl p-7 sm:p-9 shadow-[0_8px_28px_rgba(44,74,62,0.16)]">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#C98A3A]">
                  <CalendarDays className="w-4 h-4" aria-hidden="true" />
                  <span>Healing Together Beyond Our Doors</span>
                </div>

                <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold leading-snug text-[#FAF7F2]">
                  Monthly Family &amp; Community Fellowship Days
                </h3>

                <p className="mt-3 text-base leading-relaxed text-[#E6EFEA]">
                  Recovery is sweeter when families heal together. Every month, we open our doors for shared meals, laughter, and connection—welcoming parents, children, loved ones, and community supporters into a safe, joyful, sober space.
                </p>

                <div className="mt-6 pt-6 border-t border-[#FAF7F2]/15 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="font-serif text-lg font-semibold text-[#FAF7F2]">
                      Parents, Children &amp; Supporters Welcomed
                    </p>
                    <p className="mt-1 text-sm text-[#E6EFEA]/90 leading-relaxed">
                      Home-cooked food, genuine fellowship, and rebuilt memories where moms, dads, kids, and loved ones can simply be together.
                    </p>
                  </div>
                  <div>
                    <p className="font-serif text-lg font-semibold text-[#FAF7F2]">
                      Annual Anniversary Recovery Rally
                    </p>
                    <p className="mt-1 text-sm text-[#E6EFEA]/90 leading-relaxed">
                      Each year our alumni, families, sponsors, and North Alabama neighbors gather to celebrate milestones and new life.
                    </p>
                  </div>
                </div>
              </div>

              {/* Legacy & Memorial Card */}
              <div className="bg-[#F2ECE1] border border-[#E4DDD1] rounded-2xl p-7 sm:p-9">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#B85D43]">
                  <Heart className="w-4 h-4" aria-hidden="true" />
                  <span>In Loving Memory of Josiah</span>
                </div>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#24201E]">
                  Turning Grief Into Open Doors for Men in Recovery.
                </h3>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#57514D]">
                  What began as one women&rsquo;s home in Somerville on July 1, 2021 has grown into a North Alabama network of healing. Opening <strong className="font-semibold text-[#24201E]">TLC Josiah House</strong> in Hartselle on October 31, 2026 carries forward the memory of Crystal&rsquo;s late son, Josiah—giving men a structured, loving brotherhood where no one has to fight addiction alone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
