import { useState } from 'react';
import { ArrowRight, HeartHandshake, UserCheck, Users } from 'lucide-react';
import type { ApplyingAs } from '../types/intake';

interface HeroProps {
  onSelectPathway: (pathway: ApplyingAs) => void;
}

const TRUST_ITEMS = [
  {
    title: 'Established July 2021',
    detail: 'Serving women & men across North Alabama',
  },
  {
    title: "Women's & Men's Houses",
    detail: 'Dedicated homes in Somerville & Hartselle, AL',
  },
  {
    title: 'Certified Life Skills',
    detail: 'Partnered with The Link in Cullman, AL',
  },
  {
    title: 'Daily 12-Step Rhythm',
    detail: 'NA, AA, CA & RU meetings',
  },
];

export function Hero({ onSelectPathway }: HeroProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section id="top" className="relative overflow-hidden bg-[#FAF7F2] pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-column Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Core Sanctuary Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Unboxed Editorial Trust Metadata */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-semibold tracking-wide text-[#5B7B6D] mb-5">
              <span>501(c)(3) Non-Profit</span>
              <span aria-hidden="true" className="text-[#C98A3A]">·</span>
              <span>Women&apos;s &amp; Men&apos;s Peer-Led Recovery</span>
              <span aria-hidden="true" className="text-[#C98A3A]">·</span>
              <span>Somerville &amp; Hartselle, AL</span>
            </div>

            <h1 className="font-serif text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.12] tracking-tight text-[#24201E] max-w-2xl">
              A Safe Place to Breathe, Rebuild, and Begin Again.
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#57514D] max-w-2xl">
              You don&rsquo;t have to carry this alone anymore. TLC Recovery House provides structured, loving, 12-step sober living for both women and men ready for a fresh start&mdash;with dedicated women&rsquo;s homes in Somerville and our men&rsquo;s home, TLC Josiah House, in Hartselle&mdash;led by grateful individuals in long-term recovery who know the road because we&rsquo;ve walked it ourselves.
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                href="#apply"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectPathway('myself');
                }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#B85D43] hover:bg-[#9E4B33] text-[#FAF7F2] text-base font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B85D43]"
              >
                <span>Apply Online</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href="#support"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-[#2C4A3E]/30 bg-transparent hover:bg-[#E6EFEA] text-[#2C4A3E] text-base font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2C4A3E]"
              >
                <HeartHandshake className="w-4 h-4 text-[#5B7B6D]" aria-hidden="true" />
                <span>Support Our Mission</span>
              </a>
            </div>

            <p className="mt-5 text-sm text-[#57514D]">
              Need to talk to someone right now?{' '}
              <a
                href="tel:+12564450553"
                className="font-semibold text-[#2C4A3E] underline decoration-[#C98A3A] underline-offset-4 hover:text-[#B85D43] transition-colors"
              >
                Call Crystal 24/7 at (256) 445-0553
              </a>
            </p>
          </div>

          {/* Right Column: Founder's Promise Card */}
          <div className="lg:col-span-5 flex">
            <aside
              aria-label="Founder's Promise"
              className="w-full flex flex-col justify-between bg-[#F2ECE1] border border-[#E4DDD1] rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(36,32,30,0.05)]"
            >
              <div>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center gap-5">
                  {/* Crystal Steelman Portrait */}
                  <div className="w-28 h-32 sm:w-32 sm:h-36 shrink-0 rounded-xl overflow-hidden border border-[#E4DDD1] bg-[#E6EFEA]">
                    {!imgFailed ? (
                      <img
                        src="/assets/aistudio/crystal_steelman_-_headshot_d1cbfc4f.jpg"
                        alt="Portrait of Crystal Steelman, Founder and Director of TLC Recovery House"
                        referrerPolicy="no-referrer"
                        onError={() => setImgFailed(true)}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#2C4A3E] text-[#FAF7F2] p-3 text-center">
                        <span className="font-serif text-2xl font-semibold">CS</span>
                        <span className="text-[11px] text-[#E6EFEA] mt-1">Crystal Steelman</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold tracking-wide text-[#B85D43]">
                      Founder&rsquo;s Promise
                    </p>
                    <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#24201E] mt-1 leading-snug">
                      Founder &amp; Director — Crystal Steelman
                    </h2>
                    <p className="text-xs text-[#57514D] mt-1">
                      In long-term recovery · Somerville &amp; Hartselle, AL
                    </p>
                  </div>
                </div>

                <blockquote className="mt-5 pt-5 border-t border-[#E4DDD1] font-serif italic text-base sm:text-[17px] leading-relaxed text-[#24201E]">
                  &ldquo;I know what it feels like to lose your family, your friends, and your hope&mdash;and to wonder if anyone truly understands. It hits different when the people walking beside you have actually been where you&rsquo;ve been. If I can do this, you can do this.&rdquo;
                </blockquote>
              </div>

              {/* Two Quick Pathway Links */}
              <div className="mt-6 pt-5 border-t border-[#E4DDD1] space-y-2.5">
                <p className="text-xs font-semibold tracking-wide text-[#57514D]">
                  Start a confidential application
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectPathway('myself')}
                    className="group flex items-center justify-between gap-2 w-full text-left px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E4DDD1] hover:border-[#2C4A3E] hover:bg-[#E6EFEA]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E]"
                  >
                    <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#24201E]">
                      <UserCheck className="w-4 h-4 text-[#2C4A3E] shrink-0" aria-hidden="true" />
                      <span>Seeking a safe bed for yourself?</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#57514D] group-hover:text-[#2C4A3E] group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPathway('assisting')}
                    className="group flex items-center justify-between gap-2 w-full text-left px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E4DDD1] hover:border-[#2C4A3E] hover:bg-[#E6EFEA]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E]"
                  >
                    <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#24201E]">
                      <Users className="w-4 h-4 text-[#B85D43] shrink-0" aria-hidden="true" />
                      <span>Family member or caseworker?</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#57514D] group-hover:text-[#2C4A3E] group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Full-Width 4-Column Trust Strip */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-[#E4DDD1]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {TRUST_ITEMS.map((item, idx) => (
              <div
                key={item.title}
                className="flex flex-col gap-1 lg:pr-4"
              >
                <span className="text-xs font-semibold tabular-nums text-[#C98A3A]">
                  0{idx + 1}
                </span>
                <p className="font-serif text-lg font-semibold text-[#24201E]">
                  {item.title}
                </p>
                <p className="text-sm text-[#57514D] leading-snug">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
