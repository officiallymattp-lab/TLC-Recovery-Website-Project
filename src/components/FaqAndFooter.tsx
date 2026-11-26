import { useState } from 'react';
import { ChevronDown, MapPin, Phone } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Do you offer housing for both women and men?',
    answer:
      "Yes. TLC Recovery House operates dedicated, gender-specific sober living homes across North Alabama: TLC Women's Recovery House (9-month structured program) and TLC Grad House (step-down transitional home for program graduates) in Somerville serve women exclusively, while TLC Josiah House in Hartselle serves men exclusively.",
  },
  {
    question: 'Do I have to complete inpatient rehab before applying to TLC Recovery House?',
    answer:
      'No—inpatient rehab is not strictly required before applying. Women and men join us from treatment programs, correctional or court transitions, unsafe home environments, or directly when they are ready for structured sober living. During your phone call with Crystal, we will talk honestly about where you are and make sure TLC is the right next step.',
  },
  {
    question: 'Does TLC Recovery House provide medical detox?',
    answer:
      'No. TLC Recovery House and TLC Josiah House are peer-led 12-step sober living residences, not licensed medical detox or inpatient clinical facilities. If you are currently experiencing acute physical withdrawal and need medical stabilization first, please call Crystal at (256) 445-0553—we will gladly help connect you with safe local detox resources so you can transition to TLC once cleared.',
  },
  {
    question: 'Can I arrive without a job, money, or a car?',
    answer:
      'Yes. Many residents walk through our doors starting from scratch. Our structured program focuses on building stability first—helping you get connected to daily 12-step meetings, state-certified life-skills classes, community resources, and gainful local employment in Morgan County and surrounding North Alabama areas.',
  },
  {
    question: 'Can my children or family visit me while I live at TLC?',
    answer:
      'Yes. Restoring broken family relationships is close to our heart. Alongside structured visitation guidelines, we host Monthly Family & Community Fellowship Days filled with food, laughter, and fellowship where parents, children, loved ones, and supporters are warmly welcomed.',
  },
  {
    question: 'Can a caseworker, probation officer, or family member apply on someone’s behalf?',
    answer:
      'Yes. You can choose "Assisting a loved one or client" in Step 1 of our online application, select either Women’s Housing (Somerville) or Men’s Josiah House (Hartselle), or call Crystal 24/7 at (256) 445-0553. Because recovery begins with personal willingness, Crystal will also ask to speak directly with the prospective resident before confirming a bed.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="bg-[#FAF7F2] py-16 sm:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-[#5B7B6D]">
            Common Questions
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#24201E]">
            Honest Answers Before You Call or Apply.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#57514D] leading-relaxed">
            Reaching out for sober living brings up practical questions. If yours isn&rsquo;t answered below, call Crystal anytime at{' '}
            <a
              href="tel:+12564450553"
              className="font-semibold text-[#2C4A3E] underline decoration-[#C98A3A] underline-offset-4"
            >
              (256) 445-0553
            </a>
            .
          </p>
        </div>

        <div className="mt-10 border-t border-[#E4DDD1]">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.question} className="border-b border-[#E4DDD1]">
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] rounded"
                >
                  <span className="font-serif text-lg sm:text-xl font-semibold text-[#24201E] group-hover:text-[#2C4A3E] transition-colors">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#57514D] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#B85D43]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="pb-6 pr-6 text-base leading-relaxed text-[#57514D]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface SiteFooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenPhotos: () => void;
}

export function SiteFooter({ onNavigateSection, onOpenPhotos }: SiteFooterProps) {
  return (
    <footer className="bg-[#F2ECE1] border-t border-[#E4DDD1] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-[#E4DDD1]">
          {/* Brand & Nonprofit Mission */}
          <div className="md:col-span-5">
            <p className="font-serif text-2xl font-semibold text-[#24201E]">
              TLC Recovery House
            </p>
            <p className="mt-1 text-sm font-medium text-[#5B7B6D]">
              We Do Recover Together — Never Alone
            </p>
            <p className="mt-4 text-sm text-[#57514D] leading-relaxed max-w-md">
              A peer-led 12-step sober living network for women and men across North Alabama—rooted in unconditional love, daily accountability, and lifelong fellowship.
            </p>
          </div>

          {/* Locations & 24/7 Line */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-semibold tracking-wide text-[#57514D]">
              Locations &amp; 24/7 Admissions Line
            </p>
            <div className="flex items-start gap-2.5 text-sm text-[#24201E]">
              <MapPin className="w-4 h-4 text-[#B85D43] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="block font-semibold">Main Office &amp; Women&rsquo;s Homes</span>
                <span className="text-[#57514D]">681 Taylor Cir, Somerville, AL 35670</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-[#24201E]">
              <MapPin className="w-4 h-4 text-[#5B7B6D] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="block font-semibold">Men&rsquo;s Recovery Home — TLC Josiah House</span>
                <span className="text-[#57514D]">Hartselle, AL</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm pt-1">
              <Phone className="w-4 h-4 text-[#2C4A3E] shrink-0" aria-hidden="true" />
              <a
                href="tel:+12564450553"
                className="font-semibold text-[#2C4A3E] hover:text-[#B85D43] transition-colors underline decoration-[#C98A3A] underline-offset-4"
              >
                (256) 445-0553 (Open 24/7)
              </a>
            </div>
          </div>

          {/* Quick Anchors */}
          <div className="md:col-span-3">
            <p className="text-xs font-semibold tracking-wide text-[#57514D] mb-3">
              Explore
            </p>
            <ul className="space-y-2 text-sm text-[#57514D]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('difference')}
                  className="hover:text-[#2C4A3E] transition-colors"
                >
                  The TLC Difference
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('our-homes')}
                  className="hover:text-[#2C4A3E] transition-colors"
                >
                  Our Homes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('life-at-tlc')}
                  className="hover:text-[#2C4A3E] transition-colors"
                >
                  Life &amp; Community
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPhotos}
                  className="hover:text-[#2C4A3E] transition-colors"
                >
                  Photos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('apply')}
                  className="hover:text-[#2C4A3E] transition-colors"
                >
                  Apply for Residency
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('support')}
                  className="hover:text-[#2C4A3E] transition-colors"
                >
                  501(c)(3) Donate &amp; Expand
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#57514D]">
          <p>
            TLC Recovery House is a registered 501(c)(3) nonprofit organization · Somerville &amp; Hartselle, Alabama.
          </p>
          <p>
            © {new Date().getFullYear()} TLC Recovery House. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
